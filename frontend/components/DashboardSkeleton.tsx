"use client";

import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950"
      data-testid="dashboard-skeleton"
    >
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Skeleton className="mb-2 h-8 w-64 sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </header>

        <section className="mb-12">
          <Skeleton className="mb-2 h-6 w-44" />
          <Skeleton className="mb-4 h-4 w-72" />
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                        {[1, 2, 3, 4, 5, 6].map((col) => (
                          <th key={col} className="px-4 py-3">
                            <Skeleton className="h-4 w-16" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        {[1, 2, 3, 4, 5, 6].map((col) => (
                          <td key={col} className="px-4 py-3">
                            <Skeleton
                              className={`h-4 ${col <= 2 ? "w-20" : col <= 4 ? "w-8" : "w-16"}`}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="mb-2 h-6 w-52" />
          <Skeleton className="mb-4 h-4 w-80" />
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                  {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <th key={col} className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <td key={col} className="px-4 py-3">
                      <Skeleton
                        className={`h-4 ${col <= 3 ? "w-20" : col <= 5 ? "w-8" : "w-16"}`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
