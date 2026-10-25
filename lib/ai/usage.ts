import type { SupabaseClient } from "@supabase/supabase-js";

import { AI_ASK_DAILY_LIMIT, AI_STUDY_DAILY_LIMIT } from "./config";

export type UsageReason = "ok" | "daily_limit" | "cooldown" | "unavailable";

export type StudyUsage = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  cooldownRemaining: number;
  reason: UsageReason;
  date: string | null;
};

type UsageResult =
  | { ok: true; usage: StudyUsage }
  | { ok: false; message: string; missingMigration: boolean };

const MISSING_FUNCTION_CODES = new Set(["PGRST202", "42883"]);

function toNonNegativeInteger(value: unknown, fallback: number) {
  const number = Number(value);

  if (!Number.isFinite(number)) return fallback;

  return Math.max(0, Math.floor(number));
}

function normalizeUsage(value: unknown, limit: number): StudyUsage {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const used = toNonNegativeInteger(record.used, 0);
  const effectiveLimit = toNonNegativeInteger(record.limit, limit) || limit;
  const remaining = Math.max(
    0,
    toNonNegativeInteger(record.remaining, effectiveLimit - used),
  );
  const reason =
    record.reason === "daily_limit" ||
    record.reason === "cooldown" ||
    record.reason === "unavailable"
      ? record.reason
      : used < effectiveLimit
        ? "ok"
        : "daily_limit";

  return {
    allowed:
      typeof record.allowed === "boolean"
        ? record.allowed
        : reason === "ok",
    used,
    limit: effectiveLimit,
    remaining,
    cooldownRemaining: toNonNegativeInteger(
      record.cooldown_remaining ?? record.retry_after,
      0,
    ),
    reason,
    date: typeof record.date === "string" ? record.date : null,
  };
}

function handleUsageError(error: unknown): UsageResult {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const missingMigration = MISSING_FUNCTION_CODES.has(code);

  console.error("AI usage lookup failed:", {
    code,
    message:
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "").slice(0, 500)
        : "Unknown usage error",
  });

  return {
    ok: false,
    missingMigration,
    message: missingMigration
      ? "AI usage tracking is not set up yet. Apply the latest Supabase migration."
      : "We couldn't check your AI usage right now. Please try again.",
  };
}

export async function getStudyUsage(
  supabase: SupabaseClient,
): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("get_ai_study_usage");

  if (error) {
    return handleUsageError(error);
  }

  return { ok: true, usage: normalizeUsage(data, AI_STUDY_DAILY_LIMIT) };
}

export async function reserveStudyMessage(
  supabase: SupabaseClient,
): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("reserve_ai_study_message");

  if (error) {
    return handleUsageError(error);
  }

  return { ok: true, usage: normalizeUsage(data, AI_STUDY_DAILY_LIMIT) };
}

export async function getAskUsage(
  supabase: SupabaseClient,
): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("get_ai_ask_usage");

  if (error) {
    return handleUsageError(error);
  }

  return { ok: true, usage: normalizeUsage(data, AI_ASK_DAILY_LIMIT) };
}

export async function reserveAskMessage(
  supabase: SupabaseClient,
): Promise<UsageResult> {
  const { data, error } = await supabase.rpc("reserve_ai_ask_message");

  if (error) {
    return handleUsageError(error);
  }

  return { ok: true, usage: normalizeUsage(data, AI_ASK_DAILY_LIMIT) };
}
