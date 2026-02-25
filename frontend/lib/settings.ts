/**
 * Settings types and defaults.
 * Persistence is handled by the backend API (Postgres or SQLite); see lib/settings-api.ts.
 */

import type { CroasThreshold, Employee, SpendThreshold } from "@/lib/config";
import {
  CROAS_EVALUATION_KEY,
  EMPLOYEES,
  PERIODS,
  SPEND_EVALUATION_KEY,
} from "@/lib/config";

export interface Settings {
  employees: Employee[];
  spendEvaluationKey: SpendThreshold[];
  croasEvaluationKey: CroasThreshold[];
  periods: readonly string[];
}

/** Default settings. Use for SSR and initial client render before API load. */
export function getDefaultSettings(): Settings {
  return {
    employees: [...EMPLOYEES],
    spendEvaluationKey: JSON.parse(JSON.stringify(SPEND_EVALUATION_KEY)),
    croasEvaluationKey: JSON.parse(JSON.stringify(CROAS_EVALUATION_KEY)),
    periods: [...PERIODS],
  };
}
