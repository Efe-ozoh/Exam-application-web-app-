"use client";

import React, { useEffect, useRef, useState } from 'react';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import ExamCard from './card';
import {exams } from "./examList"


const CardSlider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<number>(3);
  const [itemWidth, setItemWidth] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisible(2);
      else if (w >= 768) setVisible(2);
      else setVisible(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // measure item width (including gap) whenever visible changes or on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const gap = 12;

    const measure = () => {
      // pick the first snap-start child (one card)
      const child = el.querySelector<HTMLDivElement>('.snap-start');
      if (child) {
        const width = child.getBoundingClientRect().width;
        setItemWidth(width + gap);
      }
    };

    // measure initially
    measure();

    // observe size changes (images loading, fonts, etc.)
    const ro = new ResizeObserver(() => measure());
    // observe container and its children
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c as Element));

    return () => ro.disconnect();
  }, [visible]);

  const scroll = (dir: number) => {
    const el = containerRef.current;
    if (!el) return;
    if (itemWidth === 0) return;
    const single = itemWidth; // includes gap
    const originalCount = exams.length;
    const offset = single * visible * dir;

    el.scrollBy({ left: offset, behavior: 'smooth' });

    // after scroll completes, check bounds and wrap if needed
    setTimeout(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      // if scrolled past the end copy, jump back by originalCount * single
      if (el.scrollLeft >= (originalCount * 2) * single - single) {
        el.scrollLeft = el.scrollLeft - originalCount * single;
      }
      // if scrolled before the first copy, jump forward
      if (el.scrollLeft <= (originalCount - 1) * single - single) {
        el.scrollLeft = el.scrollLeft + originalCount * single;
      }
    }, 700);
  };

  // autoplay
  const autoplayRef = React.useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);

  // continuous autoplay using tripled items technique
  const items = React.useMemo(() => [...exams, ...exams, ...exams], []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || itemWidth === 0) return;

    const gap = 16;
    const single = itemWidth; // includes gap
    const originalCount = exams.length;
    const startIndex = originalCount; // start in middle copy

    // set initial scroll to middle
    el.scrollLeft = startIndex * single;

    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    if (!hovered) {
      autoplayRef.current = window.setInterval(() => {
        // scroll forward by visible items
        el.scrollBy({ left: single * visible, behavior: 'smooth' });

        // after animation, if we're near the end, jump back to middle equivalent
        setTimeout(() => {
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (el.scrollLeft >= (items.length - originalCount - visible) * single) {
            // jump back by originalCount * single
            el.scrollLeft = el.scrollLeft - originalCount * single;
          }
        }, 10000);
      }, 7000);
    }

    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemWidth, visible, hovered]);

  return (
  <div className="relative w-full overflow-hidden mb-4 mt-10 pb-20">
      <button
        aria-label="Previous"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
      >
       <ArrowBackIos />
      </button>

      <div
        ref={containerRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
      >
        {items.map((exam, idx) => (
          <div
            key={`${idx}-${exam.title}`}
            className="snap-start #slider"
            style={{
              flex: `0 0 ${100 / visible}%`,
              maxWidth: `${100 / visible}%`,
            }}
          >
          
            <ExamCard title={exam.title} description={exam.description} image={exam.image} />
            
          </div>
        ))}
      </div>

      <button
        aria-label="Next"
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
      >
       <ArrowForwardIos />
      </button>
    </div>
  );
};

export default CardSlider;
