import React from "react";

export default function PreviewChips({ examType, year, selected }) {
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
            selected.map((s) => (
              <span key={s} className="px-2 py-1 rounded-full bg-gray-100 text-sm">{s}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}