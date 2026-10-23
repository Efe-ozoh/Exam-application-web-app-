// A single summary metric in the dashboard's practice statistics row.
export default function StatCard({
  label,
  value,
  hint,
  icon,
  unavailable = false,
}) {
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
