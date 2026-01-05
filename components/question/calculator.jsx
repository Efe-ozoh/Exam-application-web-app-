"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const Calculator = ({ onClose }) => {
  const [display, setDisplay] = useState("0");

  const handleClick = (value) => {
    if (display === "0" && value !== ".") {
      setDisplay(value);
    } else {
      setDisplay((prev) => prev + value);
    }
  };

  const clear = () => setDisplay("0");

  const calculate = () => {
    try {
      if (!/^[0-9+\-*/.() ]+$/.test(display)) {
        setDisplay("Error");
        return;
      }

      // Safe evaluation
      const result = Function(`"use strict"; return (${display})`)();
      setDisplay(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const buttons = [
    "7","8","9","/",
    "4","5","6","*",
    "1","2","3","-",
    "0",".","+",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-[320px] bg-white rounded-2xl shadow-xl p-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-700">Calculator</h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-100 text-right p-3 rounded-lg text-2xl font-mono mb-4">
          {display}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3 text-lg">
          {buttons.map((item) => (
            <button
              key={item}
              onClick={() => handleClick(item)}
              className={`py-3 rounded-lg font-semibold
                ${["/","*","-","+"].includes(item)
                  ? "bg-orange-400 text-white"
                  : "bg-gray-200 hover:bg-gray-300"}
              `}
            >
              {item}
            </button>
          ))}

          <button
            onClick={calculate}
            className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            =
          </button>

          <button
            onClick={clear}
            className="col-span-2 bg-red-500 text-white py-3 rounded-lg font-semibold"
          >
            C
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
