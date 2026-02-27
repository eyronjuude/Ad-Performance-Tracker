"use client";

import Link from "next/link";
import type { CroasThreshold, Employee, SpendThreshold } from "@/lib/config";
import { Skeleton } from "./Skeleton";
import {
  getCroasEvaluationColor,
  getSpendEvaluationColor,
} from "@/lib/evaluation";
import type { EmployeeAggregates } from "@/lib/api";

const DOT_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-zinc-400",
};

function formatSpendAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCroas(value: number): string {
  return value.toFixed(2);
}

interface ProbationaryEmployeeTableProps {
  employees: Employee[];
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

export function ProbationaryEmployeeTable({
  employees,
  spendEvaluationKey,
  croasEvaluationKey,
  state,
}: ProbationaryEmployeeTableProps) {
  if (employees.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Employee
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Start Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Review Date
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
          {employees.map((employee) => {
            const s = state[employee.acronym];
            const aggregates = s?.aggregates ?? null;
            const error = s?.error ?? null;
            const isLoading = s?.isLoading ?? true;

            const missingDates = !employee.startDate || !employee.reviewDate;

            const spendColor =
              aggregates != null
                ? getSpendEvaluationColor(
                    aggregates.totalSpend,
                    spendEvaluationKey
                  )
                : "gray";
            const croasColor =
              aggregates != null
                ? getCroasEvaluationColor(
                    aggregates.blendedCroas,
                    croasEvaluationKey
                  )
                : "gray";

            const adsHref = buildAdsHref(employee);

            return (
              <tr
                key={employee.acronym}
                className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {employee.name}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {employee.acronym}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  {employee.startDate ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  {employee.reviewDate ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                  {missingDates ? (
                    <span
                      className="text-xs text-amber-600 dark:text-amber-400"
                      title="Set start and review dates in settings"
                    >
                      Missing dates
                    </span>
                  ) : isLoading ? (
                    <Skeleton className="inline-block h-4 w-16" />
                  ) : error ? (
                    "—"
                  ) : aggregates != null ? (
                    formatSpendAud(aggregates.totalSpend)
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right text-zinc-900 tabular-nums dark:text-zinc-50">
                  {missingDates ? (
                    "—"
                  ) : isLoading ? (
                    <Skeleton className="inline-block h-4 w-10" />
                  ) : error ? (
                    "—"
                  ) : aggregates != null ? (
                    formatCroas(aggregates.blendedCroas)
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {missingDates || error ? (
                    <span className="inline-block h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  ) : isLoading ? (
                    <Skeleton className="mx-auto h-3 w-3 rounded-full" />
                  ) : (
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${DOT_COLORS[spendColor] ?? DOT_COLORS.gray}`}
                      title={`Spend: ${aggregates != null ? formatSpendAud(aggregates.totalSpend) : "—"}`}
                      aria-hidden
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {missingDates || error ? (
                    <span className="inline-block h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  ) : isLoading ? (
                    <Skeleton className="mx-auto h-3 w-3 rounded-full" />
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
                    href={adsHref}
                    className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    View Phase Ads
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function buildAdsHref(employee: Employee): string {
  const params = new URLSearchParams({
    employee_acronym: employee.acronym,
  });
  if (employee.startDate) params.set("start_date", employee.startDate);
  if (employee.reviewDate) params.set("end_date", employee.reviewDate);
  return `/ads?${params.toString()}`;
}
