import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeSubjectKey } from "@/lib/practice/constants";

import {
  EXAM_MODE_MOCK,
  EXAM_SESSION_STATUS_ACTIVE,
  EXAM_SESSION_STATUS_SUBMITTED,
  normalizeExamMode,
} from "./constants";

export const EXAM_SESSION_TABLE = "exam_sessions";

export type ExamMode = "Mock" | "Practice";

export type ExamSessionRecord = {
  id: string;
  userId: string;
  examType: string;
  year: number | null;
  subjects: string[];
  mode: ExamMode;
  status: string;
  startedAt: string | null;
  submittedAt: string | null;
  practiceResultId: string | null;
};

type SessionResult =
  | { ok: true; session: ExamSessionRecord | null }
  | { ok: false; missingMigration: boolean; message: string };

const MISSING_TABLE_CODES = new Set([
  "42P01",
  "PGRST202",
  "PGRST205",
]);
const UNIQUE_VIOLATION_CODE = "23505";

function errorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
}

function errorMessage(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message?: unknown }).message ?? "")
    : "";
}

export function isMissingExamSessionTable(error: unknown) {
  const code = errorCode(error);
  const message = errorMessage(error).toLowerCase();

  return (
    MISSING_TABLE_CODES.has(code) ||
    message.includes("exam_sessions") &&
      (message.includes("does not exist") ||
        message.includes("schema cache") ||
        message.includes("could not find"))
  );
}

function mapExamSession(row: unknown): ExamSessionRecord | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;

  const record = row as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : "";
  const userId = typeof record.user_id === "string" ? record.user_id : "";
  const examType =
    typeof record.exam_type === "string" ? record.exam_type.trim() : "";
  const mode = normalizeExamMode(record.mode);
  const subjects = Array.isArray(record.subjects)
    ? record.subjects.filter(
        (subject): subject is string => typeof subject === "string",
      )
    : [];
  const yearValue =
    record.year === null || record.year === undefined || record.year === ""
      ? null
      : Number(record.year);
  const year =
    yearValue !== null && Number.isFinite(yearValue) ? yearValue : null;

  if (!id || !userId || !examType || !mode) return null;

  return {
    id,
    userId,
    examType,
    year,
    subjects,
    mode,
    status:
      typeof record.status === "string" ? record.status : EXAM_SESSION_STATUS_ACTIVE,
    startedAt:
      typeof record.started_at === "string" ? record.started_at : null,
    submittedAt:
      typeof record.submitted_at === "string" ? record.submitted_at : null,
    practiceResultId:
      typeof record.practice_result_id === "string"
        ? record.practice_result_id
        : null,
  };
}

function subjectKeySet(subjects: string[]) {
  return new Set(
    subjects.map((subject) => normalizeSubjectKey(subject)).filter(Boolean),
  );
}

function sameSubjectSet(left: string[], right: string[]) {
  const leftKeys = subjectKeySet(left);
  const rightKeys = subjectKeySet(right);

  if (leftKeys.size !== rightKeys.size) return false;

  for (const key of leftKeys) {
    if (!rightKeys.has(key)) return false;
  }

  return true;
}

export async function getActiveExamSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<SessionResult> {
  const { data, error } = await supabase
    .from(EXAM_SESSION_TABLE)
    .select(
      "id, user_id, exam_type, year, subjects, mode, status, started_at, submitted_at, practice_result_id",
    )
    .eq("user_id", userId)
    .eq("status", EXAM_SESSION_STATUS_ACTIVE)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      missingMigration: isMissingExamSessionTable(error),
      message: "We couldn't verify your examination status right now.",
    };
  }

  const session = data ? mapExamSession(data) : null;

  if (data && !session) {
    return {
      ok: false,
      missingMigration: false,
      message: "Your examination session could not be read.",
    };
  }

  return { ok: true, session };
}

export async function createActiveExamSession(
  supabase: SupabaseClient,
  input: {
    userId: string;
    examType: string;
    year: number | null;
    subjects: string[];
    mode?: ExamMode;
  },
): Promise<SessionResult> {
  const existing = await getActiveExamSession(supabase, input.userId);

  if (!existing.ok) return existing;
  if (existing.session) return existing;

  const { data, error } = await supabase
    .from(EXAM_SESSION_TABLE)
    .insert({
      user_id: input.userId,
      exam_type: input.examType,
      year: input.year,
      subjects: input.subjects,
      mode: input.mode ?? EXAM_MODE_MOCK,
      status: EXAM_SESSION_STATUS_ACTIVE,
    })
    .select(
      "id, user_id, exam_type, year, subjects, mode, status, started_at, submitted_at, practice_result_id",
    )
    .single();

  if (error) {
    // A second tab may have created the session between the SELECT and INSERT.
    if (errorCode(error) === UNIQUE_VIOLATION_CODE) {
      const retry = await getActiveExamSession(supabase, input.userId);

      if (retry.ok && retry.session) return retry;
    }

    return {
      ok: false,
      missingMigration: isMissingExamSessionTable(error),
      message: "We couldn't start a secure examination session.",
    };
  }

  const session = mapExamSession(data);

  if (!session) {
    return {
      ok: false,
      missingMigration: false,
      message: "We couldn't start a secure examination session.",
    };
  }

  return { ok: true, session };
}

export async function completeActiveExamSession(
  supabase: SupabaseClient,
  input: {
    userId: string;
    sessionId: string;
    resultId: string;
    examType: string;
    year: number | null;
    subjects: string[];
  },
): Promise<{ ok: boolean; reason?: string }> {
  const { data, error } = await supabase
    .from(EXAM_SESSION_TABLE)
    .select(
      "id, user_id, exam_type, year, subjects, mode, status, started_at, submitted_at, practice_result_id",
    )
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      reason: isMissingExamSessionTable(error)
        ? "migration_required"
        : "lookup_failed",
    };
  }

  const session = data ? mapExamSession(data) : null;

  if (!session) return { ok: false, reason: "not_found" };

  if (session.status === EXAM_SESSION_STATUS_SUBMITTED) {
    return { ok: true };
  }

  if (session.status !== EXAM_SESSION_STATUS_ACTIVE) {
    return { ok: false, reason: "not_active" };
  }

  if (
    session.examType.trim().toUpperCase() !==
    String(input.examType ?? "").trim().toUpperCase()
  ) {
    return { ok: false, reason: "exam_mismatch" };
  }

  if (session.year !== input.year) {
    return { ok: false, reason: "year_mismatch" };
  }

  if (!sameSubjectSet(session.subjects, input.subjects)) {
    return { ok: false, reason: "subjects_mismatch" };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from(EXAM_SESSION_TABLE)
    .update({
      status: EXAM_SESSION_STATUS_SUBMITTED,
      submitted_at: now,
      practice_result_id: input.resultId,
      updated_at: now,
    })
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .eq("status", EXAM_SESSION_STATUS_ACTIVE)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return {
      ok: false,
      reason: isMissingExamSessionTable(updateError)
        ? "migration_required"
        : "update_failed",
    };
  }

  if (!updated) return { ok: false, reason: "update_conflict" };

  return { ok: true };
}
