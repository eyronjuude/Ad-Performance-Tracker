"use client";

import { Sidebar } from "./Sidebar";
import { SettingsProvider } from "./SettingsProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SettingsProvider>
  );
}
