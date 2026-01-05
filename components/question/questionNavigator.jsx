const QuestionNavigator = ({
  total = 0,
  currentIndex = 0,
  answers = {},
  questions = [],
  result,
  goToQuestion,
}) => {
  if (!Array.isArray(questions) || total === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-3 justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === currentIndex;

        const userAnswer =
          typeof answers[i] === "string"
            ? answers[i].trim().toUpperCase()
            : null;

        const correctAnswer =
          typeof questions[i]?.answer === "string"
            ? questions[i].answer.trim().toUpperCase()
            : null;

        const isAnswered = userAnswer !== null;
        const isCorrect =
          isAnswered &&
          correctAnswer !== null &&
          userAnswer === correctAnswer;

        let bgClass = "bg-gray-200 text-gray-700";

        // After submission
        if (result && isAnswered) {
          bgClass = isCorrect
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white";
        }

        // Before submission
        if (!result && isAnswered) {
          bgClass = "bg-green-300 text-green-900";
        }

        // Current question always wins
        if (isCurrent) {
          bgClass = "bg-blue-600 text-white";
        }

        return (
          <button
            key={i}
            onClick={() => goToQuestion(i)}
            className={`w-10 h-10 rounded-full font-semibold text-sm transition ${bgClass}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigator;
