import React from "react";

import {
  JAMB_COMPULSORY_SUBJECT,
  isJambExamType,
} from "@/lib/practice/constants";

export default function PreviewChips({ examType, year, selected }) {
  const isJamb = isJambExamType(examType);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Preview:</div>
        <div className="text-sm font-medium">{examType} • {year}</div>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-400">No subjects selected</span>
          ) : (
            selected.map((s) => {
              const compulsory =
                isJamb && s === JAMB_COMPULSORY_SUBJECT;

              return (
                <span
                  key={s}
                  className={`rounded-full px-2 py-1 text-sm ${
                    compulsory
                      ? "bg-indigo-100 font-medium text-indigo-800"
                      : "bg-gray-100"
                  }`}
                >
                  {s}
                  {compulsory ? " (Compulsory)" : ""}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}