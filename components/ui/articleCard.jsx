import React from "react";
import Image from "next/image";
import Link from "next/link"

const ArticleCard = ({ article }) => {
  return (
    <Link href={article.url}>
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg my-3 mx-6 p-3 text-center">
      
      {/* Image */}
      <div className="relative h-48 w-full radius-15 mx-auto">
        <Image
          src={article.imgUrl}
          alt={article.title}
          fill
          className="object-fit"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="mb-4 text-sm font-semibold text-gray-900 line-clamp-2">
          {article.title}
        </h3>
        
      </div>
    </article>
    </Link>
  );
};

export default ArticleCard;
