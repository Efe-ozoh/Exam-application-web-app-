"use client";

import { Suspense } from "react"

import useQuestion from "@/hooks/useQuestion";
import Timer from "@/components/question/timer";
import ExamQuestion from "@/components/question/examQuestions";
import SubmitModal from "@/components/question/submitModal";
import ScoreModal from "@/components/question/scoreModal";
import Header from "@/components/question/header";
import Solution from "@/components/question/solutions";
import CalculatorToggle from "@/components/question/calculatorToggle";
import QuestionPageSkeleton from "@/components/skeletons/question";
import QuestionNavigator from "@/components/question/questionNavigator"
import { NextButton, BackButton, SubmitButton } from "@/components/question/questionButtons";

const Page = () => {
  const {
    // actions
    handleSelect,
    nextQuestion,
    prevQuestion,
    submit,
    displayScoreModal,
    questionNavigator,

    // data
    currentQuestion,
    questions,
    index,
    answers,
    result,
    showScoreModal,
    submitted,

  } = useQuestion();

  if (!currentQuestion) {
    return (
      <QuestionPageSkeleton />
    );
  }

  return (
    <Suspense fallback={ <QuestionPageSkeleton /> }>
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* HEADER */}
      <Header currentQuestion={currentQuestion} />

      <div className="flex items-center justify-between w-full px-3 pb-4">
  
       {/* Calculator */}
       <CalculatorToggle />

        {/* Timer */}
     <Timer onTimeUp={displayScoreModal} />

     </div>




      {/* QUESTION */}
      <div className="max-w-4xl mx-auto">
        <ExamQuestion
          currentQuestion={currentQuestion}
          index={index}
          total={questions.length}
          selectedAnswer={answers[index]}
          handleSelect={handleSelect}
          result={result}
        />

        {/* SOLUTION (shows after submit) */}
        <Solution  result={result} index={index} />

        {/* NAV BUTTONS */}
        <div className="flex justify-between mt-12">
          <BackButton index={index} prevQuestion={prevQuestion} />

          <NextButton index={index} nextQuestion={nextQuestion} questions={questions} />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="text-center mt-10">
          <SubmitButton submit={submit} result={result} />
        </div>

        <QuestionNavigator
       
          goToQuestion={questionNavigator}
          total={questions.length}
          currentIndex={index}
          answers={answers}
          questions={questions}
          result={result}
          />


        {/* CONFIRM SUBMIT MODAL */}
        <SubmitModal isOpen={submitted} onCancel={submit} onConfirm={displayScoreModal}
        />
        
        {/* exam score */}
          <ScoreModal open={showScoreModal} onClose={displayScoreModal} result={result}
          />
      </div>
    </div>

    </Suspense>
  );
};

export default Page;
         