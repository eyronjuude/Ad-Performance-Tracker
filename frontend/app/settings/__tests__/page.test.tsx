import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import SettingsPage from "../page";

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("Settings page", () => {
  it("renders the Settings heading", () => {
    renderWithProvider(<SettingsPage />);
    expect(
      screen.getByRole("heading", { name: /Settings/i })
    ).toBeInTheDocument();
  });

  it("renders employee mapping section", () => {
    renderWithProvider(<SettingsPage />);
    expect(
      screen.getByRole("heading", { name: /Employee mapping/i })
    ).toBeInTheDocument();
  });

  it("renders spend and cROAS evaluation sections", () => {
    renderWithProvider(<SettingsPage />);
    expect(
      screen.getByText(/Spend evaluation thresholds/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cROAS evaluation thresholds/i)
    ).toBeInTheDocument();
  });

  it("threshold sections have no Remove or Add threshold buttons", () => {
    renderWithProvider(<SettingsPage />);
    const spendSection = screen
      .getByRole("heading", { name: /Spend evaluation thresholds/i })
      .closest("section");
    const croasSection = screen
      .getByRole("heading", { name: /cROAS evaluation thresholds/i })
      .closest("section");
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

  it("shows three threshold intervals (Red, Yellow, Green) per evaluation type", () => {
    renderWithProvider(<SettingsPage />);
    const descriptions = screen.getAllByText(
      /Three intervals \(Red, Yellow, Green\)/i
    );
    expect(descriptions).toHaveLength(2);
  });
});
