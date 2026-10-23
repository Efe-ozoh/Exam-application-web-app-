import RetryButton from "./RetryButton";
import { AlertIcon } from "./DashboardIcons";

// Shown when the Supabase history query fails, while the summary cards keep
// their placeholders visible above.
export default function PracticeHistoryError() {
  return (
    <section
      role="alert"
      className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <AlertIcon />
        </span>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">
            We couldn&apos;t load your practice history
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            This is usually a temporary connection problem. Retry in a moment,
            and your scores will appear here.
          </p>
          <RetryButton />
        </div>
      </div>
    </section>
  );
}
