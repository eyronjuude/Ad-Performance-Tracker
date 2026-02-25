/**
 * Settings API client. Fetches from and saves to the backend (Postgres or SQLite).
 */

import type { Settings } from "./settings";

const API_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    : "http://127.0.0.1:8000";

/** Map backend camelCase to our Settings shape. */
function normalizeSettings(raw: Record<string, unknown>): Settings {
  return {
    employees: Array.isArray(raw.employees)
      ? (raw.employees as { acronym: string; name: string }[]).map((e) => ({
          acronym: String(e?.acronym ?? ""),
          name: String(e?.name ?? ""),
        }))
      : [],
    spendEvaluationKey: Array.isArray(raw.spendEvaluationKey)
      ? (
          raw.spendEvaluationKey as Array<{
            min: number;
            max: number | null;
            color: string;
          }>
        ).map((t) => ({
          min: Number(t?.min ?? 0),
          max: t?.max != null ? Number(t.max) : null,
          color: (t?.color ?? "gray") as "green" | "yellow" | "red" | "gray",
        }))
      : [],
    croasEvaluationKey: Array.isArray(raw.croasEvaluationKey)
      ? (
          raw.croasEvaluationKey as Array<{
            min: number;
            max: number | null;
            color: string;
          }>
        ).map((t) => ({
          min: Number(t?.min ?? 0),
          max: t?.max != null ? Number(t.max) : null,
          color: (t?.color ?? "gray") as "green" | "yellow" | "red" | "gray",
        }))
      : [],
    periods: Array.isArray(raw.periods)
      ? (raw.periods as string[]).map(String)
      : [],
  };
}

/** Fetch settings from the backend API. */
export async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) {
    throw new Error(`Failed to load settings: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return normalizeSettings(raw);
}

/** Save settings to the backend API. */
export async function saveSettingsApi(settings: Settings): Promise<Settings> {
  const body = {
    employees: settings.employees,
    spendEvaluationKey: settings.spendEvaluationKey,
    croasEvaluationKey: settings.croasEvaluationKey,
    periods: settings.periods,
  };
  const res = await fetch(`${API_BASE}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      (detail as { detail?: string })?.detail ?? `Failed to save: ${res.status}`
    );
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return normalizeSettings(raw);
}
