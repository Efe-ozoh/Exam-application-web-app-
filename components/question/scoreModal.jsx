import Link from "next/link";

import { formatMarks } from "@/lib/practice/results";

function getCorrectCount(result) {
  if (Array.isArray(result?.breakdown)) {
    return result.breakdown.filter((item) => item?.isCorrect).length;
  }

  const count = Number(result?.correctCount);
  return Number.isFinite(count) ? count : 0;
}

function getSubjectScores(result) {
  return Array.isArray(result?.subjectScores) ? result.subjectScores : [];
}

const ScoreModal = ({ open, onClose, result, saveError }) => {
  if (!open || !result) return null;

  const score = Number(result.score) || 0;
  const totalMarkingScore = Number(result.totalMarkingScore) || 0;
  const percentage = Number(result.percentage) || 0;
  const totalQuestions = Number(result.total) || 0;
  const correctCount = getCorrectCount(result);
  const subjectScores = getSubjectScores(result);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl animate-scaleIn sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close score summary"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl leading-none text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          &times;
        </button>

        <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800 px-5 py-7 text-center text-white shadow-lg sm:px-6 sm:py-8">
          <h2
            id="score-modal-title"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100"
          >
            Your exam score
          </h2>

          <div className="mt-3 flex items-end justify-center gap-2">
            <span className="text-6xl font-black leading-none tracking-tight sm:text-7xl">
              {formatMarks(score)}
            </span>
            {totalMarkingScore > 0 && (
              <span className="pb-1 text-xl font-semibold text-blue-100 sm:text-2xl">
                / {formatMarks(totalMarkingScore)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-blue-50">
              {formatMarks(percentage)}% overall
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-blue-50">
              {formatMarks(correctCount)} of {formatMarks(totalQuestions)} correct
            </span>
          </div>
        </div>

        {saveError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {saveError}
          </p>
        )}

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Subject breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Marks and correct answers for each subject.
              </p>
            </div>

            {totalMarkingScore > 0 && (
              <p className="shrink-0 text-right text-xs text-slate-500">
                Total
                <span className="mt-0.5 block text-sm font-bold text-slate-900">
                  {formatMarks(score)} / {formatMarks(totalMarkingScore)}
                </span>
              </p>
            )}
          </div>

          {subjectScores.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {subjectScores.map((subject) => {
                const subjectPercentage = Math.min(
                  100,
                  Math.max(0, Number(subject.percentage) || 0)
                );

                return (
                  <li
                    key={subject.subject}
                    className="rounded-xl border border-slate-200 bg-white p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold text-slate-900"
                          title={subject.subject}
                        >
                          {subject.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatMarks(subject.correctCount)} of{" "}
                          {formatMarks(subject.totalQuestions)} correct
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-blue-700">
                          {formatMarks(subject.score)} /{" "}
                          {formatMarks(subject.maxScore)}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {formatMarks(subjectPercentage)}%
                        </p>
                      </div>
                    </div>

                    <div
                      role="progressbar"
                      aria-label={`Score for ${subject.subject}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(subjectPercentage)}
                      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-100"
                    >
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width]"
                        style={{ width: `${subjectPercentage}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Subject details were not recorded for this attempt.
            </p>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            See Corrections
          </button>

          <Link
            href="/exam_option"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
