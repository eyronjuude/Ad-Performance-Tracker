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
                {/* Chevron + employee name row (expandable header) */}
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                        <th className="px-4 py-3 text-left">
                          <Skeleton className="h-4 w-12" />
                        </th>
                        <th className="px-4 py-3 text-right">
                          <Skeleton className="inline-block h-4 w-24" />
                        </th>
                        <th className="px-4 py-3 text-right">
                          <Skeleton className="inline-block h-4 w-12" />
                        </th>
                        <th className="px-4 py-3 text-center">
                          <Skeleton className="mx-auto h-4 w-24" />
                        </th>
                        <th className="px-4 py-3 text-center">
                          <Skeleton className="mx-auto h-4 w-24" />
                        </th>
                        <th className="px-4 py-3 text-left">
                          <Skeleton className="h-4 w-24" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((row) => (
                        <tr
                          key={row}
                          className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                        >
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Skeleton className="inline-block h-4 w-16" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Skeleton className="inline-block h-4 w-10" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Skeleton className="mx-auto h-3 w-3 rounded-full" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Skeleton className="mx-auto h-3 w-3 rounded-full" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-8 w-24 rounded-md" />
                          </td>
                        </tr>
                      ))}
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
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <Skeleton className="inline-block h-4 w-24" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <Skeleton className="inline-block h-4 w-12" />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Skeleton className="mx-auto h-4 w-24" />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Skeleton className="mx-auto h-4 w-24" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((row) => (
                  <tr
                    key={row}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="inline-block h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="inline-block h-4 w-10" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="mx-auto h-3 w-3 rounded-full" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="mx-auto h-3 w-3 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
