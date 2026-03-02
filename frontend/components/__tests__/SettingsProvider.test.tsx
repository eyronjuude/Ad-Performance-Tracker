import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider, useSettings } from "@/components/SettingsProvider";
import { fetchSettings, saveSettingsApi } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";

vi.mock("@/lib/settings-api", () => ({
  fetchSettings: vi.fn(),
  saveSettingsApi: vi.fn().mockImplementation(async (s) => s),
}));

function TestConsumer() {
  const { settings, setSettings, isDirty, save, revert } = useSettings();
  return (
    <div>
      <span data-testid="dirty">{String(isDirty)}</span>
      <button
        type="button"
        onClick={() => setSettings({ ...settings, employees: [] })}
      >
        Clear employees
      </button>
      <button type="button" onClick={() => save()}>
        Save
      </button>
      <button type="button" onClick={() => revert()}>
        Revert
      </button>
    </div>
  );
}

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

beforeEach(() => {
  vi.mocked(fetchSettings).mockResolvedValue(getDefaultSettings());
});

describe("SettingsProvider", () => {
  it("isDirty is false initially", async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId("dirty")).toHaveTextContent("false");
    });
  });

  it("isDirty becomes true when settings change", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId("dirty")).toHaveTextContent("false");
    });

    await user.click(screen.getByRole("button", { name: /Clear employees/i }));

    expect(screen.getByTestId("dirty")).toHaveTextContent("true");
  });

  it("revert clears dirty state", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId("dirty")).toHaveTextContent("false");
    });

    await user.click(screen.getByRole("button", { name: /Clear employees/i }));
    expect(screen.getByTestId("dirty")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: /Revert/i }));
    expect(screen.getByTestId("dirty")).toHaveTextContent("false");
  });

  it("save calls saveSettingsApi and clears dirty state", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await waitFor(() => {
      expect(screen.getByTestId("dirty")).toHaveTextContent("false");
    });

    await user.click(screen.getByRole("button", { name: /Clear employees/i }));
    expect(screen.getByTestId("dirty")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(saveSettingsApi).toHaveBeenCalled();
      expect(screen.getByTestId("dirty")).toHaveTextContent("false");
    });
  });
});
