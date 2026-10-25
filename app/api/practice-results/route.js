import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongoose";
import Question from "@/lib/models/question.schema.jsx";
import { EXAM_MODE_MOCK, normalizeExamMode } from "@/lib/exam/constants";
import { completeActiveExamSession } from "@/lib/exam/sessions";
import {
  MAX_ANSWERS,
  normalizeExamSubjects,
  normalizeSubjectKey,
  toSupportedExamType,
} from "@/lib/practice/constants";
import { normalizeSubjectScores } from "@/lib/practice/results";
import { calculateScore } from "@/utils/scoreCalculator";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const TABLE = "practice_results";
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ANSWERS = ["", "A", "B", "C", "D"];

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function serializeResult(item) {
  return {
    id: item.id,
    examType: item.exam_type || "Practice",
    year: item.year ?? null,
    subjects: Array.isArray(item.subjects) ? item.subjects : [],
    score: Number(item.score) || 0,
    totalMarkingScore: Number(item.total_marking_score) || 0,
    totalQuestions: Number(item.total_questions) || 0,
    correctCount: Number(item.correct_count) || 0,
    percentage: Number(item.percentage) || 0,
    subjectScores: normalizeSubjectScores(item.subject_scores),
    createdAt: item.created_at ?? null,
  };
}

function badRequest(message) {
  return NextResponse.json(
    { success: false, message },
    { status: 400 }
  );
}

export async function POST(request) {
  try {
    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to save a result." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequest("A JSON body is required.");
    }

    const examType = toSupportedExamType(body.examType);

    if (!examType) {
      return badRequest("examType is invalid.");
    }

    const hasYear =
      body.year !== null && body.year !== undefined && body.year !== "";
    const year = hasYear ? toFiniteNumber(body.year) : null;

    if (
      year === null ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 2100
    ) {
      return badRequest("year is invalid.");
    }

    if (!Array.isArray(body.subjects) || body.subjects.length === 0) {
      return badRequest("At least one subject is required.");
    }

    // JAMB requires English plus exactly three other subjects. This is the
    // authoritative check; the browser's subject selector is only guidance.
    const normalizedSelection = normalizeExamSubjects(
      body.subjects,
      examType
    );

    if (!normalizedSelection.ok) {
      return badRequest(normalizedSelection.message);
    }

    const selectedSubjects = normalizedSelection.subjects;
    const selectedSubjectKeys = new Set(
      selectedSubjects.map((subject) => normalizeSubjectKey(subject))
    );

    let examMode = null;

    if (
      body.examMode !== undefined &&
      body.examMode !== null &&
      body.examMode !== ""
    ) {
      examMode = normalizeExamMode(body.examMode);

      if (!examMode) {
        return badRequest("examMode is invalid.");
      }
    }

    let examSessionId = null;

    if (
      body.examSessionId !== undefined &&
      body.examSessionId !== null &&
      body.examSessionId !== ""
    ) {
      if (
        typeof body.examSessionId !== "string" ||
        !UUID_PATTERN.test(body.examSessionId.trim())
      ) {
        return badRequest("examSessionId is invalid.");
      }

      examSessionId = body.examSessionId.trim().toLowerCase();
    }

    if (!Array.isArray(body.answers) || body.answers.length === 0) {
      return badRequest("At least one answer is required.");
    }

    if (body.answers.length > MAX_ANSWERS) {
      return badRequest("You can submit at most 500 answers.");
    }

    const submittedAnswers = [];
    const submittedIds = new Set();

    for (const entry of body.answers) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return badRequest("answers contains an invalid item.");
      }

      if (
        typeof entry.questionId !== "string" ||
        !OBJECT_ID_PATTERN.test(entry.questionId.trim())
      ) {
        return badRequest("answers contains an invalid question ID.");
      }

      const questionId = entry.questionId.trim().toLowerCase();

      if (submittedIds.has(questionId)) {
        return badRequest("answers contains duplicate question IDs.");
      }

      if (typeof entry.answer !== "string") {
        return badRequest("answers contains an invalid answer.");
      }

      const answer = entry.answer.trim().toUpperCase();

      if (!ALLOWED_ANSWERS.includes(answer)) {
        return badRequest("answers contains an unsupported answer.");
      }

      submittedIds.add(questionId);
      submittedAnswers.push({ questionId, answer });
    }

    await connectDB();

    const questionIds = submittedAnswers.map((entry) => entry.questionId);
    const questionDocs = await Question.find({
      _id: { $in: questionIds },
    }).lean();

    if (
      !Array.isArray(questionDocs) ||
      questionDocs.length !== questionIds.length
    ) {
      return badRequest(
        "One or more questions are invalid or no longer available."
      );
    }

    const questionsById = new Map(
      questionDocs.map((question) => [
        String(question._id).toLowerCase(),
        question,
      ])
    );

    if (questionsById.size !== questionIds.length) {
      return badRequest(
        "One or more questions are invalid or no longer available."
      );
    }

    // MongoDB does not preserve the order of an `$in` query. Rebuild the
    // question/answer pairs using the submitted order so the result matches
    // the attempt the student actually completed.
    const orderedQuestions = [];
    const orderedAnswers = [];

    for (const { questionId, answer } of submittedAnswers) {
      const question = questionsById.get(questionId);

      if (!question) {
        return badRequest(
          "One or more questions are invalid or no longer available."
        );
      }

      const questionExamType = String(question.exam ?? "")
        .trim()
        .toUpperCase();

      if (questionExamType !== examType) {
        return badRequest("A question does not belong to this exam type.");
      }

      if (Number(question.year) !== year) {
        return badRequest("A question does not belong to this year.");
      }

      if (!selectedSubjectKeys.has(normalizeSubjectKey(question.subject))) {
        return badRequest("A question does not belong to the selected subjects.");
      }

      orderedQuestions.push({ ...question, exam: examType, year });
      orderedAnswers.push(answer);
    }

    const result = calculateScore(orderedAnswers, orderedQuestions);
    const subjectScores = normalizeSubjectScores(result.subjectScores);
    const correctCount = result.breakdown.filter(
      (item) => item.isCorrect
    ).length;

    const savedSubjects = subjectScores.length
      ? subjectScores.map((subject) => subject.subject)
      : selectedSubjects;

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: user.id,
        exam_type: examType,
        year,
        subjects: savedSubjects,
        score: Math.max(0, Math.round(result.score)),
        total_marking_score: Math.max(0, Math.round(result.totalMarkingScore)),
        total_questions: result.total,
        correct_count: correctCount,
        percentage: Math.min(
          100,
          Math.max(0, Math.round(result.percentage * 10) / 10)
        ),
        subject_scores: subjectScores,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // AI help stays locked until a formal exam session is linked to the saved
    // result. If completion fails, the result is still preserved but the
    // client is told not to unlock AI yet.
    let examSessionCompleted = true;

    if (examMode === EXAM_MODE_MOCK) {
      examSessionCompleted = false;

      if (examSessionId) {
        const completion = await completeActiveExamSession(supabase, {
          userId: user.id,
          sessionId: examSessionId,
          resultId: data.id,
          examType,
          year,
          subjects: selectedSubjects,
        });

        examSessionCompleted = completion.ok;

        if (!completion.ok) {
          console.error(
            "Exam session completion failed:",
            completion.reason ?? "unknown"
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        result: serializeResult(data),
        examSessionCompleted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Practice result POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save this practice result." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(requestedLimit)))
      : DEFAULT_LIMIT;

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      results: (data ?? []).map(serializeResult),
    });
  } catch (error) {
    console.error("Practice result GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load practice results." },
      { status: 500 }
    );
  }
}
