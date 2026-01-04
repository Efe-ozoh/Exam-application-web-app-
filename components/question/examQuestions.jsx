import QuestionOptions from "./questionOptions";

const ExamQuestion =  ({currentQuestion, index, total, selectedAnswer, handleSelect,}) => {

  return (
    <div>
      <div className="flex justify-between mb-4 text-gray-700">
        <span className="text-lg font-semibold">
          Question {index + 1} of {total}
        </span>
      </div>

      <div className="text-lg lg:text-lg mb-6">
      {currentQuestion.question.split("\n\n").map((para, index) => (
      <p key={index} className="mb-4 leading-relaxed">
       {para}
     </p> 
      )
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
