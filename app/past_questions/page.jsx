"use client";

import ArticleCardSkeleton from "@/components/skeletons/news";
import ArticleCard from "@/components/ui/articleCard";
import { list } from "@/components/past_questions/PastQuestionList";

const Page = () => {
  

  return (
    <main className="min-h-screen bg-[#f5f3ff] p-4">
      <section className="mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between mt-10 py-20">
          <h2 className="text-xl font-bold text-gray-900">Latest Articles</h2>
        </div>
 
          {/* list */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list?.map((article, id) => (
              <ArticleCard
                key={id}
                article={article}
              />
            ))}
          </div>

      </section>
    </main>
  );
};

export default Page;
