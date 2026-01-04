
export default function SubjectButton({ name, selected, disabled, onToggle }) {
    return (
      <button
        type="button"
        onClick={() => onToggle(name)}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 
          ${selected ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-700 border-gray-200"}
          ${disabled && !selected ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}
        `}
        aria-pressed={selected}
      >
        <span className="truncate">{name}</span>
      </button>
    );
  }