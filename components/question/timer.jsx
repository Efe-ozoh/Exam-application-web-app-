"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const Timer = ({ onTimeUp }) => {

  const searchParams = useSearchParams();

  const examType = searchParams.get("examType");

  const EXAM_TIMES = {
    JAMB: 120 * 60,
    POST_UTME: 90 * 60,
    WAEC: 50 * 60,
    NECO: 50 * 60,
  };
  
  const [timeLeft, setTimeLeft] = useState(30);
  
  useEffect(() => {
    setTimeLeft(EXAM_TIMES[examType] || 0);
  }, [examType]);
  

  // countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
  
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timeLeft]);
  

  // Format mm:ss
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex justify-end mx-10 px-5 py-2 rounded-lg text-blue-700 text-center lg:font-bold text-xl">
      <h2 className="font-bold flex"><b className="hidden lg:flex  mx-1">Time Remaining: </b> {minutes}:{seconds}</h2> 
    </div>
  );
};

export default Timer;