"use client";

import { useEffect, useMemo, useState } from "react";
import { EmployeeTable } from "@/components/EmployeeTable";
import { ProbationaryEmployeeTable } from "@/components/ProbationaryEmployeeTable";
import { useSettings } from "@/components/SettingsProvider";
import {
  fetchPerformanceSummary,
  fetchPerformanceSummaryByDate,
  type EmployeeAggregates,
} from "@/lib/api";

interface EmployeeState {
  aggregates: EmployeeAggregates | null;
  error: string | null;
  isLoading: boolean;
}

export default function Home() {
  const { settings } = useSettings();

  const allEmployees = useMemo(
    () => settings.employees.filter((e) => e.acronym.trim() !== ""),
    [settings.employees]
  );

  const tenuredEmployees = useMemo(
    () => allEmployees.filter((e) => (e.status ?? "tenured") === "tenured"),
    [allEmployees]
  );

  const probationaryEmployees = useMemo(
    () => allEmployees.filter((e) => e.status === "probationary"),
    [allEmployees]
  );

  const tenuredKey = useMemo(
    () => tenuredEmployees.map((e) => e.acronym).join(","),
    [tenuredEmployees]
  );

  const probationaryKey = useMemo(
    () =>
      probationaryEmployees
        .map((e) => `${e.acronym}:${e.startDate ?? ""}:${e.reviewDate ?? ""}`)
        .join(","),
    [probationaryEmployees]
  );

  const [tenuredState, setTenuredState] = useState<
    Record<string, EmployeeState>
  >(() =>
    Object.fromEntries(
      tenuredEmployees.map((e) => [
        e.acronym,
        { aggregates: null, error: null, isLoading: true },
      ])
    )
  );

  const [probationaryState, setProbationaryState] = useState<
    Record<string, EmployeeState>
  >(() =>
    Object.fromEntries(
      probationaryEmployees.map((e) => [
        e.acronym,
        { aggregates: null, error: null, isLoading: true },
      ])
    )
  );

  // Load tenured employees (P1 filter via existing endpoint)
  useEffect(() => {
    if (tenuredEmployees.length === 0) {
      setTenuredState({});
      return;
    }

    setTenuredState(
      Object.fromEntries(
        tenuredEmployees.map((e) => [
          e.acronym,
          { aggregates: null, error: null, isLoading: true },
        ])
      )
    );

    let cancelled = false;
    const loadAll = async () => {
      await Promise.all(
        tenuredEmployees.map(async (employee) => {
          try {
            const aggregates = await fetchPerformanceSummary(employee.acronym);
            if (cancelled) return;
            setTenuredState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates,
                error: null,
                isLoading: false,
              },
            }));
          } catch (err) {
            if (cancelled) return;
            const message =
              err instanceof Error ? err.message : "Failed to load data";
            setTenuredState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates: null,
                error: message,
                isLoading: false,
              },
            }));
          }
        })
      );
    };
    void loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenuredKey]);

  // Load probationary employees (date range filter, no P1)
  useEffect(() => {
    if (probationaryEmployees.length === 0) {
      setProbationaryState({});
      return;
    }

    setProbationaryState(
      Object.fromEntries(
        probationaryEmployees.map((e) => [
          e.acronym,
          { aggregates: null, error: null, isLoading: true },
        ])
      )
    );

    let cancelled = false;
    const loadAll = async () => {
      await Promise.all(
        probationaryEmployees.map(async (employee) => {
          if (!employee.startDate || !employee.reviewDate) {
            if (cancelled) return;
            setProbationaryState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates: null,
                error: null,
                isLoading: false,
              },
            }));
            return;
          }
          try {
            const aggregates = await fetchPerformanceSummaryByDate(
              employee.acronym,
              employee.startDate,
              employee.reviewDate
            );
            if (cancelled) return;
            setProbationaryState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates,
                error: null,
                isLoading: false,
              },
            }));
          } catch (err) {
            if (cancelled) return;
            const message =
              err instanceof Error ? err.message : "Failed to load data";
            setProbationaryState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates: null,
                error: message,
                isLoading: false,
              },
            }));
          }
        })
      );
    };
    void loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probationaryKey]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Ad Performance Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Employee ad performance data sourced from BigQuery.
          </p>
        </header>

        {tenuredEmployees.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Tenured Employees
            </h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              P1 ads filtered by employee acronym.
            </p>
            <EmployeeTable
              employees={tenuredEmployees}
              periods={settings.periods}
              spendEvaluationKey={settings.spendEvaluationKey}
              croasEvaluationKey={settings.croasEvaluationKey}
              state={tenuredState}
            />
          </section>
        )}

        {probationaryEmployees.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Probationary Employees
            </h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Filtered by employee acronym and probation date range.
            </p>
            <ProbationaryEmployeeTable
              employees={probationaryEmployees}
              spendEvaluationKey={settings.spendEvaluationKey}
              croasEvaluationKey={settings.croasEvaluationKey}
              state={probationaryState}
            />
          </section>
        )}
      </div>
    </div>
  );
}
