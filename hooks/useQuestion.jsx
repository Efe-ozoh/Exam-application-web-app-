"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchQuestions } from "@/lib/serverRequests/index";
import { calculateScore } from "@/utils/scoreCalculator";

const useQuestion = () => {

  const searchParams = useSearchParams();

  const examType = searchParams.get("examType");
  const subjects = searchParams.get("subjects");
  const year = searchParams.get("year");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // {0: "A", 1: "B", ...}
  const [submitted, setSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [result, setResult] = useState();

  const currentQuestion = questions[index];

  // Fetch and format questions
  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await fetchQuestions(examType, year, subjects);
        const examQuestions = response?.questions;

        if (!Array.isArray(examQuestions)) {
          console.error("Questions must be an array");
          return;
        }

        // Optional: shuffle questions
        // const shuffled = examQuestions.sort(() => Math.random() - 0.5);

        const formatted = examQuestions.map((q) => ({
          question: q.question,
          options: {
            A: q.options.A,
            B: q.options.B,
            C: q.options.C,
            D: q.options.D,
          },
          answer: q.answer ? q.answer.toUpperCase() : null,
          subject: q.subject,
          exam: q.exam || "Unknown",
          year: q.year,
        }));

        setQuestions(formatted);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    getQuestions();
  }, [examType, year, subjects]);

  // Select answer
  const handleSelect = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: option,
    }));
  };

  // Next question
  const nextQuestion = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };

  // Previous question
  const prevQuestion = () => {
    if (index > 0) setIndex(index - 1);
  };

  const questionNavigator = (i) => {
    setIndex(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Toggle submit modal
  const submit = () => {
    
    setSubmitted((prev) => !prev)
  };


  // Submits quiz and calculate score
  const submitQuestions = () => {
    
    // Convert answers object to ordered array
    const userAnswers = questions.map((_, i) => answers[i] || null);
  
    const userScore = calculateScore(userAnswers, questions);
  
    setResult(userScore);
  };


  // displays score modal
  
  const displayScoreModal = () => {

    setShowScoreModal((prev) => !prev);
    
    setSubmitted(false);

    submitQuestions();
  };



  

  return {

    // functions
    submitQuestions,
    displayScoreModal,
    handleSelect,
    nextQuestion,
    prevQuestion,
    currentQuestion,
    submit,
    questionNavigator,

    // values
    showScoreModal,
    questions,
    index,
    answers,
    submitted,
    result
   
  };
};


export default useQuestion;
