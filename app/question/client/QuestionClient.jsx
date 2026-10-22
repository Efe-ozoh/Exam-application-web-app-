"use client";

import { Suspense } from "react"
import Link from "next/link"

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

const primaryLinkClasses =
  "inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

const secondaryLinkClasses =
  "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

const QuestionState = ({ title, message, role, children }) => (
  <div className="min-h-screen bg-gray-50 px-4 py-10">
    <div
      className="mx-auto mt-16 max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
      role={role}
    >
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {children}
      </div>
    </div>
  </div>
);

const QuestionClient = () => {
  const {
    // actions
    handleSelect,
    nextQuestion,
    prevQuestion,
    reloadQuestions,
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
    isLoading,
    loadError,
    saveError,

  } = useQuestion();

  if (isLoading) {
    return (
      <QuestionPageSkeleton />
    );
  }

  if (loadError) {
    return (
      <QuestionState
        title="Unable to load questions"
        message={loadError}
        role="alert"
      >
        <button type="button" onClick={reloadQuestions} className={primaryLinkClasses}>
          Retry
        </button>
        <Link href="/exam_option" className={secondaryLinkClasses}>
          Change selection
        </Link>
      </QuestionState>
    );
  }

  if (!currentQuestion) {
    return (
      <QuestionState
        title="No questions available"
        message="We couldn't find questions for this exam, year, and subject combination. Choose another selection to continue."
      >
        <Link href="/exam_option" className={primaryLinkClasses}>
          Choose another exam
        </Link>
      </QuestionState>
    );
  }

  return (
   
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* HEADER */}
      <Header currentQuestion={currentQuestion} />

      <div className="flex items-center justify-between w-full px-3 pb-4">
  
       {/* Calculator */}
       <CalculatorToggle />

        {/* Timer */}
      <Suspense fallback={ <QuestionPageSkeleton /> }>
        <Timer onTimeUp={displayScoreModal} />
     
       </Suspense>

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
          <ScoreModal
            open={showScoreModal}
            onClose={displayScoreModal}
            result={result}
            saveError={saveError}
          />
      </div>
    </div>
  );
};

export default QuestionClient;
         