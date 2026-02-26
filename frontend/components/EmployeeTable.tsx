"use client";

import { useState } from "react";
import Link from "next/link";
import type { CroasThreshold, Employee, SpendThreshold } from "@/lib/config";
import {
  getCroasEvaluationColor,
  getSpendEvaluationColor,
} from "@/lib/evaluation";
import type { EmployeeAggregates } from "@/lib/api";

/** Solid dot colors for evaluation (color only, no text) */
const DOT_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-zinc-400",
};

/** Format spend in AUD: $X,XXX.XX */
function formatSpendAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format cROAS rounded to 2 digits */
function formatCroas(value: number): string {
  return value.toFixed(2);
}

interface EmployeeTableProps {
  employees: Employee[];
  periods: readonly string[];
  spendEvaluationKey: SpendThreshold[];
  croasEvaluationKey: CroasThreshold[];
  state: Record<
    string,
    {
      aggregates: EmployeeAggregates | null;
      error: string | null;
      isLoading: boolean;
    }
  >;
}

export function EmployeeTable({
  employees,
  periods,
  spendEvaluationKey,
  croasEvaluationKey,
  state,
}: EmployeeTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggleSection(acronym: string): void {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(acronym)) {
        next.delete(acronym);
      } else {
        next.add(acronym);
      }
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {employees.map((employee) => {
        const s = state[employee.acronym];
        const aggregates = s?.aggregates ?? null;
        const error = s?.error ?? null;
        const isLoading = s?.isLoading ?? true;
        const spendColor =
          aggregates != null
            ? getSpendEvaluationColor(aggregates.totalSpend, spendEvaluationKey)
            : "gray";
        const croasColor =
          aggregates != null
            ? getCroasEvaluationColor(
                aggregates.blendedCroas,
                croasEvaluationKey
              )
            : "gray";
        const isExpanded = expanded.has(employee.acronym);

        return (
          <section
            key={employee.acronym}
            aria-labelledby={`employee-${employee.acronym}`}
          >
            <h2 className="mb-4">
              <button
                type="button"
                id={`employee-${employee.acronym}`}
                aria-expanded={isExpanded}
                aria-controls={`employee-panel-${employee.acronym}`}
                onClick={() => toggleSection(employee.acronym)}
                className="flex w-full items-center gap-2 text-left text-lg font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
              >
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                {employee.name}
              </button>
            </h2>
            {isExpanded && (
              <div
                id={`employee-panel-${employee.acronym}`}
                role="region"
                aria-labelledby={`employee-${employee.acronym}`}
                className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                      <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                        Month
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        Spend (AUD)
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        cROAS
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">
                        Spend Evaluation
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">
                        cROAS Evaluation
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                        Ads
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr
                        key={period}
                        className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                      >
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {period}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                          {isLoading
                            ? "…"
                            : error
                              ? "—"
                              : aggregates != null
                                ? formatSpendAud(aggregates.totalSpend)
                                : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                          {isLoading
                            ? "…"
                            : error
                              ? "—"
                              : aggregates != null
                                ? formatCroas(aggregates.blendedCroas)
                                : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isLoading || error ? (
                            <span className="inline-block h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          ) : (
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${DOT_COLORS[spendColor] ?? DOT_COLORS.gray}`}
                              title={`Spend: ${aggregates != null ? formatSpendAud(aggregates.totalSpend) : "—"}`}
                              aria-hidden
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isLoading || error ? (
                            <span className="inline-block h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          ) : (
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${DOT_COLORS[croasColor] ?? DOT_COLORS.gray}`}
                              title={`cROAS: ${aggregates != null ? formatCroas(aggregates.blendedCroas) : "—"}`}
                              aria-hidden
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/ads?employee_acronym=${encodeURIComponent(employee.acronym)}`}
                            className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          >
                            View Ads
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {error != null && (
                  <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
                    <p
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
