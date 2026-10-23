import React from "react";
import Image from "next/image";
import Link from "next/link";

// Shared article/resource card. `imageFit="contain"` is used for past-question
// logos, while news images keep the default cover behaviour.
const ArticleCard = ({ article, imageFit = "cover" }) => {
  const isExternal = /^https?:\/\//.test(article.url ?? "");

  const content = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-blue-50">
        <Image
          src={article.imgUrl}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={
            imageFit === "contain" ? "object-contain p-6" : "object-cover"
          }
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
          {article.title}
        </h3>

        {article.url ? (
          <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
            View resource
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!article.url) {
    return content;
  }

  return (
    <Link
      href={article.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
};

export default ArticleCard;
