import test from "node:test";
import assert from "node:assert/strict";

import {
  formatLeaderboardPercentage,
  formatLeaderboardScore,
} from "../lib/leaderboard/format.mjs";
import {
  LEADERBOARD_LIMIT,
  normalizeLeaderboardRows,
} from "../lib/leaderboard/normalize.mjs";

test("ranks by percentage, score, then earliest result", () => {
  const entries = normalizeLeaderboardRows([
    {
      display_name: "Later",
      score: 360,
      total_marking_score: 400,
      percentage: 90,
      created_at: "2026-02-02T00:00:00Z",
    },
    {
      display_name: "Earlier",
      score: 360,
      total_marking_score: 400,
      percentage: 90,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      display_name: "Higher",
      score: 364,
      total_marking_score: 400,
      percentage: 91,
      created_at: "2026-03-01T00:00:00Z",
    },
  ]);

  assert.deepEqual(
    entries.map((entry) => entry.name),
    ["Higher", "Earlier", "Later"],
  );
});

test("uses the saved denominator instead of assuming 400", () => {
  const entries = normalizeLeaderboardRows([
    {
      display_name: "Legacy",
      score: 270,
      total_marking_score: 300,
      percentage: 90,
      created_at: "2026-01-01T00:00:00Z",
    },
  ]);

  assert.equal(entries[0].score, 270);
  assert.equal(entries[0].total, 300);
  assert.equal(entries[0].percentage, 90);
});

test("limits the banner to five entries", () => {
  const rows = Array.from({ length: 8 }, (_, index) => ({
    display_name: `Student ${index}`,
    score: 400 - index,
    total_marking_score: 400,
    percentage: 100 - index,
    created_at: `2026-01-0${index + 1}T00:00:00Z`,
  }));

  assert.equal(normalizeLeaderboardRows(rows).length, LEADERBOARD_LIMIT);
});

test("drops malformed, zero, and impossible results", () => {
  const entries = normalizeLeaderboardRows([
    null,
    {},
    { display_name: "Zero", score: 0, total_marking_score: 0, percentage: 0 },
    { display_name: "Over", score: 401, total_marking_score: 400, percentage: 99 },
    { display_name: "OverPercent", score: 300, total_marking_score: 400, percentage: 120 },
    { display_name: "Missing", score: 300, total_marking_score: 400 },
    { display_name: "Empty", score: "", total_marking_score: 400, percentage: 80 },
    { display_name: "Text", score: "bad", total_marking_score: 400, percentage: 80 },
    { display_name: "Valid", score: 320, total_marking_score: 400, percentage: 80 },
  ]);

  assert.deepEqual(
    entries.map((entry) => entry.name),
    ["Valid"],
  );
});

test("uses a privacy-preserving fallback name", () => {
  const entries = normalizeLeaderboardRows([
    {
      display_name: "   ",
      score: 300,
      total_marking_score: 400,
      percentage: 75,
    },
  ]);

  assert.equal(entries[0].name, "JAMB Student");
});

test("returns only the fields the banner needs", () => {
  const [entry] = normalizeLeaderboardRows([
    {
      display_name: "Ada",
      score: 340,
      total_marking_score: 400,
      percentage: 85,
      created_at: "2026-01-01T00:00:00Z",
      user_id: "private-id",
      email: "private@example.com",
    },
  ]);

  assert.deepEqual(Object.keys(entry).sort(), [
    "name",
    "percentage",
    "score",
    "total",
  ]);
});

test("returns an empty list for missing or malformed data", () => {
  assert.deepEqual(normalizeLeaderboardRows(null), []);
  assert.deepEqual(normalizeLeaderboardRows({}), []);
  assert.deepEqual(normalizeLeaderboardRows([]), []);
});

test("accepts already-normalized API entries", () => {
  const entries = normalizeLeaderboardRows([
    { name: "Ada", score: 340, total: 400, percentage: 85 },
    { name: "Efe", score: 348, total: 400, percentage: 87 },
  ]);

  assert.deepEqual(entries, [
    { name: "Efe", score: 348, total: 400, percentage: 87 },
    { name: "Ada", score: 340, total: 400, percentage: 85 },
  ]);
});

test("preserves the server ranking order when requested", () => {
  const entries = normalizeLeaderboardRows(
    [
      {
        name: "Server Second",
        score: 300,
        total: 400,
        percentage: 75,
      },
      {
        name: "Server First",
        score: 300,
        total: 400,
        percentage: 75,
      },
    ],
    { preserveOrder: true },
  );

  assert.deepEqual(
    entries.map((entry) => entry.name),
    ["Server Second", "Server First"],
  );
});

test("falls back for names that contain private identifiers", () => {
  const entries = normalizeLeaderboardRows(
    [
      {
        display_name: "ada@example.com",
        score: 340,
        total_marking_score: 400,
        percentage: 85,
      },
      {
        display_name: "+234 801 234 5678",
        score: 339,
        total_marking_score: 400,
        percentage: 85,
      },
      {
        display_name: "08012345678",
        score: 338,
        total_marking_score: 400,
        percentage: 85,
      },
      {
        display_name: "123e4567-e89b-12d3-a456-426614174000",
        score: 337,
        total_marking_score: 400,
        percentage: 85,
      },
      {
        display_name: "Ada",
        score: 336,
        total_marking_score: 400,
        percentage: 85,
      },
    ],
    { preserveOrder: true },
  );

  assert.deepEqual(
    entries.map((entry) => entry.name),
    [
      "JAMB Student",
      "JAMB Student",
      "JAMB Student",
      "JAMB Student",
      "Ada",
    ],
  );
});

test("formats the saved denominator and fractional percentage", () => {
  assert.equal(
    formatLeaderboardScore({ score: 399, total: 400, percentage: 99.6 }),
    "399/400 (99.6%)",
  );
  assert.equal(
    formatLeaderboardScore({ score: 348, total: 400, percentage: 87 }),
    "348/400 (87%)",
  );
  assert.equal(formatLeaderboardPercentage(0), "0%");
  assert.equal(formatLeaderboardPercentage(99.96), "100%");
});
