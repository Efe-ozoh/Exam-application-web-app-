import React from 'react'

const Solutions = ({ result, index }) => {
  return (
    <div>
      {result && (
  <div className="mt-4 p-4 rounded-lg border">
    <p className="font-semibold">
      Your Answer:{" "}
      <span
        className={
          result.breakdown[index].isCorrect
            ? "text-green-600"
            : "text-red-600"
        }
      >
        {result.breakdown[index].userAnswer || "Not Answered"}
      </span>
    </p>

    {!result.breakdown[index].isCorrect && (
      <p className="mt-2 text-green-700">
        Correct Answer: {result.breakdown[index].correctAnswer}
      </p>
    )}
  </div>
)}

    </div>
  )
}

export default Solutions;
