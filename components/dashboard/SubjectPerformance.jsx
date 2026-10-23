import { formatMarks } from "@/lib/practice/results";

// Renders the per-subject breakdown stored with newer practice results.
// Older rows have no breakdown, so they receive a short fallback message
// instead of an empty section.
export default function SubjectPerformance({ subjectScores }) {
  return (
    <div className="mt-4 rounded-xl bg-blue-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Subject performance
      </p>

      {subjectScores.length > 0 ? (
        <ul className="mt-3 space-y-4">
          {subjectScores.map((subject) => (
            <li key={subject.subject}>
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className="min-w-0 truncate text-sm font-semibold text-slate-900"
                  title={subject.subject}
                >
                  {subject.subject}
                </p>
                <p className="shrink-0 text-sm font-bold text-blue-700">
                  {Math.round(subject.percentage)}%
                </p>
              </div>

              <p className="mt-0.5 text-xs text-slate-500">
                {formatMarks(subject.score)} / {formatMarks(subject.maxScore)}{" "}
                marks · {subject.correctCount} / {subject.totalQuestions} correct
              </p>

              <div
                role="progressbar"
                aria-label={`Score for ${subject.subject}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(subject.percentage)}
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100"
              >
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${subject.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Subject breakdown was not recorded for this earlier attempt.
        </p>
      )}
    </div>
  );
}
