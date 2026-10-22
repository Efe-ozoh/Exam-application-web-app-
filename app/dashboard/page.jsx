import Link from "next/link";
import { redirect } from "next/navigation";

import RetryButton from "@/components/dashboard/RetryButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Eduliver",
};

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

function clampPercentage(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

function getDisplayName(user) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student"
  );
}

function getSubjectsLabel(subjects) {
  return subjects.length ? subjects.join(", ") : "All subjects";
}

function TrendingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 4h12v5a6 6 0 0 1-12 0z" />
      <path d="M6 6H4a2 2 0 0 0 2 4" />
      <path d="M18 6h2a2 2 0 0 1-2 4" />
      <path d="M12 15v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m7 4 13 8-13 8z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="disclosure-chevron h-4 w-4 transition-transform duration-150"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function StatCard({ label, value, hint, icon, unavailable = false }) {
  return (
    <div className="min-w-0 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </span>
        <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          {label}
        </p>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p
        className={`mt-1 text-sm ${
          unavailable ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {hint}
      </p>
    </div>
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

  let recentResults = [];
  let totalPractices = 0;
  let bestPercentage = 0;
  let loadError = false;

  try {
    // User practice history lives in Supabase. MongoDB stores questions only.
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

  const latestValue = loadError ? "—" : latest ? `${Math.round(latest.percentage)}%` : "0%";
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

        {loadError ? (
          <section
            role="alert"
            className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </span>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">
                  We couldn&apos;t load your practice history
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  This is usually a temporary connection problem. Retry in a
                  moment, and your scores will appear here.
                </p>
                <RetryButton />
              </div>
            </div>
          </section>
        ) : (
          <section
            aria-labelledby="recent-scores-heading"
            className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="recent-scores-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Recent practice scores
              </h2>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                {recentResults.length
                  ? `Last ${recentResults.length} attempt${
                      recentResults.length === 1 ? "" : "s"
                    }`
                  : "No attempts yet"}
              </span>
            </div>

            {recentResults.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center sm:p-8">
                <h3 className="text-base font-semibold text-slate-900">
                  Your practice history starts here
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Pick a subject and complete a practice session. Your score
                  will appear here so you can track your progress.
                </p>
                <Link
                  href="/exam_option"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  <PlayIcon />
                  Choose a subject
                </Link>
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-blue-50">
                {recentResults.map((item) => {
                  const subjectsLabel = getSubjectsLabel(item.subjects);
                  const examLabel = `${item.examType}${
                    item.year ? ` · ${item.year}` : ""
                  }`;

                  return (
                    <li key={item.id} className="py-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">
                            {examLabel}
                          </p>
                          <p
                            className="mt-1 truncate text-sm text-slate-500"
                            title={subjectsLabel}
                          >
                            {subjectsLabel}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:gap-0 sm:text-right">
                          <p className="text-xl font-bold text-blue-700">
                            {Math.round(item.percentage)}%
                          </p>
                          <p className="whitespace-nowrap text-xs text-slate-500">
                            {item.score}
                            {item.totalMarkingScore > 0
                              ? ` / ${item.totalMarkingScore}`
                              : ""}{" "}
                            marks
                          </p>
                        </div>
                      </div>

                      <div
                        role="progressbar"
                        aria-label={`Score for ${examLabel}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.percentage)}
                        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-50"
                      >
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>

                      <details className="result-disclosure mt-3">
                        <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
                          View result
                          <ChevronIcon />
                        </summary>

                        <div className="mt-3 grid gap-4 rounded-xl bg-blue-50/70 p-4 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Correct answers
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {item.correctCount} of {item.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Marks
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {item.score}
                              {item.totalMarkingScore > 0
                                ? ` / ${item.totalMarkingScore}`
                                : ""}{" "}
                              marks
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Subjects
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                              {subjectsLabel}
                            </p>
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
