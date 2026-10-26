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
import connectDB from "@/lib/mongoose";
import Question from "@/lib/models/question.schema.jsx";
import {
  normalizeExamSubjects,
  toSupportedExamType,
} from "@/lib/practice/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
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
  const normalizedExamType = toSupportedExamType(examType);
  const parsedYear = Number(params.year);
  const year =
    Number.isInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100
      ? parsedYear
      : null;
  const subjects = parseSubjects(params.subjects);
  const requestedMode =
    normalizeExamMode(params.examMode) ?? DEFAULT_EXAM_MODE;

  let examMode = requestedMode;
  let examSessionId = null;
  let activeExamSession = null;
  let aiLockedByActiveExam = false;
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
        // A student can only have one formal examination in progress. Resume
        // it instead of starting a different paper. Practice remains
        // available, but AI stays locked because the exam is still active.
        aiLockedByActiveExam = true;

        if (isFormalExamMode(requestedMode)) {
          examMode = activeExam.session.mode;
          activeExamSession = activeExam.session;
          examSessionId = isFormalExamMode(activeExam.session.mode)
            ? activeExam.session.id
            : null;
        } else {
          examMode = requestedMode;
        }
      } else if (isFormalExamMode(requestedMode)) {
        if (!normalizedExamType) {
          examStartError = "Please choose a valid exam type.";
        } else if (year === null) {
          examStartError = "Please choose a valid examination year.";
        } else {
          const normalized = normalizeExamSubjects(
            subjects,
            normalizedExamType
          );

          if (!normalized.ok) {
            examStartError = normalized.message;
          } else {
            // Do not create a locked session for a paper with no questions.
            await connectDB();

            const hasQuestions = await Question.exists({
              exam: normalizedExamType,
              year,
              subject: { $in: normalized.subjects },
            });

            if (!hasQuestions) {
              examStartError =
                "No questions are available for this selection. Choose another examination.";
            } else {
              let admin = null;

              try {
                admin = getSupabaseAdminClient();
              } catch (error) {
                console.error("Supabase admin client unavailable:", error);
              }

              if (!admin) {
                examStartError =
                  "We couldn't start a secure examination session. Please try again shortly.";
              } else {
                const created = await createActiveExamSession(
                  supabase,
                  admin,
                  {
                    userId: user.id,
                    examType: normalizedExamType,
                    year,
                    subjects: normalized.subjects,
                    mode: requestedMode,
                  }
                );

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
        activeExamSession={activeExamSession}
        aiLockedByActiveExam={aiLockedByActiveExam}
        examStartError={examStartError}
      />
    </Suspense>
  );
}
