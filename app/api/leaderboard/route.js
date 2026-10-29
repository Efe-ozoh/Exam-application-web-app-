import { NextResponse } from "next/server";

import {
  LEADERBOARD_LIMIT,
  normalizeLeaderboardRows,
} from "@/lib/leaderboard/normalize.mjs";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const SUCCESS_CACHE =
  "public, max-age=60, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.rpc(
      "get_all_time_jamb_leaderboard",
      { p_limit: LEADERBOARD_LIMIT },
    );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        leaderboard: normalizeLeaderboardRows(data),
      },
      {
        headers: {
          "Cache-Control": SUCCESS_CACHE,
        },
      },
    );
  } catch (error) {
    console.error("All-time JAMB leaderboard GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the all-time leaderboard.",
        leaderboard: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
