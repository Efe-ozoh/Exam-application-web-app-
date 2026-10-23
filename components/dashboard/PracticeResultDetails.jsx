import { ChevronIcon } from "./DashboardIcons";
import SubjectPerformance from "./SubjectPerformance";

// The expandable "View result" content for one practice attempt. The native
// <details> element preserves the existing disclosure behaviour without
// turning the dashboard into a client component.
export default function PracticeResultDetails({ result, subjectsLabel }) {
  return (
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
            {result.correctCount} of {result.totalQuestions}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Marks
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {result.score}
            {result.totalMarkingScore > 0
              ? ` / ${result.totalMarkingScore}`
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

      <SubjectPerformance subjectScores={result.subjectScores} />
    </details>
  );
}
