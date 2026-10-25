import { Suspense } from "react";

import QuestionPageSkeleton from "@/components/skeletons/question";
import {
  DEFAULT_EXAM_MODE,
  isFormalExamMode,
  normalizeExamMode,
} from "@/lib/exam/constants";
import {
  createActiveExamSession,
  getActiveExamSession,
} from "@/lib/exam/sessions";
import { normalizeExamSubjects } from "@/lib/practice/constants";
import { createClient } from "@/lib/supabase/server";

import QuestionClient from "./client/QuestionClient";

export const dynamic = "force-dynamic";

function parseSubjects(value) {
  if (typeof value !== "string" || !value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").filter(Boolean);
  }
}

export default async function Page({ searchParams }) {
  const params = (await searchParams) ?? {};
  const examType =
    typeof params.examType === "string" ? params.examType.trim() : "";
  const parsedYear = Number(params.year);
  const year = Number.isInteger(parsedYear) ? parsedYear : null;
  const subjects = parseSubjects(params.subjects);
  const requestedMode =
    normalizeExamMode(params.examMode) ?? DEFAULT_EXAM_MODE;

  let examMode = requestedMode;
  let examSessionId = null;
  let examStartError = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const activeExam = await getActiveExamSession(supabase, user.id);

      if (!activeExam.ok) {
        if (isFormalExamMode(requestedMode)) {
          examStartError = activeExam.missingMigration
            ? "Secure examination sessions are not configured yet. Please ask an administrator to apply the latest Supabase migration."
            : "We couldn't verify your examination status, so this examination cannot start safely. Please try again.";
        }
      } else if (activeExam.session) {
        // Another tab may already have an exam in progress. Reuse that
        // authoritative session so every tab receives the same restriction.
        examMode = activeExam.session.mode;
        examSessionId = activeExam.session.id;
      } else if (isFormalExamMode(requestedMode)) {
        const normalized = normalizeExamSubjects(subjects, examType);

        if (!normalized.ok) {
          examStartError = normalized.message;
        } else {
          const created = await createActiveExamSession(supabase, {
            userId: user.id,
            examType,
            year,
            subjects: normalized.subjects,
            mode: requestedMode,
          });

          if (created.ok && created.session) {
            examSessionId = created.session.id;
          } else {
            examStartError = created.ok
              ? "We couldn't start a secure examination session."
              : created.missingMigration
                ? "Secure examination sessions are not configured yet. Please ask an administrator to apply the latest Supabase migration."
                : created.message;
          }
        }
      }
    }
  } catch (error) {
    console.error("Exam session bootstrap failed:", error);

    if (isFormalExamMode(requestedMode)) {
      examStartError =
        "We couldn't start a secure examination session. Please try again.";
    }
  }

  return (
    <Suspense fallback={<QuestionPageSkeleton />}>
      <QuestionClient
        examMode={examMode}
        examSessionId={examSessionId}
        examStartError={examStartError}
      />
    </Suspense>
  );
}
