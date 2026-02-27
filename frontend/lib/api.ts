const API_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    : "http://127.0.0.1:8000";

export interface PerformanceRow {
  ad_name: string;
  adset_name: string;
  spend: number;
  croas: number | null;
}

export interface EmployeeAggregates {
  totalSpend: number;
  blendedCroas: number;
  rowCount: number;
}

/** Fetch P1 performance data for an employee acronym. */
export async function fetchPerformance(
  employeeAcronym: string
): Promise<PerformanceRow[]> {
  const url = new URL("/api/bigquery/performance", API_BASE);
  url.searchParams.set("employee_acronym", employeeAcronym);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail.detail ?? `API error: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<PerformanceRow[]>;
}

/** Fetch pre-aggregated summary (single row) for an employee acronym. */
export async function fetchPerformanceSummary(
  employeeAcronym: string
): Promise<EmployeeAggregates> {
  const url = new URL("/api/bigquery/performance/summary", API_BASE);
  url.searchParams.set("employee_acronym", employeeAcronym);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail.detail ?? `API error: ${res.status} ${res.statusText}`
    );
  }
  const data = (await res.json()) as {
    total_spend: number;
    blended_croas: number | null;
    row_count: number;
  };
  return {
    totalSpend: data.total_spend,
    blendedCroas: data.blended_croas ?? 0,
    rowCount: data.row_count,
  };
}

/** Fetch summary for a date range (no P1 filter). Used for probationary employees. */
export async function fetchPerformanceSummaryByDate(
  employeeAcronym: string,
  startDate: string,
  endDate: string
): Promise<EmployeeAggregates> {
  const url = new URL("/api/bigquery/performance/summary", API_BASE);
  url.searchParams.set("employee_acronym", employeeAcronym);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("p1_only", "false");
  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail.detail ?? `API error: ${res.status} ${res.statusText}`
    );
  }
  const data = (await res.json()) as {
    total_spend: number;
    blended_croas: number | null;
    row_count: number;
  };
  return {
    totalSpend: data.total_spend,
    blendedCroas: data.blended_croas ?? 0,
    rowCount: data.row_count,
  };
}

/** Fetch performance rows for a date range (no P1 filter). Used for probationary employees. */
export async function fetchPerformanceByDate(
  employeeAcronym: string,
  startDate: string,
  endDate: string
): Promise<PerformanceRow[]> {
  const url = new URL("/api/bigquery/performance", API_BASE);
  url.searchParams.set("employee_acronym", employeeAcronym);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("p1_only", "false");
  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail.detail ?? `API error: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<PerformanceRow[]>;
}

/** Aggregate performance rows into totals. Blended CROAS = sum(spend*croas)/sum(spend). */
export function aggregatePerformance(
  rows: PerformanceRow[]
): EmployeeAggregates {
  if (rows.length === 0) {
    return { totalSpend: 0, blendedCroas: 0, rowCount: 0 };
  }
  let totalSpend = 0;
  let weightedRevenue = 0;
  for (const row of rows) {
    totalSpend += row.spend;
    weightedRevenue += row.spend * (row.croas ?? 0);
  }
  return {
    totalSpend,
    blendedCroas: totalSpend > 0 ? weightedRevenue / totalSpend : 0,
    rowCount: rows.length,
  };
}
