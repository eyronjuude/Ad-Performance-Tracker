"use client";

import { useMemo, useState } from "react";
import type { PerformanceRow } from "@/lib/api";

type SortField = "ad_name" | "adset_name" | "spend" | "croas";
type SortDir = "asc" | "desc";

function formatSpendAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCroas(value: number | null): string {
  if (value == null) return "—";
  return value.toFixed(2);
}

function SortIcon({
  field,
  activeField,
  direction,
}: {
  field: SortField;
  activeField: SortField;
  direction: SortDir;
}) {
  if (field !== activeField) {
    return (
      <svg
        className="ml-1 inline h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 9l4-4 4 4M16 15l-4 4-4-4"
        />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg
      className="ml-1 inline h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg
      className="ml-1 inline h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface AdsTableProps {
  rows: PerformanceRow[];
}

export function AdsTable({ rows }: AdsTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(
        field === "ad_name" || field === "adset_name" ? "asc" : "desc"
      );
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.ad_name.toLowerCase().includes(q) ||
        r.adset_name.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "ad_name":
          cmp = a.ad_name.localeCompare(b.ad_name);
          break;
        case "adset_name":
          cmp = a.adset_name.localeCompare(b.adset_name);
          break;
        case "spend":
          cmp = a.spend - b.spend;
          break;
        case "croas":
          cmp = (a.croas ?? -1) - (b.croas ?? -1);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const thBase =
    "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 select-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors";

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search ads or adsets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="w-8 px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                #
              </th>
              <th
                className={`${thBase} text-left`}
                onClick={() => handleSort("ad_name")}
              >
                Ad Name
                <SortIcon
                  field="ad_name"
                  activeField={sortField}
                  direction={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-left`}
                onClick={() => handleSort("adset_name")}
              >
                Adset Name
                <SortIcon
                  field="adset_name"
                  activeField={sortField}
                  direction={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => handleSort("spend")}
              >
                Spend (AUD)
                <SortIcon
                  field="spend"
                  activeField={sortField}
                  direction={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => handleSort("croas")}
              >
                cROAS
                <SortIcon
                  field="croas"
                  activeField={sortField}
                  direction={sortDir}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  {search
                    ? "No ads match your search."
                    : "No ads found for this employee."}
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr
                  key={`${row.ad_name}-${row.adset_name}`}
                  className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 text-zinc-400 tabular-nums dark:text-zinc-500">
                    {idx + 1}
                  </td>
                  <td
                    className="max-w-xs truncate px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50"
                    title={row.ad_name}
                  >
                    {row.ad_name}
                  </td>
                  <td
                    className="max-w-xs truncate px-4 py-3 text-zinc-700 dark:text-zinc-300"
                    title={row.adset_name}
                  >
                    {row.adset_name}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                    {formatSpendAud(row.spend)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                    {formatCroas(row.croas)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {search && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Showing {sorted.length} of {rows.length} ads
        </p>
      )}
    </div>
  );
}
