const QuestionNavigator = ({
  total,
  currentIndex,
  answers,
  questions,
  result,
  goToQuestion,
}) => {
  return (
    <div className="mt-8 flex flex-wrap gap-3 justify-center">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const userAnswer = answers[i];
        const correctAnswer = questions[i].answer;

        const isAnswered = userAnswer !== undefined;
        const isCorrect = userAnswer === correctAnswer;

        let bgClass = "bg-gray-200 text-gray-700";

        if (result && isAnswered && !isCorrect) {
          bgClass = "bg-red-500 text-white";
        } else if (isAnswered) {
          bgClass = "bg-green-400 text-green-900";
        }

        if (isCurrent) {
          bgClass = "bg-blue-600 text-white";
        }

        return (
          <button
            key={i}
            onClick={() => goToQuestion(i)}
            className={`
              w-10 h-10 rounded-full font-semibold text-sm
              transition
              ${bgClass}
            `}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
  };
  
  export default QuestionNavigator;
  