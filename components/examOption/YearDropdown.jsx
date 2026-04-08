import React, { useMemo } from "react";

export default function YearDropdown({ value, onChange}) {

    const years = [2024];
 
 

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Year</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-lg border px-3 py-2"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}