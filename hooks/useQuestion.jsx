"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchQuestions } from "@/lib/serverRequests/index";
import { calculateScore } from "@/utils/scoreCalculator";

const useQuestion = () => {
  const searchParams = useSearchParams();

  const examType = searchParams?.get("examType") ?? "";
  const year = searchParams?.get("year") ?? "";
  const subjectsParam = searchParams?.get("subjects") ?? "";
  const subjects = subjectsParam ? subjectsParam.split(",").filter(Boolean) : [];

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [result, setResult] = useState(null);

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

        const formatted = examQuestions?.map((q) => ({
          question: q.question,
          options: { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D },
          answer: q.answer?.toUpperCase() ?? null,
          subject: q.subject,
          exam: q.exam ?? "Unknown",
          year: q.year ?? "Unkown",
        }));

        setQuestions(formatted);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    getQuestions();
  }, [examType, year, subjects]);

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const nextQuestion = () => index < questions.length - 1 && setIndex(index + 1);
  const prevQuestion = () => index > 0 && setIndex(index - 1);
  const questionNavigator = (i) => {
    setIndex(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => setSubmitted((prev) => !prev);

  const submitQuestions = () => {
    if (!questions.length) return;
    const userAnswers = questions?.map((_, i) => answers[i] ?? "");
    setResult(calculateScore(userAnswers, questions));
  };

  const displayScoreModal = () => {
    if (!questions.length) return;
    submitQuestions();
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
