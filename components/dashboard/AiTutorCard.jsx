import Link from "next/link";

import { SparklesIcon } from "./DashboardIcons";

export default function AiTutorCard({ locked = false }) {
  return (
    <section
      aria-labelledby="ai-tutor-heading"
      className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <SparklesIcon />
          </span>

          <div className="min-w-0">
            <h2
              id="ai-tutor-heading"
              className="text-lg font-semibold text-slate-900"
            >
              AI Study Tutor
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
              Get help understanding difficult topics, solving problems, and
              preparing for your exams.
            </p>
            {locked ? (
              <p
                role="status"
                className="mt-2 text-sm font-medium text-amber-700"
              >
                Finish and submit your active examination to unlock the AI
                tutor.
              </p>
            ) : null}
          </div>
        </div>

        {locked ? (
          <span
            aria-disabled="true"
            className="inline-flex w-full shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500 sm:w-auto"
          >
            Locked during exam
          </span>
        ) : (
          <Link
            href="/study-assistant"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto"
          >
            Use AI Tutor
          </Link>
        )}
      </div>
    </section>
  );
}
