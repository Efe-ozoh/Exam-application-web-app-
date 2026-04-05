import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import QuestionOptions from "./questionOptions";

const ExamQuestion = ({
  currentQuestion,
  index,
  total,
  selectedAnswer,
  handleSelect,
}) => {

  console.log(currentQuestion)
  return (
    <div>
      <div className="flex justify-between mb-4 text-gray-700">
        <span className="text-lg font-semibold">
          Question {index + 1} of {total}
        </span>
      </div>

      <div className="text-lg mb-6">
        
      {currentQuestion?.question
  ?.split("\n\n")
  .map((para) => para.trim())
  .filter(Boolean)
  .map((para, idx) => {
    const isMath =
      para.includes("\\") ||   // LaTeX commands
      para.includes("^") ||    // powers
      para.includes("/") ||    // fractions
      para.includes("=");      // equations

    return isMath ? (
      <BlockMath key={idx} math={para} />
    ) : (
      <p key={idx} className="mb-4 leading-relaxed">
        {para}
      </p>
    );
  })}

        {currentQuestion?.imgUrl && (
          <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 m-auto">
            <img
              src={currentQuestion.imgUrl}
              alt="Exam illustration"
              className="w-full h-auto rounded-md shadow"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <QuestionOptions
        options={currentQuestion.options}
        selected={selectedAnswer}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ExamQuestion;
