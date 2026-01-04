import React from "react";
import SubjectButton from "./SubjectButton";

export default function SubjectGrid({ subjects, selectedSubjects, maxAllowed, onToggle }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700">Subjects</label>
        <div className="text-sm text-gray-500">Selected: {selectedSubjects.length}/{maxAllowed}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {subjects.map((sub) => {
          const isSelected = selectedSubjects.includes(sub);
          const disabled = !isSelected && selectedSubjects.length >= maxAllowed;
          return (
            <SubjectButton
              key={sub}
              name={sub}
              selected={isSelected}
              disabled={disabled}
              onToggle={onToggle}
            />
          );
        })}
      </div>

      <p className="mt-2 text-xs text-gray-500">Tip: change exam type to switch between a 4-subject and 1-subject selector.</p>
    </div>
  );
}