import React from "react";
import Skeleton from "@mui/material/Skeleton";

const ArticleCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl bg-white shadow-md"
        >
          {/* Image Skeleton */}
          <Skeleton
            variant="rectangular"
            height={192}
            animation="wave"
          />

          {/* Content */}
          <div className="p-4">
            {/* Title Skeleton */}
            <Skeleton
              variant="text"
              height={24}
              width="90%"
              animation="wave"
            />
            <Skeleton
              variant="text"
              height={24}
              width="70%"
              animation="wave"
            />

            {/* Arrow Skeleton */}
            <div className="flex justify-end mt-4">
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                animation="wave"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleCardSkeleton;
