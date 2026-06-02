import React from "react";

interface SkeletonProps {
  variant?: "card" | "form" | "table" | "chart";
  count?: number;
}

export default function LoadingSkeleton({ variant = "card", count = 3 }: SkeletonProps) {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  if (variant === "form") {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-12 h-12 bg-gray-200 rounded-xl ${shimmer}`} />
          <div className="space-y-2 flex-1">
            <div className={`h-5 bg-gray-200 rounded-lg w-2/5 ${shimmer}`} />
            <div className={`h-3 bg-gray-100 rounded-lg w-1/3 ${shimmer}`} />
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`h-3 bg-gray-200 rounded w-1/4 ${shimmer}`} />
            <div className={`h-11 bg-gray-100 rounded-lg ${shimmer}`} />
          </div>
        ))}
        <div className={`h-12 bg-sky-100 rounded-xl mt-8 ${shimmer}`} />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="flex justify-between items-center mb-6">
          <div className={`h-6 bg-gray-200 rounded-lg w-1/4 ${shimmer}`} />
          <div className={`h-10 bg-gray-100 rounded-lg w-1/3 ${shimmer}`} />
        </div>
        <div className={`h-12 bg-gray-200 rounded-t-xl ${shimmer}`} />
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-50">
            <div className={`h-4 bg-gray-100 rounded flex-1 ${shimmer}`} />
            <div className={`h-4 bg-gray-100 rounded flex-1 ${shimmer}`} />
            <div className={`h-4 bg-gray-100 rounded w-24 ${shimmer}`} />
            <div className={`h-4 bg-gray-50 rounded w-16 ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-24 bg-gray-100 rounded-xl ${shimmer}`} />
          ))}
        </div>
        <div className={`h-64 bg-gray-50 rounded-xl ${shimmer}`} />
      </div>
    );
  }

  // Default: card variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse p-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`bg-white rounded-xl p-5 border border-gray-100 space-y-3 ${shimmer}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-50 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
