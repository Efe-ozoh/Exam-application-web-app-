"use client";

import { MathJax } from "better-react-mathjax";
import QuestionOptions from "./questionOptions";

const ExamQuestion = ({
  currentQuestion,
  index,
  total,
  selectedAnswer,
  handleSelect,
}) => {
  return (
    <div>
      <div className="flex justify-between mb-4 text-gray-700">
        <span className="text-lg font-semibold">
          Question {index + 1} of {total}
        </span>
      </div>

      <div className="text-lg mb-6">
        
        <MathJax dynamic>
          {currentQuestion?.question}
        </MathJax>

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