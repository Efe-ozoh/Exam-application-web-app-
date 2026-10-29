export const LEADERBOARD_LIMIT = 5;

const MAX_NAME_LENGTH = 40;
const FALLBACK_NAME = "JAMB Student";

const EMAIL_PATTERN = /@/;
const PHONE_PATTERN = /^[+\d][\d\s().-]{6,}$/;
const LONG_DIGIT_RUN_PATTERN = /\d{7,}/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toFiniteNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isSafeDisplayName(name) {
  return (
    !EMAIL_PATTERN.test(name) &&
    !PHONE_PATTERN.test(name) &&
    !LONG_DIGIT_RUN_PATTERN.test(name) &&
    !UUID_PATTERN.test(name)
  );
}

function normalizeName(value) {
  const name = typeof value === "string" ? value.trim() : "";

  if (!name || !isSafeDisplayName(name)) return FALLBACK_NAME;

  return name.slice(0, MAX_NAME_LENGTH);
}

function toTimestamp(value) {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

/**
 * Normalizes the rows returned by the leaderboard RPC. The database already
 * applies the ranking rules, but this guards the UI/API boundary against
 * malformed rows, stale function versions, missing display names, and names
 * that contain private identifiers such as emails, phone numbers, or UUIDs.
 *
 * Pass `{ preserveOrder: true }` for responses that already follow the
 * server-side ranking so the earliest-result tie-break is not re-sorted.
 */
export function normalizeLeaderboardRows(value, options = {}) {
  const preserveOrder = options?.preserveOrder === true;
  if (!Array.isArray(value)) return [];

  const entries = [];

  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      continue;
    }

    const rawName =
      typeof row.display_name === "string"
        ? row.display_name.trim()
        : typeof row.name === "string"
          ? row.name.trim()
          : "";
    const score = toFiniteNumber(row.score);
    const total = toFiniteNumber(row.total_marking_score ?? row.total);
    const percentage = toFiniteNumber(row.percentage);

    if (score === null || total === null || percentage === null) {
      continue;
    }

    // Ignore empty attempts and inconsistent historical rows.
    if (
      score < 0 ||
      total <= 0 ||
      score > total ||
      percentage <= 0 ||
      percentage > 100
    ) {
      continue;
    }

    entries.push({
      name: normalizeName(rawName),
      score: Math.round(score),
      total: Math.round(total),
      percentage: Math.round(percentage * 10) / 10,
      achievedAt: toTimestamp(row.created_at),
    });
  }

  // The SQL function is authoritative. Sorting here keeps raw RPC responses
  // deterministic; the browser preserves that order so an equal-score tie is
  // resolved by the server's earliest-result rule.
  if (!preserveOrder) {
    entries.sort(
      (a, b) =>
        b.percentage - a.percentage ||
        b.score - a.score ||
        a.achievedAt - b.achievedAt ||
        a.name.localeCompare(b.name),
    );
  }

  return entries
    .slice(0, LEADERBOARD_LIMIT)
    .map(({ achievedAt, ...entry }) => entry);
}
