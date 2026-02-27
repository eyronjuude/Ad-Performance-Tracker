"use client";

import { Skeleton } from "./Skeleton";

/** Loading skeleton matching AdsTable layout: search bar + 5-col table (#, Ad Name, Adset Name, Spend, cROAS) */
export function AdsTableSkeleton() {
  return (
    <div data-testid="ads-table-skeleton">
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="w-8 px-4 py-3 text-left">
                <Skeleton className="h-4 w-4" />
              </th>
              {["Ad Name", "Adset Name", "Spend", "cROAS"].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton
                    className={`h-4 ${i <= 1 ? "w-24" : i === 2 ? "w-20" : "w-12"}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32 max-w-xs" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28 max-w-xs" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Skeleton className="inline-block h-4 w-16" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Skeleton className="inline-block h-4 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
