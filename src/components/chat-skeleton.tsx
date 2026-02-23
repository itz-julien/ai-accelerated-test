"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton({ supervisor }: { supervisor?: boolean }) {
  if (supervisor) {
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        {/* User message skeleton */}
        <div className="space-y-3">
          <div className="px-4 py-3 bg-zinc-900/50 border-l-2 border-zinc-700 rounded-r space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* 3 model response skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-2 rounded-full ml-auto" />
                </div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second pair */}
        <div className="space-y-3 opacity-50">
          <div className="px-4 py-3 bg-zinc-900/50 border-l-2 border-zinc-700 rounded-r space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Single model skeleton
  return (
    <div className="animate-in fade-in duration-300">
      {/* User message */}
      <div className="px-4 py-3 bg-zinc-900/50 border-l-2 border-zinc-700 space-y-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {/* Assistant response */}
      <div className="px-4 py-3 border-l-2 border-zinc-800 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Second pair - faded */}
      <div className="opacity-50">
        <div className="px-4 py-3 bg-zinc-900/50 border-l-2 border-zinc-700 space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="px-4 py-3 border-l-2 border-zinc-800 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
