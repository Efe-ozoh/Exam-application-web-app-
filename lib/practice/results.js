const MAX_PERCENTAGE = 100;
const marksFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
});
const practiceDateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toNonNegativeNumber(value) {
  const number = toFiniteNumber(value);
  return number !== null && number >= 0 ? number : null;
}

function toNonNegativeInteger(value) {
  const number = toFiniteNumber(value);
  return number !== null && Number.isInteger(number) && number >= 0
    ? number
    : null;
}

// Keep every percentage rendered by the dashboard inside the valid range.
export function clampPercentage(value) {
  const number = toFiniteNumber(value);
  if (number === null) return 0;
  return Math.min(MAX_PERCENTAGE, Math.max(0, number));
}

export function formatPracticeDate(value) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : practiceDateFormatter.format(date);
}

export function getSubjectsLabel(subjects) {
  return Array.isArray(subjects) && subjects.length
    ? subjects.join(", ")
    : "All subjects";
}

/**
 * Converts the JSONB `subject_scores` payload into the camelCase shape used by
 * the dashboard. Historical rows may be NULL, empty or malformed, so invalid
 * entries are skipped instead of breaking the whole result.
 */
export function normalizeSubjectScores(value) {
  if (!Array.isArray(value)) return [];

  const seenSubjects = new Set();
  const scores = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }

    const subject =
      typeof entry.subject === "string" ? entry.subject.trim() : "";
    if (!subject) continue;

    const score = toNonNegativeNumber(entry.score);
    const maxScore = toNonNegativeNumber(entry.maxScore);
    const correctCount = toNonNegativeInteger(entry.correctCount);
    const totalQuestions = toNonNegativeInteger(entry.totalQuestions);

    if (
      score === null ||
      maxScore === null ||
      correctCount === null ||
      totalQuestions === null ||
      totalQuestions === 0 ||
      correctCount > totalQuestions
    ) {
      continue;
    }

    const key = subject.toLowerCase();
    if (seenSubjects.has(key)) continue;
    seenSubjects.add(key);

    const rawPercentage = toFiniteNumber(entry.percentage);
    const percentage =
      rawPercentage === null
        ? maxScore > 0
          ? (score / maxScore) * 100
          : 0
        : rawPercentage;

    scores.push({
      subject,
      score,
      maxScore,
      correctCount,
      totalQuestions,
      percentage: clampPercentage(percentage),
    });
  }

  return scores;
}

export function formatMarks(value) {
  const number = toNonNegativeNumber(value);
  return marksFormatter.format(number ?? 0);
}
