"use client";

import { useSettings } from "@/components/SettingsProvider";
import type { Employee, CroasThreshold, SpendThreshold } from "@/lib/config";

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
      employees: [...prev.employees, { acronym: "", name: "" }],
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
      <div className="space-y-3">
        {settings.employees.map((emp, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
          >
            <input
              type="text"
              placeholder="Acronym"
              value={emp.acronym}
              onChange={(e) => updateEmployee(i, { acronym: e.target.value })}
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
        ))}
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

function ThresholdRow({
  threshold,
  onUpdate,
  colorLabel,
}: {
  threshold: SpendThreshold | CroasThreshold;
  onUpdate: (updates: Partial<SpendThreshold | CroasThreshold>) => void;
  colorLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        placeholder="Min"
        value={threshold.min || ""}
        onChange={(e) =>
          onUpdate({ min: e.target.value ? Number(e.target.value) : 0 })
        }
        className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      />
      <span className="text-zinc-500">–</span>
      <input
        type="number"
        placeholder="Max (empty = no cap)"
        value={threshold.max ?? ""}
        onChange={(e) =>
          onUpdate({
            max: e.target.value ? Number(e.target.value) : null,
          })
        }
        className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      />
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
  const { error } = useSettings();

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
