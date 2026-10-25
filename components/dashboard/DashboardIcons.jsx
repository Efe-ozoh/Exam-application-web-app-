// Small inline icons used by the dashboard. Keeping them here avoids
// repeating SVG markup inside multiple dashboard components.
const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function TrendingIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

export function TrophyIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="M6 4h12v5a6 6 0 0 1-12 0z" />
      <path d="M6 6H4a2 2 0 0 0 2 4" />
      <path d="M18 6h2a2 2 0 0 1-2 4" />
      <path d="M12 15v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function ClipboardIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="m7 4 13 8-13 8z" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg
      {...iconProps}
      className="disclosure-chevron h-4 w-4 transition-transform duration-150"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function SparklesIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  );
}
