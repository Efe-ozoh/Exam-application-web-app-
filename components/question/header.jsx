import React from 'react'

const Header = ({ currentQuestion }) => {
  return (
    <div>

      <div className="text-center mb-10 pt-20">
        <h1 className="text-3xl font-extrabold text-blue-800">
          {currentQuestion.exam} {currentQuestion.year}
        </h1>
        <p className="text-gray-600 text-lg mt-1">
          Subject: <span className="font-semibold">{currentQuestion.subject}</span>
        </p>
      </div>

    </div>
  )
}

export default Header;
