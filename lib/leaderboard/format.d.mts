export type LeaderboardScore = {
  score: number;
  total: number;
  percentage: number;
};

export function formatLeaderboardPercentage(value: number): string;

export function formatLeaderboardScore(entry: LeaderboardScore): string;
