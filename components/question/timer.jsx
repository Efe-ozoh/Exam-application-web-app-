"use client";

import { useEffect, useRef, useState } from "react";

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasEnded = useRef(false);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    hasEnded.current = false;
  }, [duration]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasEnded.current) {
        hasEnded.current = true;
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex justify-end mx-10 px-5 py-2 rounded-lg text-blue-700 text-center lg:font-bold text-xl">
      <h2 className="font-bold flex">
        <b className="hidden lg:flex mx-1">Time Remaining:</b>
        {minutes}:{seconds}
      </h2>
    </div>
  );
};

export default Timer;
