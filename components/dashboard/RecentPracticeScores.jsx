import Link from "next/link";

import { PlayIcon } from "./DashboardIcons";
import PracticeResultRow from "./PracticeResultRow";

// The Recent Practice Scores card. It handles both the empty state and the
// list of attempts, while each row owns its own expandable result details.
export default function RecentPracticeScores({ results }) {
  const attemptsLabel = results.length
    ? `Last ${results.length} attempt${results.length === 1 ? "" : "s"}`
    : "No attempts yet";

  return (
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
          {attemptsLabel}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center sm:p-8">
          <h3 className="text-base font-semibold text-slate-900">
            Your practice history starts here
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Pick a subject and complete a practice session. Your score will
            appear here so you can track your progress.
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
          {results.map((result) => (
            <PracticeResultRow key={result.id} result={result} />
          ))}
        </ul>
      )}
    </section>
  );
}
