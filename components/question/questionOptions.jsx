"use client";

import { MathJax } from "better-react-mathjax";

const QuestionOptions = ({ options, selected, onSelect }) => {
  return (
    <div className="space-y-4">
      {Object.entries(options).map(([key, value]) => {
        const isSelected = selected === key;

        return (
          <div
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full border rounded-lg px-5 py-2 cursor-pointer transition 
              ${
                isSelected
                  ? "bg-blue-700 text-white border-blue-800 shadow"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            <span className="font-bold mr-2">{key}.</span>

        
            <MathJax dynamic inline>
              {value}
            </MathJax>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionOptions;