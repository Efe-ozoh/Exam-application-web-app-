import jambScoreCalculator from "./jambScoreCalculator"


export const calculateScore = (userAnswers, questions) => {
  let score = 0;
  let totalMarkingScore = 0;
  const total = questions.length;



    const breakdown = questions.map((q, index) => {
    const userAnswer = userAnswers[index] || null;
    const correctAnswer = q.answer;
    const examYear = q.year;
    const subject = q.subject;
    const exam = q.exam;

    const isCorrect =
      userAnswer &&
      correctAnswer &&
      userAnswer.toUpperCase() === correctAnswer;

    if (isCorrect && exam === "JAMB") {
      const jambscore = jambScoreCalculator(examYear, subject);
      score += jambscore
      totalMarkingScore = 400;  /* bad code but manage it */

    }else if(isCorrect && exam != "JAMB"){
      score++;
      totalMarkingScore = 50;  /* bad code but manage it */
    }

    return {
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer,
      isCorrect
    };
  });



  const totalExamScore = Math.round(score)

  const percentage = (score/totalMarkingScore) * 100 || 0;

  return {
    score: totalExamScore,
    total,
    totalMarkingScore,
    percentage,
    breakdown, 
  };
};
