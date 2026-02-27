"use client";

export interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block with pulse animation. Use for loading placeholders.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${className ?? ""}`}
      aria-hidden
    />
  );
}
