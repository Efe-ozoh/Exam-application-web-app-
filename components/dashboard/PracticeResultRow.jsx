import { formatPracticeDate, getSubjectsLabel } from "@/lib/practice/results";
import PracticeResultDetails from "./PracticeResultDetails";

// One attempt in the Recent Practice Scores list. The summary stays compact,
// while the full result is available through the existing disclosure below.
export default function PracticeResultRow({ result }) {
  const subjectsLabel = getSubjectsLabel(result.subjects);
  const examLabel = `${result.examType}${
    result.year ? ` · ${result.year}` : ""
  }`;

  return (
    <li className="py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{examLabel}</p>
          <p
            className="mt-1 truncate text-sm text-slate-500"
            title={subjectsLabel}
          >
            {subjectsLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatPracticeDate(result.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:gap-0 sm:text-right">
          <p className="text-xl font-bold text-blue-700">
            {Math.round(result.percentage)}%
          </p>
          <p className="whitespace-nowrap text-xs text-slate-500">
            {result.score}
            {result.totalMarkingScore > 0
              ? ` / ${result.totalMarkingScore}`
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
        aria-valuenow={Math.round(result.percentage)}
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-50"
      >
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${result.percentage}%` }}
        />
      </div>

      <PracticeResultDetails
        result={result}
        subjectsLabel={subjectsLabel}
      />
    </li>
  );
}
