import Link from "next/link";
import { redirect } from "next/navigation";

import AiTutorCard from "@/components/dashboard/AiTutorCard";
import PracticeHistoryError from "@/components/dashboard/PracticeHistoryError";
import RecentPracticeScores from "@/components/dashboard/RecentPracticeScores";
import StatCard from "@/components/dashboard/StatCard";
import {
  ClipboardIcon,
  PlayIcon,
  TrendingIcon,
  TrophyIcon,
} from "@/components/dashboard/DashboardIcons";
import { getActiveExamSession } from "@/lib/exam/sessions";
import { clampPercentage, normalizeSubjectScores } from "@/lib/practice/results";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Eduliver",
};

function getDisplayName(user) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student"
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  let aiTutorLocked = false;

  try {
    const activeExam = await getActiveExamSession(supabase, user.id);

    if (activeExam.ok) {
      aiTutorLocked = Boolean(activeExam.session);
    } else if (!activeExam.missingMigration) {
      console.error("Unable to load active exam status:", activeExam.message);
    }
  } catch (error) {
    console.error("Unable to load active exam status:", error);
  }

  let recentResults = [];
  let totalPractices = 0;
  let bestPercentage = 0;
  let loadError = false;

  try {
    // Practice history is user data and lives in Supabase. Load the newest
    // page, the total count, and the best percentage in parallel.
    const [resultsResponse, countResponse, bestResponse] = await Promise.all([
      supabase
        .from("practice_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("practice_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("practice_results")
        .select("percentage")
        .eq("user_id", user.id)
        .order("percentage", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const queryError =
      resultsResponse.error || countResponse.error || bestResponse.error;

    if (queryError) {
      throw queryError;
    }

    const results = resultsResponse.data ?? [];

    // Normalize database rows once so the presentational components only deal
    // with the camelCase, numeric shape used by the dashboard.
    recentResults = results.map((item) => ({
      id: item.id,
      examType: item.exam_type || "Practice",
      year: item.year ?? null,
      subjects: Array.isArray(item.subjects) ? item.subjects : [],
      score: Number(item.score) || 0,
      totalMarkingScore: Number(item.total_marking_score) || 0,
      totalQuestions: Number(item.total_questions) || 0,
      correctCount: Number(item.correct_count) || 0,
      percentage: clampPercentage(item.percentage),
      subjectScores: normalizeSubjectScores(item.subject_scores),
      createdAt: item.created_at
        ? new Date(item.created_at).toISOString()
        : null,
    }));

    totalPractices = countResponse.count ?? 0;
    bestPercentage = clampPercentage(bestResponse.data?.percentage);
  } catch (error) {
    console.error("Unable to load dashboard results:", error);
    loadError = true;
  }

  const hasHistory = !loadError && totalPractices > 0;
  const latest = recentResults[0] ?? null;

  const latestValue = loadError
    ? "—"
    : latest
      ? `${Math.round(latest.percentage)}%`
      : "0%";
  const latestHint = loadError
    ? "Unavailable right now"
    : latest
      ? latest.totalMarkingScore > 0
        ? `${latest.score} / ${latest.totalMarkingScore} marks`
        : `${latest.score} marks`
      : "No completed practice yet";

  const bestValue = loadError
    ? "—"
    : hasHistory
      ? `${Math.round(bestPercentage)}%`
      : "0%";
  const bestHint = loadError
    ? "Unavailable right now"
    : hasHistory
      ? "Your highest score so far"
      : "Complete a practice to set a best score";

  const practicesValue = loadError ? "—" : String(totalPractices);
  const practicesHint = loadError
    ? "Unavailable right now"
    : hasHistory
      ? "Completed sessions"
      : "No sessions yet";

  return (
    <main className="min-h-screen bg-blue-50 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="mt-2 break-words text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Welcome back, {getDisplayName(user)}
            </h1>
            <p className="mt-2 break-all text-sm text-slate-600">{user.email}</p>
          </div>

          <Link
            href="/exam_option"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto"
          >
            <PlayIcon />
            Start a practice
          </Link>
        </header>

        <section
          aria-label="Practice statistics"
          className="mt-8 grid gap-4 sm:grid-cols-3"
        >
          <StatCard
            label="Latest score"
            value={latestValue}
            hint={latestHint}
            icon={<TrendingIcon />}
            unavailable={loadError}
          />
          <StatCard
            label="Best score"
            value={bestValue}
            hint={bestHint}
            icon={<TrophyIcon />}
            unavailable={loadError}
          />
          <StatCard
            label="Practices"
            value={practicesValue}
            hint={practicesHint}
            icon={<ClipboardIcon />}
            unavailable={loadError}
          />
        </section>

        <AiTutorCard locked={aiTutorLocked} />

        {loadError ? (
          <PracticeHistoryError />
        ) : (
          <RecentPracticeScores results={recentResults} />
        )}
      </div>
    </main>
  );
}
