"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const Calculator = ({ onClose }) => {
  const [display, setDisplay] = useState("0");

  const handleClick = (value) => {
    if (display === "0") {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const clear = () => setDisplay("0");

  const calculate = () => {
    try {
      setDisplay(eval(display).toString());
    } catch {
      setDisplay("Error");
    }
  };

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
          {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map((item) => (
            <button
              key={item}
              onClick={() =>
                item === "=" ? calculate() : handleClick(item)
              }
              className={`py-3 rounded-lg font-semibold
                ${item === "="
                  ? "bg-blue-600 text-white col-span-2"
                  : "bg-gray-200 hover:bg-gray-300"}
                ${["/","*","-","+"].includes(item) ? "bg-orange-400 text-white" : ""}
              `}
            >
              {item}
            </button>
          ))}

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



