/**
 * Dashboard configuration: employees and evaluation keys.
 *
 * BigQuery has no employee name data—only acronyms (in ad/adset names) are used
 * for filtering. This config provides our custom mapping: acronym → display name.
 * - acronym: used for BigQuery querying
 * - name: custom display name shown in the dashboard (maintained here, not from API)
 */

export interface Employee {
  acronym: string;
  name: string;
}

/** Custom mapping of acronym → display name. Add or edit entries as needed. */
export const EMPLOYEES: Employee[] = [
  { acronym: "HM", name: "Employee HM" },
  { acronym: "ABC", name: "Employee ABC" },
  { acronym: "XYZ", name: "Employee XYZ" },
];

/** Periods shown in the table (P1, P2, etc.). Add more when backend supports them. */
export const PERIODS = ["P1"] as const;

export type EvaluationColor = "green" | "yellow" | "red" | "gray";

export interface SpendThreshold {
  min: number;
  max: number | null;
  color: EvaluationColor;
}

/**
 * Spend evaluation key: color based on total spend (AUD).
 * Configurable ranges; adjust thresholds as needed.
 * Green: > $20,000; Yellow: $10,000–$20,000; Red: < $10,000.
 */
export const SPEND_EVALUATION_KEY: SpendThreshold[] = [
  { min: 20_000, max: null, color: "green" },
  { min: 10_000, max: 20_000, color: "yellow" },
  { min: 0, max: 10_000, color: "red" },
];

export interface CroasThreshold {
  min: number;
  max: number | null;
  color: EvaluationColor;
}

/**
 * cROAS evaluation key: color based on blended cROAS.
 * Configurable ranges; adjust thresholds as needed.
 */
export const CROAS_EVALUATION_KEY: CroasThreshold[] = [
  { min: 3, max: null, color: "green" },
  { min: 1, max: 3, color: "yellow" },
  { min: 0, max: 1, color: "red" },
];
