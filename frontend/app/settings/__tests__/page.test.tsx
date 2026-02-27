import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import SettingsPage from "../page";
import { fetchSettings } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";

vi.mock("@/lib/settings-api", () => ({
  fetchSettings: vi.fn(),
  saveSettingsApi: vi.fn().mockResolvedValue({}),
}));

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

beforeEach(() => {
  vi.mocked(fetchSettings).mockResolvedValue(getDefaultSettings());
});

describe("Settings page", () => {
  it("renders the Settings heading", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByRole("heading", { name: /Settings/i })
    ).toBeInTheDocument();
  });

  it("renders employee mapping section", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByRole("heading", { name: /Employee mapping/i })
    ).toBeInTheDocument();
  });

  it("renders spend and cROAS evaluation sections", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByText(/Spend evaluation thresholds/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cROAS evaluation thresholds/i)
    ).toBeInTheDocument();
  });

  it("threshold sections have no Remove or Add threshold buttons", async () => {
    renderWithProvider(<SettingsPage />);
    const spendHeading = await screen.findByRole("heading", {
      name: /Spend evaluation thresholds/i,
    });
    const spendSection = spendHeading.closest("section");

    const croasHeading = screen.getByRole("heading", {
      name: /cROAS evaluation thresholds/i,
    });
    const croasSection = croasHeading.closest("section");
    if (spendSection) {
      expect(
        within(spendSection).queryByRole("button", { name: /Remove/i })
      ).not.toBeInTheDocument();
    }
    if (croasSection) {
      expect(
        within(croasSection).queryByRole("button", { name: /Remove/i })
      ).not.toBeInTheDocument();
    }
    expect(
      screen.queryByRole("button", { name: /Add threshold/i })
    ).not.toBeInTheDocument();
  });

  it("shows three threshold intervals (Red, Yellow, Green) per evaluation type", async () => {
    renderWithProvider(<SettingsPage />);
    const descriptions = await screen.findAllByText(
      /Three intervals \(Red, Yellow, Green\)/i
    );
    expect(descriptions).toHaveLength(2);
  });

  it("renders employee status selectors defaulting to Tenured", async () => {
    renderWithProvider(<SettingsPage />);
    const selects = await screen.findAllByLabelText(/Employee status/i);
    expect(selects.length).toBeGreaterThan(0);
    for (const select of selects) {
      expect(select).toHaveValue("tenured");
    }
  });

  it("date range picker is disabled for tenured employees", async () => {
    renderWithProvider(<SettingsPage />);
    const dateRangePickers = await screen.findAllByLabelText(
      /Start and review date range/i
    );
    for (const picker of dateRangePickers) {
      expect(picker).toBeDisabled();
    }
  });

  it("date range picker is enabled when status is changed to probationary", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    const selects = await screen.findAllByLabelText(/Employee status/i);
    await user.selectOptions(selects[0], "probationary");

    const dateRangePickers = screen.getAllByLabelText(
      /Start and review date range/i
    );
    expect(dateRangePickers[0]).toBeEnabled();
  });

  it("shows skeleton while settings are loading", () => {
    vi.mocked(fetchSettings).mockReturnValue(new Promise(() => {}));

    renderWithProvider(<SettingsPage />);

    expect(screen.getByTestId("settings-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Settings/i })
    ).not.toBeInTheDocument();
  });
});
