import React from "react";
import SubjectButton from "./SubjectButton";

export default function SubjectGrid({
  subjects,
  selectedSubjects,
  maxAllowed,
  onToggle,
  compulsorySubject = null,
  remainingMessage = "",
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700">Subjects</label>
        <div className="text-sm text-gray-500">
          Selected: {selectedSubjects.length}/{maxAllowed}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {subjects.map((sub) => {
          const isCompulsory = sub === compulsorySubject;
          const isSelected = selectedSubjects.includes(sub);
          const disabled =
            !isSelected && selectedSubjects.length >= maxAllowed;
          return (
            <SubjectButton
              key={sub}
              name={sub}
              selected={isSelected}
              disabled={disabled}
              compulsory={isCompulsory}
              onToggle={onToggle}
            />
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-indigo-700" aria-live="polite">
          {remainingMessage}
        </p>
        <p className="text-xs text-gray-500">
          Tip: change exam type to switch between a 4-subject and 1-subject
          selector.
        </p>
      </div>
    </div>
  );
}