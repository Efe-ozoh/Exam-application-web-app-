"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchQuestions, savePracticeResult } from "@/lib/serverRequests/index";
import { createClient } from "@/lib/supabase/client";
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const savedResultRef = useRef(false);

  const currentQuestion = questions[index] ?? null;

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setLoadError(null);

    const getQuestions = async () => {
      try {
        const response = await fetchQuestions(examType, year, subjects);
        if (!isActive) return;

        const examQuestions = response?.questions;

        if (!Array.isArray(examQuestions)) {
          throw new Error("Unexpected response from the questions API");
        }

        const formatted = examQuestions.map((q) => ({
          id: q._id ? String(q._id) : null,
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
        if (!isActive) return;

        console.error("Error fetching questions:", error);
        setQuestions([]);
        setLoadError("We couldn't load the questions for this selection.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    getQuestions();

    return () => {
      isActive = false;
    };
  }, [examType, year, subjectsParam, reloadKey]);

  const reloadQuestions = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    savedResultRef.current = false;
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowScoreModal(false);
    setResult(null);
    setSaveError(null);
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
    setSaveError(null);

    try {
      // A practice can run longer than the access token's lifetime. Reading
      // the session here lets the browser client refresh the auth cookies
      // before the API request, so the server sees the current session.
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        savedResultRef.current = false;
        setSaveError(
          "Your session has expired. Please sign in again to save this result.",
        );
        return;
      }

      await savePracticeResult({
        examType: examType || "Practice",
        year: year ? Number(year) : null,
        subjects,
        answers: questions.map((question, questionIndex) => ({
          questionId: question.id,
          answer:
            typeof answers[questionIndex] === "string"
              ? answers[questionIndex]
              : "",
        })),
      });
    } catch (error) {
      // Let the dashboard retry if the save failed (offline, session expired).
      savedResultRef.current = false;
      setSaveError(
        error?.status === 401
          ? "Your session has expired. Please sign in again to save this result."
          : error?.message ||
              "We couldn't save your result. Please try again.",
      );
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
    reloadQuestions,
    currentQuestion,
    submit,
    questionNavigator,
    showScoreModal,
    questions,
    index,
    answers,
    submitted,
    result,
    isLoading,
    loadError,
    saveError,
  };
};

export default useQuestion;
