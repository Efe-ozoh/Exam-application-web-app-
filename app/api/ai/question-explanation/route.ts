import { NextResponse } from "next/server";

import { getGeminiSettings } from "@/lib/ai/config";
import { AiServiceError, generateTutorReply } from "@/lib/ai/gemini";
import { parseQuestionAiRequest } from "@/lib/ai/messages";
import {
  buildQuestionExplanationInstruction,
  type TrustedQuestion,
} from "@/lib/ai/prompts";
import {
  getAskUsage,
  reserveAskMessage,
  type StudyUsage,
} from "@/lib/ai/usage";
import { getAiExamRestriction } from "@/lib/exam/ai-guard";
import connectDB from "@/lib/mongoose";
import Question from "@/lib/models/question.schema.jsx";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ANSWERS = ["A", "B", "C", "D"] as const;

function providerStatus(error: AiServiceError) {
  return error.kind === "config" ||
    error.kind === "model" ||
    error.kind === "rate_limited"
    ? 503
    : 502;
}

function providerMessage(error: AiServiceError) {
  if (error.kind === "config") {
    return "The AI assistant is not configured correctly. Please contact support.";
  }

  if (error.kind === "model") {
    return "The configured AI model is currently unavailable. Please contact support.";
  }

  if (error.kind === "rate_limited") {
    return "The AI service is busy right now. Please try again in a moment.";
  }

  return "The AI tutor couldn't explain this question just now. Please try again.";
}

function usageErrorResponse(message: string, missingMigration: boolean) {
  return NextResponse.json(
    {
      success: false,
      message,
      code: missingMigration ? "migration_required" : "usage_unavailable",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function toTrustedQuestion(question: Record<string, unknown>) {
  const options =
    question.options && typeof question.options === "object"
      ? (question.options as Record<string, unknown>)
      : null;
  const answer =
    typeof question.answer === "string"
      ? question.answer.trim().toUpperCase()
      : "";
  const questionText =
    typeof question.question === "string" ? question.question.trim() : "";
  const exam = typeof question.exam === "string" ? question.exam.trim() : "";
  const subject =
    typeof question.subject === "string" ? question.subject.trim() : "";

  if (
    !options ||
    !questionText ||
    !exam ||
    !subject ||
    !ANSWERS.every(
      (letter) =>
        typeof options[letter] === "string" &&
        String(options[letter]).trim(),
    ) ||
    !ANSWERS.includes(answer as (typeof ANSWERS)[number])
  ) {
    return null;
  }

  return {
    id: String(question._id ?? ""),
    exam,
    year: Number.isFinite(Number(question.year))
      ? Number(question.year)
      : null,
    subject,
    question: questionText,
    options: {
      A: String(options.A).trim(),
      B: String(options.B).trim(),
      C: String(options.C).trim(),
      D: String(options.D).trim(),
    },
    answer: answer as TrustedQuestion["answer"],
    imgUrl: typeof question.imgUrl === "string" ? question.imgUrl : null,
  } satisfies TrustedQuestion;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 },
      );
    }

    const examRestriction = await getAiExamRestriction(supabase, user.id);

    if (examRestriction) return examRestriction;

    const result = await getAskUsage(supabase);

    if (!result.ok) {
      return usageErrorResponse(result.message, result.missingMigration);
    }

    return NextResponse.json(
      { success: true, usage: result.usage },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Ask AI usage GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "We couldn't check your AI usage right now. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to ask AI about a question.",
        },
        { status: 401 },
      );
    }

    const examRestriction = await getAiExamRestriction(supabase, user.id);

    if (examRestriction) return examRestriction;

    const body = await request.json().catch(() => null);
    const parsed = parseQuestionAiRequest(body);

    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, message: parsed.message },
        { status: 400 },
      );
    }

    const { apiKey } = getGeminiSettings();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: "not_configured",
          message:
            "The AI assistant has not been configured yet. Please contact support.",
        },
        { status: 503 },
      );
    }

    await connectDB();

    const questionDoc = await Question.findById(parsed.value.questionId).lean();

    if (!questionDoc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This question could not be found. It may have been removed from the question bank.",
        },
        { status: 404 },
      );
    }

    const question = toTrustedQuestion(
      questionDoc as Record<string, unknown>,
    );

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This question cannot be explained right now because its data is incomplete.",
        },
        { status: 422 },
      );
    }

    const reservation = await reserveAskMessage(supabase);

    if (!reservation.ok) {
      return usageErrorResponse(
        reservation.message,
        reservation.missingMigration,
      );
    }

    const usage: StudyUsage = reservation.usage;

    if (!usage.allowed) {
      const isCooldown = usage.reason === "cooldown";
      const retryAfter = Math.max(1, usage.cooldownRemaining);

      return NextResponse.json(
        {
          success: false,
          code: isCooldown ? "cooldown" : "daily_limit_reached",
          message: isCooldown
            ? `Please wait ${retryAfter} second${retryAfter === 1 ? "" : "s"} before sending another AI request.`
            : `You've used all ${usage.limit} Ask AI explanations for today. Your allowance resets tomorrow (Nigerian time).`,
          usage,
        },
        {
          status: 429,
          headers: isCooldown ? { "Retry-After": String(retryAfter) } : undefined,
        },
      );
    }

    const messages = parsed.value.message
      ? [
          ...parsed.value.history,
          { role: "user" as const, content: parsed.value.message },
        ]
      : [
          {
            role: "user" as const,
            content:
              "Please explain this question. Show why the correct answer is right and why the other options are wrong.",
          },
        ];

    try {
      const reply = await generateTutorReply({
        messages,
        systemInstruction: buildQuestionExplanationInstruction(
          question,
          parsed.value.selectedAnswer,
        ),
      });

      return NextResponse.json({
        success: true,
        explanation: reply.text,
        correctAnswer: question.answer,
        model: reply.model,
        usage,
      });
    } catch (error) {
      if (error instanceof AiServiceError) {
        return NextResponse.json(
          {
            success: false,
            code: error.kind,
            message: providerMessage(error),
            usage,
          },
          { status: providerStatus(error) },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Question explanation POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "The AI tutor couldn't explain this question just now. Please try again.",
      },
      { status: 500 },
    );
  }
}
