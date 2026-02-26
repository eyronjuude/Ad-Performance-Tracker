/**
 * Settings API client. Fetches from and saves to the backend (Postgres or SQLite).
 */

import type { Settings } from "./settings";
import type { CroasThreshold, SpendThreshold } from "./config";

const API_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    : "http://127.0.0.1:8000";

const SPEND_DEFAULTS: SpendThreshold[] = [
  { min: 20_000, max: null, color: "green" },
  { min: 10_000, max: 20_000, color: "yellow" },
  { min: 0, max: 10_000, color: "red" },
];

const CROAS_DEFAULTS: CroasThreshold[] = [
  { min: 3, max: null, color: "green" },
  { min: 1, max: 3, color: "yellow" },
  { min: 0, max: 1, color: "red" },
];

function parseThreshold(t: {
  min?: number;
  max?: number | null;
  color?: string;
}): { min: number; max: number | null; color: "green" | "yellow" | "red" } {
  return {
    min: Number(t?.min ?? 0),
    max: t?.max != null ? Number(t.max) : null,
    color: (t?.color === "green" || t?.color === "yellow" || t?.color === "red"
      ? t.color
      : "green") as "green" | "yellow" | "red",
  };
}

function normalizeThresholds<T extends SpendThreshold | CroasThreshold>(
  raw: unknown,
  defaults: T[]
): T[] {
  if (!Array.isArray(raw)) return defaults;
  const parsed = (
    raw as Array<{ min?: number; max?: number | null; color?: string }>
  ).map(parseThreshold) as T[];
  const byColor = {
    green: parsed.find((t) => t.color === "green") ?? defaults[0],
    yellow: parsed.find((t) => t.color === "yellow") ?? defaults[1],
    red: parsed.find((t) => t.color === "red") ?? defaults[2],
  };
  return [byColor.green, byColor.yellow, byColor.red] as T[];
}

/** Map backend camelCase to our Settings shape. Always exactly 3 thresholds (Red, Yellow, Green). */
function normalizeSettings(raw: Record<string, unknown>): Settings {
  return {
    employees: Array.isArray(raw.employees)
      ? (raw.employees as { acronym: string; name: string }[]).map((e) => ({
          acronym: String(e?.acronym ?? ""),
          name: String(e?.name ?? ""),
        }))
      : [],
    spendEvaluationKey: normalizeThresholds(
      raw.spendEvaluationKey,
      SPEND_DEFAULTS
    ),
    croasEvaluationKey: normalizeThresholds(
      raw.croasEvaluationKey,
      CROAS_DEFAULTS
    ),
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
