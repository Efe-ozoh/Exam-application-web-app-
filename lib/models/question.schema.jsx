import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    exam: {
      type: String, required: true, uppercase: true,
    },
    year: {
      type: Number, required: true, 
    },
    subject: {
      type: String, required: true, 
    },
   
    question: {  type: String, required: true, },

    
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },

    answer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    imgUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

export default Question;
