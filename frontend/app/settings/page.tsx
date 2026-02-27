"use client";

import { DatePicker } from "@/components/DatePicker";
import { SettingsSkeleton } from "@/components/SettingsSkeleton";
import { useSettings } from "@/components/SettingsProvider";
import type {
  Employee,
  EmployeeStatus,
  CroasThreshold,
  SpendThreshold,
} from "@/lib/config";

function EmployeeMappingSection() {
  const { settings, setSettings } = useSettings();

  const updateEmployee = (index: number, updates: Partial<Employee>) => {
    setSettings((prev) => {
      const next = [...prev.employees];
      next[index] = { ...next[index], ...updates };
      return { ...prev, employees: next };
    });
  };

  const addEmployee = () => {
    setSettings((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        {
          acronym: "",
          name: "",
          status: "tenured" as EmployeeStatus,
          startDate: null,
          reviewDate: null,
        },
      ],
    }));
  };

  const removeEmployee = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Employee mapping
      </h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Map BigQuery acronyms to display names. Acronym is used for filtering;
        name is shown in the dashboard.
      </p>
      <div className="space-y-4">
        {settings.employees.map((emp, i) => {
          const isTenured = (emp.status ?? "tenured") === "tenured";
          const datesDisabled = isTenured;
          const hasDateWarning =
            !isTenured &&
            ((emp.startDate && !emp.reviewDate) ||
              (!emp.startDate && emp.reviewDate));
          const hasDateError =
            !isTenured &&
            emp.startDate &&
            emp.reviewDate &&
            emp.reviewDate < emp.startDate;

          return (
            <div
              key={i}
              className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <input
                  type="text"
                  placeholder="Acronym"
                  value={emp.acronym}
                  onChange={(e) =>
                    updateEmployee(i, { acronym: e.target.value })
                  }
                  className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
                <input
                  type="text"
                  placeholder="Display name"
                  value={emp.name}
                  onChange={(e) => updateEmployee(i, { name: e.target.value })}
                  className="min-w-[120px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => removeEmployee(i)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-zinc-600 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={emp.status ?? "tenured"}
                  onChange={(e) =>
                    updateEmployee(i, {
                      status: e.target.value as EmployeeStatus,
                      ...(e.target.value === "tenured"
                        ? { startDate: null, reviewDate: null }
                        : {}),
                    })
                  }
                  aria-label="Employee status"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="tenured">Tenured employee</option>
                  <option value="probationary">Probationary employee</option>
                </select>

                <div className="flex flex-wrap items-end gap-3">
                  <DatePicker
                    label="Start date"
                    value={emp.startDate}
                    onChange={(startDate) => updateEmployee(i, { startDate })}
                    maxDate={emp.reviewDate}
                    disabled={datesDisabled}
                    placeholder={isTenured ? "Not required" : "Select date"}
                    id={`employee-${i}-start-date`}
                    aria-label="Start date"
                  />
                  <DatePicker
                    label="Review date"
                    value={emp.reviewDate}
                    onChange={(reviewDate) => updateEmployee(i, { reviewDate })}
                    minDate={emp.startDate}
                    disabled={datesDisabled}
                    placeholder={isTenured ? "Not required" : "Select date"}
                    id={`employee-${i}-review-date`}
                    aria-label="Review date"
                  />
                </div>
              </div>

              {hasDateWarning && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Both start date and review date should be set for probationary
                  employees.
                </p>
              )}
              {hasDateError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Review date must be after start date.
                </p>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addEmployee}
          className="rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          + Add employee
        </button>
      </div>
    </section>
  );
}

/** Format number as $X,XXX with thousand separators. */
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Parse currency string to number; empty returns null. */
function parseCurrency(input: string): number | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits === "") return null;
  return Number.parseInt(digits, 10);
}

function ThresholdRow({
  threshold,
  onUpdate,
  colorLabel,
  format = "number",
}: {
  threshold: SpendThreshold | CroasThreshold;
  onUpdate: (updates: Partial<SpendThreshold | CroasThreshold>) => void;
  colorLabel: string;
  format?: "number" | "currency";
}) {
  const isCurrency = format === "currency";

  const minDisplay =
    isCurrency && typeof threshold.min === "number"
      ? formatCurrency(threshold.min)
      : threshold.min != null
        ? String(threshold.min)
        : "";

  const maxDisplay =
    isCurrency && threshold.max != null
      ? formatCurrency(threshold.max)
      : threshold.max != null
        ? String(threshold.max)
        : "";

  const handleMinChange = (raw: string) => {
    if (isCurrency) {
      const n = parseCurrency(raw);
      onUpdate({ min: n ?? 0 });
    } else {
      const parsed = raw === "" ? 0 : Number(raw);
      onUpdate({ min: Number.isNaN(parsed) ? 0 : parsed });
    }
  };

  const handleMaxChange = (raw: string) => {
    if (isCurrency) {
      const n = parseCurrency(raw);
      onUpdate({ max: n });
    } else {
      const parsed = raw === "" ? null : Number(raw);
      onUpdate({
        max: parsed === null || Number.isNaN(parsed) ? null : parsed,
      });
    }
  };

  const minInput = isCurrency ? (
    <input
      type="text"
      inputMode="numeric"
      placeholder="Min"
      value={minDisplay}
      onChange={(e) => handleMinChange(e.target.value)}
      className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      aria-label="Minimum value"
    />
  ) : (
    <input
      type="number"
      placeholder="Min"
      value={threshold.min != null ? threshold.min : ""}
      onChange={(e) => handleMinChange(e.target.value)}
      className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      aria-label="Minimum value"
    />
  );

  const maxInput = isCurrency ? (
    <input
      type="text"
      inputMode="numeric"
      placeholder="Max (empty = no cap)"
      value={maxDisplay}
      onChange={(e) => handleMaxChange(e.target.value)}
      className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      aria-label="Maximum value (empty for no cap)"
    />
  ) : (
    <input
      type="number"
      placeholder="Max (empty = no cap)"
      value={threshold.max != null ? threshold.max : ""}
      onChange={(e) => handleMaxChange(e.target.value)}
      className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      aria-label="Maximum value (empty for no cap)"
    />
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {minInput}
      <span className="text-zinc-500">–</span>
      {maxInput}
      <span className="text-sm text-zinc-500">→ {colorLabel}</span>
    </div>
  );
}

const SPEND_DEFAULTS: [SpendThreshold, SpendThreshold, SpendThreshold] = [
  { min: 20_000, max: null, color: "green" },
  { min: 10_000, max: 20_000, color: "yellow" },
  { min: 0, max: 10_000, color: "red" },
];

const CROAS_DEFAULTS: [CroasThreshold, CroasThreshold, CroasThreshold] = [
  { min: 3, max: null, color: "green" },
  { min: 1, max: 3, color: "yellow" },
  { min: 0, max: 1, color: "red" },
];

function getThreeSpendThresholds(
  key: SpendThreshold[]
): [SpendThreshold, SpendThreshold, SpendThreshold] {
  const byColor = {
    green: key.find((t) => t.color === "green") ?? SPEND_DEFAULTS[0],
    yellow: key.find((t) => t.color === "yellow") ?? SPEND_DEFAULTS[1],
    red: key.find((t) => t.color === "red") ?? SPEND_DEFAULTS[2],
  };
  return [byColor.green, byColor.yellow, byColor.red];
}

function getThreeCroasThresholds(
  key: CroasThreshold[]
): [CroasThreshold, CroasThreshold, CroasThreshold] {
  const byColor = {
    green: key.find((t) => t.color === "green") ?? CROAS_DEFAULTS[0],
    yellow: key.find((t) => t.color === "yellow") ?? CROAS_DEFAULTS[1],
    red: key.find((t) => t.color === "red") ?? CROAS_DEFAULTS[2],
  };
  return [byColor.green, byColor.yellow, byColor.red];
}

function SpendEvaluationSection() {
  const { settings, setSettings } = useSettings();
  const thresholds = getThreeSpendThresholds(settings.spendEvaluationKey);

  const updateSpendThreshold = (
    index: number,
    updates: Partial<SpendThreshold>
  ) => {
    setSettings((prev) => {
      const three = getThreeSpendThresholds(prev.spendEvaluationKey);
      three[index] = { ...three[index], ...updates };
      return { ...prev, spendEvaluationKey: three };
    });
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Spend evaluation thresholds (AUD)
      </h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Three intervals (Red, Yellow, Green). Edit only the min/max values.
      </p>
      <div className="space-y-3">
        {thresholds.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 text-sm font-medium text-zinc-700 capitalize dark:text-zinc-300">
              {t.color}:
            </span>
            <ThresholdRow
              threshold={t}
              onUpdate={(u) => updateSpendThreshold(i, u)}
              colorLabel={t.color}
              format="currency"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function CroasEvaluationSection() {
  const { settings, setSettings } = useSettings();
  const thresholds = getThreeCroasThresholds(settings.croasEvaluationKey);

  const updateCroasThreshold = (
    index: number,
    updates: Partial<CroasThreshold>
  ) => {
    setSettings((prev) => {
      const three = getThreeCroasThresholds(prev.croasEvaluationKey);
      three[index] = { ...three[index], ...updates };
      return { ...prev, croasEvaluationKey: three };
    });
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        cROAS evaluation thresholds
      </h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Three intervals (Red, Yellow, Green). Edit only the min/max values.
      </p>
      <div className="space-y-3">
        {thresholds.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 text-sm font-medium text-zinc-700 capitalize dark:text-zinc-300">
              {t.color}:
            </span>
            <ThresholdRow
              threshold={t}
              onUpdate={(u) => updateCroasThreshold(i, u)}
              colorLabel={t.color}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { error, isLoading } = useSettings();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Configure employee mappings, evaluation thresholds, and other options.
          Changes are saved automatically.
        </p>
      </header>

      {error != null && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-8">
        <EmployeeMappingSection />
        <SpendEvaluationSection />
        <CroasEvaluationSection />
      </div>
    </div>
  );
}
