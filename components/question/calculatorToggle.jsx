"use client";

import { useState } from "react";
import CalculatorIcon from "@mui/icons-material/Calculate";
import Calculator from "./calculator";

const CalculatorToggle = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Calculator Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition ml-8"
      >
        <CalculatorIcon className="text-blue-700"  />
        <span className="md:inline font-bold text-xl rounded-lg text-blue-700 text-center">Calculator</span>
      </button>

      {/* Calculator Modal */}
      {open && <Calculator onClose={() => setOpen(false)} />}
    </div>
  );
};


export default CalculatorToggle;
