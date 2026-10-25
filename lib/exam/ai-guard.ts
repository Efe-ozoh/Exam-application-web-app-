import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getActiveExamSession } from "./sessions";

export const EXAM_ACTIVE_CODE = "exam_active";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Returns a response when AI features must be blocked, or null when the
 * student has no active formal examination.
 *
 * The check reads the server-side `exam_sessions` table for the authenticated
 * user. It deliberately ignores any client-provided exam flags so direct API
 * calls cannot unlock AI during an exam.
 */
export async function getAiExamRestriction(
  supabase: SupabaseClient,
  userId: string,
) {
  const result = await getActiveExamSession(supabase, userId);

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        code: result.missingMigration
          ? "exam_protection_unavailable"
          : "exam_status_unavailable",
        message: result.missingMigration
          ? "AI exam protection is not configured yet. Apply the latest Supabase migration."
          : "We couldn't verify your examination status. Please try again.",
      },
      { status: 503, headers: NO_STORE },
    );
  }

  if (result.session) {
    return NextResponse.json(
      {
        success: false,
        code: EXAM_ACTIVE_CODE,
        message:
          "AI help is locked while you have an examination in progress. Submit your examination to unlock it.",
      },
      { status: 403, headers: NO_STORE },
    );
  }

  return null;
}
