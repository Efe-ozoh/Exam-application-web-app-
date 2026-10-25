import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Question from "@/lib/models/question.schema.jsx";
import {
  ADMIN_COOKIE_NAME,
  isValidAdminSessionToken,
} from "@/lib/auth/admin-session";
import {
  isJambExamType,
  normalizeExamSubjects,
} from "@/lib/practice/constants";

const allowedAnswers = ["A", "B", "C", "D"];

export async function POST(req) {
  try {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME);

    if (!isValidAdminSessionToken(cookie?.value)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    const { exam, year, subject, question, options, answer, imgUrl } = body;
    const normalizedOptions = options && typeof options === "object" ? options : {};
    const normalizedYear = year === "" || year === null || year === undefined ? null : Number(year);

    if (!exam || !subject || !question) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!allowedAnswers.every((letter) => normalizedOptions[letter] && String(normalizedOptions[letter]).trim())) {
      return NextResponse.json(
        { success: false, message: "All four options are required" },
        { status: 400 }
      );
    }

    if (!answer || !allowedAnswers.includes(answer)) {
      return NextResponse.json(
        { success: false, message: "Correct answer must be one of A, B, C, or D" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      exam: String(exam).trim(),
      subject: String(subject).trim(),
      year: normalizedYear,
      question: String(question).trim(),
      options: {
        A: String(normalizedOptions.A).trim(),
        B: String(normalizedOptions.B).trim(),
        C: String(normalizedOptions.C).trim(),
        D: String(normalizedOptions.D).trim(),
      },
      answer: String(answer).toUpperCase(),
      imgUrl: imgUrl || null,
    });

    return NextResponse.json(
      { success: true, question: newQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const examType = searchParams.get("examType");
    const yearParam = searchParams.get("year");
    const subjectsParam = searchParams.get("subjects");

    let subjects = [];

    if (subjectsParam) {
      try {
        const parsed = JSON.parse(subjectsParam);
        subjects = Array.isArray(parsed) ? parsed : [];
      } catch {
        subjects = [];
      }
    }

    // Keep the JAMB combination authoritative on the server. Three old
    // non-English subjects are normalized with English; any other invalid
    // combination is rejected with a clear message.
    if (isJambExamType(examType)) {
      const normalized = normalizeExamSubjects(subjects, examType);

      if (!normalized.ok) {
        return NextResponse.json(
          { success: false, message: normalized.message },
          { status: 400 }
        );
      }

      subjects = normalized.subjects;
    }

    const query = {};

    if (examType) query.exam = examType;
    if (yearParam) query.year = Number(yearParam);
    if (subjects.length > 0) query.subject = { $in: subjects };

    const questions = await Question.find(query);

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

  