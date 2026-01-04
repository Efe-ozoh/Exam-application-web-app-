import React from 'react'


// back button
export const BackButton = ({ index, prevQuestion}) => {
  return (
    <button
    disabled={index === 0}
    onClick={prevQuestion}
    className={`px-6 py-2 rounded-lg font-semibold 
      ${index === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900 text-white"}
    `}
  >
    Back
  </button>
  )
}

// next button
export const NextButton = ({ index, nextQuestion, questions }) => {
  return (
    <button
    disabled={index === questions.length - 1}
    onClick={nextQuestion}
    className={`px-6 py-2 rounded-lg font-semibold 
      ${
        index === questions.length - 1
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-700 hover:bg-blue-800 text-white"
      }
    `}
  >
    Next
  </button>
  )
};



// submit button
export const SubmitButton = ({ submit, result }) => {
  const isDisabled = !!result;

  return (
    <button
      onClick={submit}
      disabled={isDisabled}
      className={`
        px-6 py-3 rounded-lg font-bold shadow
        transition
        ${
          isDisabled
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-green-700 hover:bg-green-800 text-white"
        }
      `}
    >
      Submit Answers
    </button>
  );
};

