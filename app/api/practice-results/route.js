import { NextResponse } from "next/server";

import connectDB from "@/lib/mongoose";
import PracticeResult from "@/lib/models/practice-result.schema";
import { createClient } from "@/lib/supabase/server";

const MAX_SUBJECTS = 12;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function serializeResult(item) {
  return {
    id: String(item._id),
    examType: item.examType,
    year: item.year ?? null,
    subjects: Array.isArray(item.subjects) ? item.subjects : [],
    score: Number(item.score) || 0,
    totalMarkingScore: Number(item.totalMarkingScore) || 0,
    totalQuestions: Number(item.totalQuestions) || 0,
    correctCount: Number(item.correctCount) || 0,
    percentage: Number(item.percentage) || 0,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
  };
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to save a result." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "A JSON body is required." },
        { status: 400 }
      );
    }

    const examType = String(body.examType ?? "").trim().slice(0, 40);
    const subjects = Array.isArray(body.subjects)
      ? body.subjects
          .filter((subject) => typeof subject === "string")
          .map((subject) => subject.trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, MAX_SUBJECTS)
      : [];

    const rawYear = body.year;
    const hasYear =
      rawYear !== null && rawYear !== undefined && rawYear !== "";
    const year = hasYear ? toFiniteNumber(rawYear) : null;

    const score = toFiniteNumber(body.score);
    const totalMarkingScore = toFiniteNumber(body.totalMarkingScore);
    const totalQuestions = toFiniteNumber(body.totalQuestions);
    const correctCount = toFiniteNumber(body.correctCount);
    const percentage = toFiniteNumber(body.percentage);

    if (!examType) {
      return NextResponse.json(
        { success: false, message: "examType is required." },
        { status: 400 }
      );
    }

    if (
      hasYear &&
      (year === null || !Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return NextResponse.json(
        { success: false, message: "year is invalid." },
        { status: 400 }
      );
    }

    if (score === null || score < 0) {
      return NextResponse.json(
        { success: false, message: "score is invalid." },
        { status: 400 }
      );
    }

    if (totalMarkingScore === null || totalMarkingScore < 0) {
      return NextResponse.json(
        { success: false, message: "totalMarkingScore is invalid." },
        { status: 400 }
      );
    }

    if (
      totalQuestions === null ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "totalQuestions is invalid." },
        { status: 400 }
      );
    }

    if (
      correctCount === null ||
      !Number.isInteger(correctCount) ||
      correctCount < 0 ||
      correctCount > totalQuestions
    ) {
      return NextResponse.json(
        { success: false, message: "correctCount is invalid." },
        { status: 400 }
      );
    }

    if (percentage === null) {
      return NextResponse.json(
        { success: false, message: "percentage is invalid." },
        { status: 400 }
      );
    }

    await connectDB();

    const saved = await PracticeResult.create({
      userId: user.id,
      userEmail: user.email ?? null,
      examType,
      year,
      subjects,
      score: Math.max(0, Math.round(score)),
      totalMarkingScore: Math.max(0, Math.round(totalMarkingScore)),
      totalQuestions,
      correctCount,
      percentage: Math.min(100, Math.max(0, Math.round(percentage * 10) / 10)),
    });

    return NextResponse.json(
      { success: true, result: serializeResult(saved) },
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
    const user = await getCurrentUser();

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

    await connectDB();

    const results = await PracticeResult.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      results: results.map(serializeResult),
    });
  } catch (error) {
    console.error("Practice result GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load practice results." },
      { status: 500 }
    );
  }
}
