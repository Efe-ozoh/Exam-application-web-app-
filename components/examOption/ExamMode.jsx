import React from "react";

export default function ExamMode ({ value, onChange }) {
  const examMode = ["Mock", "Practice"];
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Exam Mode</label>
      <div className="mt-2 flex gap-2 flex-wrap">
        {examMode.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              value === opt ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}