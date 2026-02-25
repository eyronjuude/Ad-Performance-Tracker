"use client";

import { useEffect, useState } from "react";
import { EmployeeTable } from "@/components/EmployeeTable";
import { useSettings } from "@/components/SettingsProvider";
import {
  fetchPerformance,
  aggregatePerformance,
  type EmployeeAggregates,
} from "@/lib/api";

interface EmployeeState {
  aggregates: EmployeeAggregates | null;
  error: string | null;
  isLoading: boolean;
}

export default function Home() {
  const { settings } = useSettings();
  const employees = settings.employees.filter((e) => e.acronym.trim() !== "");

  const [state, setState] = useState<Record<string, EmployeeState>>(() =>
    Object.fromEntries(
      employees.map((e) => [
        e.acronym,
        { aggregates: null, error: null, isLoading: true },
      ])
    )
  );

  useEffect(() => {
    if (employees.length === 0) return;
    const loadAll = async () => {
      await Promise.all(
        employees.map(async (employee) => {
          try {
            const rows = await fetchPerformance(employee.acronym);
            const aggregates = aggregatePerformance(rows);
            setState((prev) => ({
              ...prev,
              [employee.acronym]: {
                aggregates,
                error: null,
                isLoading: false,
              },
            }));
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to load data";
            setState((prev) => ({
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
  }, [
    employees
      .map((e) => e.acronym)
      .sort()
      .join(","),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            P1 Ad Performance Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            P1 ads filtered by employee acronym. Data sourced from BigQuery.
          </p>
        </header>

        <EmployeeTable
          employees={employees}
          periods={settings.periods}
          spendEvaluationKey={settings.spendEvaluationKey}
          croasEvaluationKey={settings.croasEvaluationKey}
          state={state}
        />
      </div>
    </div>
  );
}
