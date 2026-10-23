"use client";

import ArticleCard from "@/components/ui/articleCard";
import { list } from "@/components/past_questions/PastQuestionList";

const PastQuestions = () => {
  return (
    <main className="min-h-screen bg-[#f5f3ff] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Past Questions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
              Free practice material and past papers to help you prepare with
              confidence.
            </p>
          </div>

          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            {list.length} resources
          </span>
        </div>

        {/* One card at a time on phones, two on tablets, three on desktop. */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((article, id) => (
            <ArticleCard
              key={id}
              article={article}
              imageFit="contain"
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default PastQuestions;
