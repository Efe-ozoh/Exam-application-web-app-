"use client";

import React, { useEffect, useRef, useState } from "react";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import ExamCard from "./card";

type Exam = {
  title: string;
  description: string;
  image: string;
};

// Default exam data
const exams: Exam[] = [
  {
    title: "JAMB CBT",
    description: "Practice for your exams with real questions and instant feedback.",
    image: "/assets/jamb_logo.png",
  },
  {
    title: "WAEC",
    description: "Ace your WAEC exams with comprehensive practice tests and solutions.",
    image: "/assets/waec_logo.png",
  },
  {
    title: "NECO",
    description: "Prepare for your NECO exams with our question bank and analytics.",
    image: "/assets/neco_logo.png",
  },
  {
    title: "Post-UTME",
    description: "Get ready for your Post-UTME exams with tailored questions and tips.",
    image: "/assets/post_utme.png",
  },
];

const CardSlider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(1); // items visible on screen
  const [itemWidth, setItemWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Tripled items for infinite loop
  const items = React.useMemo(
    () => [...(exams || []), ...(exams || []), ...(exams || [])],
    []
  );

  // Responsive visible count
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVisible = () => {
      const w = window.innerWidth;
      if (w >= 1280) setVisible(3);
      else if (w >= 768) setVisible(2);
      else setVisible(1);
    };
    updateVisible();

    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  // Measure single item width
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const first = el.querySelector<HTMLDivElement>(".slider-item");
      if (first) {
        const width = first.getBoundingClientRect().width;
        setItemWidth(width);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c as Element));

    return () => ro.disconnect();
  }, [visible]);

  // Scroll function
  const scroll = (dir: number) => {
    const el = containerRef.current;
    if (!el || itemWidth === 0) return;

    const offset = itemWidth * visible * dir;
    el.scrollBy({ left: offset, behavior: "smooth" });

    // wrap-around after animation
    setTimeout(() => {
      if (!el) return;
      const originalCount = exams.length;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft <= 0) {
        el.scrollLeft += originalCount * itemWidth;
      }
      if (el.scrollLeft >= maxScroll - itemWidth) {
        el.scrollLeft -= originalCount * itemWidth;
      }
    }, 400);
  };

  // Autoplay
  useEffect(() => {
    const el = containerRef.current;
    if (!el || itemWidth === 0) return;

    const originalCount = exams.length;
    el.scrollLeft = originalCount * itemWidth; // start at middle copy

    const interval = setInterval(() => {
      if (!hovered) scroll(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [itemWidth, visible, hovered]);

  return (
    <div className="relative w-full overflow-hidden mt-10">
      {/* Previous button */}
      <button
        aria-label="Previous"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow"
      >
        <ArrowBackIos />
      </button>

      {/* Cards container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
      >
        {items
       .filter((exam) => exam?.title && exam?.description && exam?.image)
       .map((exam, idx) => (
        <div key={idx} className="snap-start slider-item flex-shrink-0 px-2">
        <ExamCard
        title={exam.title || "No Title"}
        description={exam.description || "No Description"}
        image={exam.image || "/assets/default.png"}
      />
    </div>
  ))}

      </div>

      {/* Next button */}
      <button
        aria-label="Next"
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center shadow"
      >
        <ArrowForwardIos />
      </button>
    </div>
  );
};

export default CardSlider;
