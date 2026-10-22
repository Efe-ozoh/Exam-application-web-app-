/**
 * One-time migration: copy legacy MongoDB practice results into Supabase.
 *
 * Practice history is user data, so MongoDB now stores questions only. Run the
 * SQL migration first (supabase/migrations/20261020000000_create_practice_results.sql),
 * then:
 *
 *   node --env-file=.env.local scripts/migrate-practice-results-to-supabase.mjs
 *
 * Requires MONGODB_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * The service role key bypasses RLS for the bulk insert and must never be
 * exposed to the browser. Re-running is guarded; use --force only if you know
 * the table is empty.
 */
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";

const BATCH_SIZE = 500;
const collectionName = "practiceresults";

const mongoUrl = process.env.MONGODB_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!mongoUrl || !supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing MONGODB_URL, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const force = process.argv.includes("--force");

const legacySchema = new mongoose.Schema(
  {
    userId: String,
    userEmail: String,
    examType: String,
    year: Number,
    subjects: [String],
    score: Number,
    totalMarkingScore: Number,
    totalQuestions: Number,
    correctCount: Number,
    percentage: Number,
  },
  { timestamps: true, collection: collectionName, strict: false },
);

const LegacyPracticeResult = mongoose.model(
  "LegacyPracticeResult",
  legacySchema,
);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function toIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toRow(doc) {
  const totalQuestions = Math.round(Number(doc.totalQuestions));
  const correctCount = Math.round(Number(doc.correctCount));

  if (!doc.userId || !Number.isFinite(totalQuestions) || totalQuestions <= 0) {
    return null;
  }

  return {
    user_id: doc.userId,
    exam_type: String(doc.examType || "Practice").slice(0, 40),
    year: Number.isInteger(doc.year) ? doc.year : null,
    subjects: Array.isArray(doc.subjects) ? doc.subjects : [],
    score: Math.max(0, Math.round(Number(doc.score) || 0)),
    total_marking_score: Math.max(
      0,
      Math.round(Number(doc.totalMarkingScore) || 0),
    ),
    total_questions: totalQuestions,
    correct_count: Math.min(
      totalQuestions,
      Math.max(0, Number.isFinite(correctCount) ? correctCount : 0),
    ),
    percentage: Math.min(100, Math.max(0, Number(doc.percentage) || 0)),
    created_at: toIsoDate(doc.createdAt),
  };
}

async function main() {
  const { count, error: countError } = await supabase
    .from("practice_results")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  if (count > 0 && !force) {
    console.error(
      `practice_results already contains ${count} rows. Re-run with --force only if duplicates are acceptable.`,
    );
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 30000 });

  const docs = await LegacyPracticeResult.find({
    userId: { $exists: true, $ne: null },
  })
    .sort({ createdAt: 1 })
    .lean();

  console.log(`Found ${docs.length} legacy practice results.`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  let buffer = [];

  const flush = async () => {
    if (!buffer.length) return;

    const batch = buffer;
    buffer = [];

    const { error } = await supabase.from("practice_results").insert(batch);

    if (!error) {
      migrated += batch.length;
      return;
    }

    // Retry one row at a time so a single orphaned user or invalid row does
    // not discard the rest of the batch.
    for (const row of batch) {
      const { error: rowError } = await supabase
        .from("practice_results")
        .insert(row);

      if (rowError) {
        failed += 1;
        console.error(`Skipped result for user ${row.user_id}:`, rowError.message);
      } else {
        migrated += 1;
      }
    }
  };

  for (const doc of docs) {
    const row = toRow(doc);

    if (!row) {
      skipped += 1;
      continue;
    }

    buffer.push(row);

    if (buffer.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  console.log(
    `Migration complete: ${migrated} inserted, ${skipped} skipped (invalid), ${failed} failed.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
