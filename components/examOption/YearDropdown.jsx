import React, { useMemo } from "react";

export default function YearDropdown({ value, onChange, start = 2010, end = 2024 }) {
  const years = useMemo(() => {
    const arr = [];
    for (let y = end; y >= start; y--) arr.push(y);
    return arr;
  }, [start, end]);

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