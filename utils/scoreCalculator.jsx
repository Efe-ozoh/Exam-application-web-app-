import jambScoreCalculator from "./jambScoreCalculator";

export const calculateScore = (userAnswers = [], questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      score: 0,
      total: 0,
      totalMarkingScore: 0,
      percentage: 0,
      breakdown: [],
    };
  }

  let score = 0;
  let totalMarkingScore = 0;
  const total = questions.length;

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

    const isCorrect =
      userAnswer !== "" &&
      correctAnswer !== "" &&
      userAnswer === correctAnswer;

    if (isCorrect && exam === "JAMB") {
      score += jambScoreCalculator(examYear, subject);
      totalMarkingScore = 400;
    } else if (isCorrect && exam !== "JAMB") {
      score += 1;
      totalMarkingScore = 50;
    }

    return {
      question: q.question,
      options: q.options,
      userAnswer: userAnswer || null,
      correctAnswer: correctAnswer || null,
      isCorrect,
    };
  });

  const totalExamScore = Math.round(score);
  const percentage = totalMarkingScore > 0 ? (score / totalMarkingScore) * 100 : 0;

  return {
    score: totalExamScore,
    total,
    totalMarkingScore,
    percentage,
    breakdown,
  };
};
