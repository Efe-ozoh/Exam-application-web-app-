
export default function SubjectButton({
  name,
  selected,
  disabled,
  onToggle,
  compulsory = false,
}) {
  const isDisabled = disabled || compulsory;

  return (
    <button
      type="button"
      onClick={() => {
        if (!compulsory) onToggle(name);
      }}
      disabled={isDisabled}
      aria-pressed={selected}
      aria-label={compulsory ? `${name} (compulsory)` : undefined}
      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1
        ${
          selected
            ? "bg-indigo-600 text-white shadow"
            : "border-gray-200 bg-white text-gray-700"
        }
        ${
          compulsory
            ? "cursor-not-allowed ring-1 ring-indigo-300"
            : isDisabled
              ? "cursor-not-allowed opacity-50"
              : "hover:scale-[1.02]"
        }
      `}
    >
      <span className="truncate">{name}</span>
      {compulsory ? (
        <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Compulsory
        </span>
      ) : null}
    </button>
  );
  }