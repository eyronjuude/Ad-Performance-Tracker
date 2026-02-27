"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  fetchPerformance,
  fetchPerformanceByDate,
  aggregatePerformance,
  type PerformanceRow,
} from "@/lib/api";
import { useSettings } from "@/components/SettingsProvider";
import { AdsTable } from "@/components/AdsTable";
import { AdsTableSkeleton } from "@/components/AdsTableSkeleton";

function formatSpendAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
        {isLoading ? (
          <span className="inline-block h-7 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      }
    >
      <AdsPageContent />
    </Suspense>
  );
}

function AdsPageContent() {
  const searchParams = useSearchParams();
  const acronym = searchParams.get("employee_acronym") ?? "";
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const isProbationary = Boolean(startDate && endDate);

  const { settings } = useSettings();
  const employee = useMemo(
    () => settings.employees.find((e) => e.acronym === acronym),
    [settings.employees, acronym]
  );

  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!acronym) return;
    setIsLoading(true);
    setError(null);
    try {
      const data =
        isProbationary && startDate && endDate
          ? await fetchPerformanceByDate(acronym, startDate, endDate)
          : await fetchPerformance(acronym);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ad data");
    } finally {
      setIsLoading(false);
    }
  }, [acronym, isProbationary, startDate, endDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const aggregates = useMemo(() => aggregatePerformance(rows), [rows]);

  if (!acronym) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            No employee selected
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Please select an employee from the dashboard.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {employee?.name ?? acronym}
            </h1>
            <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:bg-zinc-700 dark:text-zinc-300">
              {acronym}
            </span>
          </div>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {isProbationary
              ? `Ad performance from ${startDate} to ${endDate}`
              : "P1 ad performance details from BigQuery"}
          </p>
        </header>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Spend"
            value={formatSpendAud(aggregates.totalSpend)}
            isLoading={isLoading}
          />
          <StatCard
            label="Blended cROAS"
            value={aggregates.blendedCroas.toFixed(2)}
            isLoading={isLoading}
          />
          <StatCard
            label="Total Ads"
            value={aggregates.rowCount.toString()}
            isLoading={isLoading}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Failed to load ad data
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
              <button
                onClick={() => void loadData()}
                className="ml-auto rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && <AdsTableSkeleton />}

        {/* Ads table */}
        {!isLoading && !error && <AdsTable rows={rows} />}
      </div>
    </div>
  );
}
