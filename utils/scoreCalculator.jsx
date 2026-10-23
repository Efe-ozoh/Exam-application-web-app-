import jambScoreCalculator from "./jambScoreCalculator";

const roundTo = (value, digits) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

export const calculateScore = (userAnswers = [], questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      score: 0,
      total: 0,
      totalMarkingScore: 0,
      percentage: 0,
      breakdown: [],
      subjectScores: [],
    };
  }

  let score = 0;
  let totalMarkingScore = 0;
  const total = questions.length;
  const subjectTotals = new Map();

  const breakdown = questions.map((q, index) => {
    const userAnswer =
      typeof userAnswers[index] === "string"
        ? userAnswers[index].trim().toUpperCase()
        : "";

    const correctAnswer =
      typeof q.answer === "string"
        ? q.answer.trim().toUpperCase()
        : "";

    const examYear = q.year;
    const subject = q.subject;
    const exam = q.exam;

    // JAMB awards fractional marks per subject; other exams use one mark per
    // correct answer. The same weight is used for both the overall score and
    // the subject-level maximum.
    const markWeight =
      exam === "JAMB" ? jambScoreCalculator(examYear, subject) : 1;

    const isCorrect =
      userAnswer !== "" &&
      correctAnswer !== "" &&
      userAnswer === correctAnswer;

    if (isCorrect) {
      score += markWeight;
      totalMarkingScore = exam === "JAMB" ? 400 : 50;
    }

    // Group every question under its subject. Case-insensitive keys prevent
    // duplicate rows if the same subject is stored with different casing.
    const subjectLabel = typeof subject === "string" ? subject.trim() : "";
    const subjectKey = subjectLabel.toLowerCase() || "unspecified";
    const subjectTotal = subjectTotals.get(subjectKey) ?? {
      subject: subjectLabel || "Unspecified",
      score: 0,
      maxScore: 0,
      correctCount: 0,
      totalQuestions: 0,
    };

    subjectTotal.maxScore += markWeight;
    subjectTotal.totalQuestions += 1;

    if (isCorrect) {
      subjectTotal.score += markWeight;
      subjectTotal.correctCount += 1;
    }

    subjectTotals.set(subjectKey, subjectTotal);

    return {
      question: q.question,
      options: q.options,
      userAnswer: userAnswer || null,
      correctAnswer: correctAnswer || null,
      isCorrect,
      subject: subjectLabel || null,
      markWeight,
    };
  });

  const totalExamScore = Math.floor(Math.round(score));
  const percentage = totalMarkingScore > 0 ? (score / totalMarkingScore) * 100 : 0;

  // Round only at the boundary so the saved JSON is readable without losing
  // precision while the marks are being accumulated.
  const subjectScores = Array.from(subjectTotals.values()).map((item) => ({
    subject: item.subject,
    score: roundTo(item.score, 2),
    maxScore: roundTo(item.maxScore, 2),
    correctCount: item.correctCount,
    totalQuestions: item.totalQuestions,
    percentage:
      item.maxScore > 0 ? roundTo((item.score / item.maxScore) * 100, 1) : 0,
  }));

  return {
    score: totalExamScore,
    total,
    totalMarkingScore,
    percentage,
    breakdown,
    subjectScores,
  };
};
