"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Settings } from "@/lib/settings";
import { fetchSettings, saveSettingsApi } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";

const SettingsContext = createContext<{
  settings: Settings;
  setSettings: (settings: Settings | ((prev: Settings) => Settings)) => void;
  save: () => void;
  error: string | null;
  isLoading: boolean;
} | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(getDefaultSettings);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchSettings()
      .then((data) => {
        if (!cancelled) {
          setSettingsState(data);
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

  const save = useCallback(() => {
    setError(null);
    saveSettingsApi(settings).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    });
  }, [settings]);

  const setSettings = useCallback(
    (value: Settings | ((prev: Settings) => Settings)) => {
      setError(null);
      setSettingsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveSettingsApi(next).catch((e) => {
          setError(e instanceof Error ? e.message : "Failed to save settings");
        });
        return next;
      });
    },
    []
  );

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, save, error, isLoading }}
    >
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
