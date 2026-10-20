import mongoose from "mongoose";

const PracticeResultSchema = new mongoose.Schema(
  {
    // Supabase user id (the source of truth for auth in this app).
    userId: { type: String, required: true },
    userEmail: { type: String, default: null },

    examType: { type: String, required: true },
    year: { type: Number, default: null },
    subjects: { type: [String], default: [] },

    score: { type: Number, required: true },
    totalMarkingScore: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { timestamps: true }
);

// Dashboard queries: newest results for one user.
PracticeResultSchema.index({ userId: 1, createdAt: -1 });

const PracticeResult =
  mongoose.models.PracticeResult ||
  mongoose.model("PracticeResult", PracticeResultSchema);

export default PracticeResult;
