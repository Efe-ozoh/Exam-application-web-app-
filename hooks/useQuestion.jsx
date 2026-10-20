"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchQuestions, savePracticeResult } from "@/lib/serverRequests/index";
import { calculateScore } from "@/utils/scoreCalculator";

const useQuestion = () => {
  const searchParams = useSearchParams();

  const examType = searchParams?.get("examType") ?? "";
  const year = searchParams?.get("year") ?? "";
  const subjectsParam = searchParams?.get("subjects") ?? "";

  // ExamOption sends the subjects as a JSON array. Older links used a
  // comma-separated list, so fall back to that for backwards compatibility.
  const subjects = (() => {
    if (!subjectsParam) return [];

    try {
      const parsed = JSON.parse(subjectsParam);
      return Array.isArray(parsed)
        ? parsed.filter((subject) => typeof subject === "string")
        : [];
    } catch {
      return subjectsParam.split(",").filter(Boolean);
    }
  })();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [result, setResult] = useState(null);
  const savedResultRef = useRef(false);

  const currentQuestion = questions[index] ?? null;

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await fetchQuestions(examType, year, subjects);
        const examQuestions = response?.questions;
  
        if (!Array.isArray(examQuestions)) {
          console.error("Questions must be an array");
          return;
        }
  
        const formatted = examQuestions.map((q) => ({
          question: q.question,
          options: { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D },
          answer: q.answer?.toUpperCase() ?? null,
          subject: q.subject,
          exam: q.exam ?? "Unknown",
          year: q.year ?? "Unknown",
          imgUrl: q.imgUrl ?? null,
        }));
        
        setQuestions(formatted);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
  
    getQuestions();
  }, [examType, year, subjectsParam]);
  
  useEffect(() => {
    savedResultRef.current = false;
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowScoreModal(false);
    setResult(null);
  }, [examType, year, subjectsParam]);
  

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
    console.log(currentQuestion)
  };

  const nextQuestion = () => index < questions.length - 1 && setIndex(index + 1);
  const prevQuestion = () => index > 0 && setIndex(index - 1);
  const questionNavigator = (i) => {
    setIndex(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log(currentQuestion)
  };

  const submit = () => setSubmitted((prev) => !prev);

  const submitQuestions = () => {
    if (!questions.length) return null;

    const userAnswers = questions.map((_, i) => answers[i] ?? "");
    const nextResult = calculateScore(userAnswers, questions);

    setResult(nextResult);
    return nextResult;
  };

  const saveCompletedResult = async (nextResult) => {
    // The modal toggles open and closed, and the timer can also complete the
    // practice. Only store one result per completed practice.
    if (!nextResult || savedResultRef.current) return;

    savedResultRef.current = true;

    try {
      await savePracticeResult({
        examType: examType || "Practice",
        year: year ? Number(year) : null,
        subjects,
        score: nextResult.score,
        totalMarkingScore: nextResult.totalMarkingScore,
        totalQuestions: nextResult.total,
        correctCount: nextResult.breakdown.filter((item) => item.isCorrect)
          .length,
        percentage: nextResult.percentage,
      });
    } catch (error) {
      // Let the dashboard retry if the save failed (offline, session expired).
      savedResultRef.current = false;
      console.error("Failed to save practice result:", error);
    }
  };

  const displayScoreModal = () => {
    if (!questions.length) return;

    if (!showScoreModal) {
      const nextResult = submitQuestions();
      void saveCompletedResult(nextResult);
    }

    setSubmitted(false);
    setShowScoreModal((prev) => !prev);
  };

  return {
    submitQuestions,
    displayScoreModal,
    handleSelect,
    nextQuestion,
    prevQuestion,
    currentQuestion,
    submit,
    questionNavigator,
    showScoreModal,
    questions,
    index,
    answers,
    submitted,
    result,
  };
};

export default useQuestion;
