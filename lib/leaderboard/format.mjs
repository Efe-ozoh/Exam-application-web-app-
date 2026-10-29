export function formatLeaderboardPercentage(value) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) return "0%";

  const rounded = Math.round(percentage * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function formatLeaderboardScore(entry) {
  const score = Number(entry?.score);
  const total = Number(entry?.total);

  return `${Number.isFinite(score) ? Math.round(score) : 0}/${
    Number.isFinite(total) ? Math.round(total) : 0
  } (${formatLeaderboardPercentage(entry?.percentage)})`;
}
