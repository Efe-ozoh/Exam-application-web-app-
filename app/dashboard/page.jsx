import Link from "next/link";
import { redirect } from "next/navigation";

import connectDB from "@/lib/mongoose";
import PracticeResult from "@/lib/models/practice-result.schema";
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

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
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
  let loadError = false;

  try {
    await connectDB();

    const [results, count] = await Promise.all([
      PracticeResult.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      PracticeResult.countDocuments({ userId: user.id }),
    ]);

    recentResults = results.map((item) => ({
      id: String(item._id),
      examType: item.examType || "Practice",
      year: item.year ?? null,
      subjects: Array.isArray(item.subjects) ? item.subjects : [],
      score: Number(item.score) || 0,
      totalMarkingScore: Number(item.totalMarkingScore) || 0,
      totalQuestions: Number(item.totalQuestions) || 0,
      correctCount: Number(item.correctCount) || 0,
      percentage: clampPercentage(item.percentage),
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString()
        : null,
    }));

    totalPractices = count;
  } catch (error) {
    console.error("Unable to load dashboard results:", error);
    loadError = true;
  }

  const latest = recentResults[0] ?? null;
  const bestPercentage = recentResults.reduce(
    (best, item) => Math.max(best, item.percentage),
    0
  );

  return (
    <main className="min-h-screen bg-blue-50 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
              Student Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Welcome back, {getDisplayName(user)}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          </div>

          <Link
            href="/exam_option"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            Start a practice
          </Link>
        </header>

        {loadError && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-4 text-sm text-slate-700">
            We could not load your practice history right now. Please refresh
            the page in a moment.
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Latest score"
            value={latest ? `${Math.round(latest.percentage)}%` : "—"}
            hint={
              latest
                ? latest.totalMarkingScore > 0
                  ? `${latest.score} / ${latest.totalMarkingScore} marks`
                  : `${latest.score} marks`
                : "No completed practice yet"
            }
          />
          <StatCard
            label="Best score"
            value={recentResults.length ? `${Math.round(bestPercentage)}%` : "—"}
            hint="Across your recent practice"
          />
          <StatCard
            label="Practices"
            value={String(totalPractices)}
            hint="Completed sessions"
          />
        </section>

        {latest && (
          <section className="mt-6 overflow-hidden rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                  Most recent practice
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {latest.examType}
                  {latest.year ? ` · ${latest.year}` : ""}
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  {latest.subjects.length
                    ? latest.subjects.join(", ")
                    : "All subjects"}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-4xl font-bold">
                  {Math.round(latest.percentage)}%
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {latest.correctCount} of {latest.totalQuestions} correct
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-blue-800/60">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${latest.percentage}%` }}
              />
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent practice scores
            </h2>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              {recentResults.length
                ? `Last ${recentResults.length} attempts`
                : "No attempts yet"}
            </span>
          </div>

          {loadError ? (
            <p className="mt-6 rounded-xl bg-blue-50 p-6 text-center text-sm text-slate-600">
              Your practice history could not be loaded. Refresh the page to
              try again.
            </p>
          ) : recentResults.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">
                Your practice history starts here
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Pick a subject and complete a practice session. Your score will
                appear here so you can track your progress.
              </p>
              <Link
                href="/exam_option"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Choose a subject
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-blue-50">
              {recentResults.map((item) => (
                <li key={item.id} className="py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.examType}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {item.subjects.length
                          ? item.subjects.join(", ")
                          : "All subjects"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xl font-bold text-blue-700">
                        {Math.round(item.percentage)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.score}
                        {item.totalMarkingScore > 0
                          ? ` / ${item.totalMarkingScore}`
                          : ""}{" "}
                        marks · {item.correctCount}/{item.totalQuestions}{" "}
                        correct
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-50">
                    <div
                      className="h-full rounded-full bg-blue-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
