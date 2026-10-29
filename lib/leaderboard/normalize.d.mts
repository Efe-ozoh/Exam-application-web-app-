export const LEADERBOARD_LIMIT: number;

export type LeaderboardEntry = {
  name: string;
  score: number;
  total: number;
  percentage: number;
};

export type NormalizeLeaderboardOptions = {
  preserveOrder?: boolean;
};

export function normalizeLeaderboardRows(
  value: unknown,
  options?: NormalizeLeaderboardOptions,
): LeaderboardEntry[];
