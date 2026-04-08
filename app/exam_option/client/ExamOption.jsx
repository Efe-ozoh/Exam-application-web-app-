"use client"

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import YearDropdown from "@/components/examOption/YearDropdown";
import SubjectGrid from "@/components/examOption/SubjectGrid";
import PreviewChips from "@/components/examOption/PreviewChips";
import ActionRow from "@/components/examOption/ActionRow";
import ExamTypeChips from "@/components/examOption/ExamTypeChips";
import ExamMode from "@/components/examOption/ExamMode";


const ExamOptions = () => {

  const subjects = [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature-in-English",
    "CRK",
    "Geography",
    "Agricultural Science",
    "Financial-Accounting",
    "Commerce",
  ]

  const router = useRouter();

  const [examMode, setExamMode] = useState("Mock");
  const [examType, setExamType] = useState("JAMB");
  const [year, setYear] = useState(2024);
  const [selected, setSelected] = useState([]);

  const maxAllowed = useMemo(() => (examType === "JAMB" || examType === "POST-UTME" ? 4 : 1), [examType]);

  const toggleSubject = (subject) => {
    setSelected((prev) => {
      const exists = prev.includes(subject);
      if (exists) return prev.filter((s) => s !== subject);
      if (!exists && prev.length >= maxAllowed) return prev; // ignore when limit reached
      return [...prev, subject];
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { examMode, examType, year, subjects: selected };

   
     // stores and Converts payload array to params query string
  const query = new URLSearchParams({
    examType: payload.examType,
    year: payload.year,
    subjects: JSON.stringify(payload.subjects),
  }).toString();

  router.push(`/question?${query}`);

  console.log("successfully converted to params string")

    
  }

  function handleReset() {
    setSelected([]);
    setExamType("JAMB");
    setYear(2024);
  }

  useEffect(() => {
    if (selected.length > maxAllowed) {
      setSelected((prev) => prev.slice(0, maxAllowed));
    }
  }, [maxAllowed]);

  const isValid = selected.length > 0 && selected.length <= maxAllowed;

  return (

    <div className="mt-10 py-20">
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-2xl p-6 shadow-lg"
    >
      <header className="mb-4">
        <h3 className="text-xl font-semibold">Select Year & Subjects</h3>
        <p className="text-sm text-gray-600">Choose the exam type, year and subjects.</p>
      </header>

      <div className="space-y-4">
        <ExamTypeChips value={examType} onChange={(val) => { setExamType(val); setSelected([]); }} />
        <YearDropdown value={year} onChange={setYear} />
        <SubjectGrid subjects={subjects} selectedSubjects={selected} maxAllowed={maxAllowed} onToggle={toggleSubject} />

        <div className="pt-2 border-t">
          <PreviewChips examType={examType} year={year} selected={selected} />
          <ActionRow isValid={isValid} onReset={handleReset} />
        </div>
      </div>
    </motion.form>
    </div>
  );
};


export default ExamOptions;
