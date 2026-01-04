import React from "react";

export default function ActionRow({ isValid, onReset }) {

  return (
    <div className="mt-4 flex gap-2">

      {/* submit button  */}
      <button
        type="submit"
        disabled={!isValid}
        className={`flex-1 rounded-xl px-4 py-2 font-medium transition ${
          isValid ? "bg-indigo-600 text-white shadow" : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        Save Selection
      </button>


         {/* reset button */}
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 rounded-xl border"
      >
        Reset
      </button>
    </div>
  );
};