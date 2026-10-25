import { NextResponse } from "next/server";

import { getGeminiSettings } from "@/lib/ai/config";
import { AiServiceError, generateTutorReply } from "@/lib/ai/gemini";
import { parseStudyAssistantRequest } from "@/lib/ai/messages";
import {
  STUDY_ASSISTANT_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts";
import {
  getStudyUsage,
  reserveStudyMessage,
  type StudyUsage,
} from "@/lib/ai/usage";
import { getAiExamRestriction } from "@/lib/exam/ai-guard";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

function providerStatus(error: AiServiceError) {
  return error.kind === "config" ||
    error.kind === "model" ||
    error.kind === "rate_limited"
    ? 503
    : 502;
}

function providerMessage(error: AiServiceError) {
  if (error.kind === "config") {
    return "The AI Study Assistant is not configured correctly. Please contact support.";
  }

  if (error.kind === "model") {
    return "The configured AI model is currently unavailable. Please contact support.";
  }

  if (error.kind === "rate_limited") {
    return "The AI service is busy right now. Please try again in a moment.";
  }

  return "The AI tutor couldn't answer just now. Please try again.";
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

    const result = await getStudyUsage(supabase);

    if (!result.ok) {
      return usageErrorResponse(result.message, result.missingMigration);
    }

    return NextResponse.json(
      { success: true, usage: result.usage },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Study assistant usage GET error:", error);

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
        { success: false, message: "You must be signed in to use the AI tutor." },
        { status: 401 },
      );
    }

    const examRestriction = await getAiExamRestriction(supabase, user.id);

    if (examRestriction) return examRestriction;

    const body = await request.json().catch(() => null);
    const parsed = parseStudyAssistantRequest(body);

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
            "The AI Study Assistant has not been configured yet. Please contact support.",
        },
        { status: 503 },
      );
    }

    const reservation = await reserveStudyMessage(supabase);

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
            : `You've used all ${usage.limit} AI Study Assistant messages for today. Your allowance resets tomorrow (Nigerian time).`,
          usage,
        },
        {
          status: 429,
          headers: isCooldown ? { "Retry-After": String(retryAfter) } : undefined,
        },
      );
    }

    try {
      const reply = await generateTutorReply({
        messages: [...parsed.value.history, {
          role: "user",
          content: parsed.value.message,
        }],
        systemInstruction: STUDY_ASSISTANT_SYSTEM_INSTRUCTION,
      });

      return NextResponse.json({
        success: true,
        message: reply.text,
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
    console.error("Study assistant POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "The AI tutor couldn't answer just now. Please try again.",
      },
      { status: 500 },
    );
  }
}
