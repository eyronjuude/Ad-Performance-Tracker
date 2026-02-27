"use client";

import { Skeleton } from "./Skeleton";

export function SettingsSkeleton() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8" data-testid="settings-skeleton">
      <header className="mb-8">
        <Skeleton className="mb-2 h-8 w-32 sm:h-9 sm:w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </header>

      <div className="space-y-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="mb-4 h-4 w-full max-w-md" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 min-w-[120px] flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Skeleton className="mb-4 h-6 w-56" />
          <Skeleton className="mb-4 h-4 w-full max-w-md" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Skeleton className="mb-4 h-6 w-52" />
          <Skeleton className="mb-4 h-4 w-full max-w-md" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
