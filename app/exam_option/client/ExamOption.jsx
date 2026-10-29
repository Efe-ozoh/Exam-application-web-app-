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
import {
  EXAM_MODE_PRACTICE,
  EXAM_MODE_MOCK,
  isFormalExamMode,
} from "@/lib/exam/constants";
import {
  JAMB_COMPULSORY_SUBJECT,
  SUPPORTED_SUBJECTS,
  getMaxSubjectsForExamType,
  isJambExamType,
  normalizeExamSubjects,
} from "@/lib/practice/constants";


const ExamOptions = () => {

  const subjects = SUPPORTED_SUBJECTS;

  const router = useRouter();

  const [examMode, setExamMode] = useState(EXAM_MODE_MOCK);
  const [examType, setExamType] = useState("JAMB");
  const [year, setYear] = useState(2024);
  const [selected, setSelected] = useState([JAMB_COMPULSORY_SUBJECT]);
  const [formError, setFormError] = useState("");

  const maxAllowed = useMemo(
    () => getMaxSubjectsForExamType(examType),
    [examType]
  );

  const isJamb = isJambExamType(examType);

  const toggleSubject = (subject) => {
    if (isJamb && subject === JAMB_COMPULSORY_SUBJECT) return;

    setFormError("");
    setSelected((prev) => {
      const exists = prev.includes(subject);
      if (exists) return prev.filter((s) => s !== subject);
      if (!exists && prev.length >= maxAllowed) return prev; // ignore when limit reached
      return [...prev, subject];
    });
  }

  const handleExamTypeChange = (value) => {
    setExamType(value);
    setSelected(
      isJambExamType(value) ? [JAMB_COMPULSORY_SUBJECT] : [],
    );
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalized = normalizeExamSubjects(selected, examType);

    if (!normalized.ok) {
      setFormError(normalized.message);
      return;
    }

    const payload = {
      examMode,
      examType,
      year,
      subjects: normalized.subjects,
    };

    // Store the mode so the exam page can create an authoritative server-side
    // session for formal (Mock) exams and keep AI locked until submission.
    const query = new URLSearchParams({
      examType: payload.examType,
      year: String(payload.year),
      subjects: JSON.stringify(payload.subjects),
      examMode: payload.examMode,
    }).toString();

    router.push(`/question?${query}`);
  }

  function handleReset() {
    setSelected([JAMB_COMPULSORY_SUBJECT]);
    setExamType("JAMB");
    setYear(2024);
    setExamMode(EXAM_MODE_MOCK);
    setFormError("");
  }

  useEffect(() => {
    if (selected.length > maxAllowed) {
      setSelected((prev) => prev.slice(0, maxAllowed));
    }
  }, [maxAllowed]);

  const validation = useMemo(
    () => normalizeExamSubjects(selected, examType),
    [selected, examType]
  );
  const isValid = validation.ok;
  const remainingSubjects = Math.max(0, maxAllowed - selected.length);
  const remainingMessage = isJamb
    ? remainingSubjects === 0
      ? "All 4 subjects selected"
      : `Choose ${remainingSubjects} more subject${
          remainingSubjects === 1 ? "" : "s"
        }`
    : remainingSubjects === 0
      ? "All required subjects selected"
      : `Choose ${remainingSubjects} more subject${
          remainingSubjects === 1 ? "" : "s"
        }`;

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
        <ExamTypeChips value={examType} onChange={handleExamTypeChange} />
        <ExamMode value={examMode} onChange={setExamMode} />
        <p className="-mt-2 text-xs text-gray-500">
          {isFormalExamMode(examMode)
            ? "Mock is a formal timed exam. AI help is locked until you submit."
            : "Practice keeps AI help available while you work."}
        </p>
        <YearDropdown value={year} onChange={setYear} />
        <SubjectGrid
          subjects={subjects}
          selectedSubjects={selected}
          maxAllowed={maxAllowed}
          onToggle={toggleSubject}
          compulsorySubject={isJamb ? JAMB_COMPULSORY_SUBJECT : null}
          remainingMessage={remainingMessage}
        />

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            {formError}
          </p>
        ) : null}

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
