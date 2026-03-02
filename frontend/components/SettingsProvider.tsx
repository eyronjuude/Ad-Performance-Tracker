"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Settings } from "@/lib/settings";
import { fetchSettings, saveSettingsApi } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";

function settingsEqual(a: Settings, b: Settings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const SettingsContext = createContext<{
  settings: Settings;
  setSettings: (settings: Settings | ((prev: Settings) => Settings)) => void;
  isDirty: boolean;
  save: () => Promise<void>;
  revert: () => void;
  error: string | null;
  isLoading: boolean;
} | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(getDefaultSettings);
  const [committedSettings, setCommittedSettings] =
    useState<Settings>(getDefaultSettings);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => {
        if (!cancelled) {
          setSettingsState(data);
          setCommittedSettings(data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load settings");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSettings = useCallback(
    (value: Settings | ((prev: Settings) => Settings)) => {
      setError(null);
      setSettingsState((prev) => {
        return typeof value === "function" ? value(prev) : value;
      });
    },
    []
  );

  const save = useCallback(async () => {
    setError(null);
    try {
      const saved = await saveSettingsApi(settings);
      setCommittedSettings(saved);
      setSettingsState(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
      throw e;
    }
  }, [settings]);

  const revert = useCallback(() => {
    setError(null);
    setSettingsState(committedSettings);
  }, [committedSettings]);

  const isDirty = useMemo(
    () => !settingsEqual(settings, committedSettings),
    [settings, committedSettings]
  );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      isDirty,
      save,
      revert,
      error,
      isLoading,
    }),
    [settings, setSettings, isDirty, save, revert, error, isLoading]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
