import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import Home from "@/app/page";

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("Home page (dashboard)", () => {
  it("renders the Ad Performance Dashboard heading", () => {
    renderWithProvider(<Home />);
    expect(
      screen.getByRole("heading", { name: /Ad Performance Dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders Tenured Employees section heading when tenured employees exist", () => {
    renderWithProvider(<Home />);
    expect(
      screen.getByRole("heading", { name: /Tenured Employees/i })
    ).toBeInTheDocument();
  });

  it("renders employee names as headings, collapsed by default", () => {
    renderWithProvider(<Home />);
    expect(
      screen.getByRole("heading", { name: "Employee HM" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Employee ABC" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Employee XYZ" })
    ).toBeInTheDocument();

    const toggleButtons = screen.getAllByRole("button", {
      name: /Employee/i,
    });
    for (const btn of toggleButtons) {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    }

    expect(screen.queryByText("Month")).not.toBeInTheDocument();
  });

  it("expands a section when the heading is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Home />);

    const hmButton = screen.getByRole("button", { name: "Employee HM" });
    expect(hmButton).toHaveAttribute("aria-expanded", "false");

    await user.click(hmButton);

    expect(hmButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument();
  });

  it("renders View Ads links only when section is expanded", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Home />);

    expect(screen.queryAllByRole("link", { name: /View Ads/i })).toHaveLength(
      0
    );

    const hmButton = screen.getByRole("button", { name: "Employee HM" });
    await user.click(hmButton);

    const links = screen.getAllByRole("link", { name: /View Ads/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/ads?employee_acronym=HM");
  });

  it("does not render Probationary Employees section when none exist", () => {
    renderWithProvider(<Home />);
    expect(
      screen.queryByRole("heading", { name: /Probationary Employees/i })
    ).not.toBeInTheDocument();
  });
});
