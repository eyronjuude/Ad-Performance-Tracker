import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import Home from "@/app/page";

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("Home page (dashboard)", () => {
  it("renders the P1 Ad Performance Dashboard heading", () => {
    renderWithProvider(<Home />);
    expect(
      screen.getByRole("heading", { name: /P1 Ad Performance Dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders employee names as headings and Month column with P1", () => {
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
    expect(screen.getAllByText("Month").length).toBe(3);
    expect(screen.getAllByText("P1").length).toBe(3);
  });

  it("renders View Ads links for each employee", () => {
    renderWithProvider(<Home />);
    const links = screen.getAllByRole("link", { name: /View Ads/i });
    expect(links.length).toBe(3);
    expect(links[0]).toHaveAttribute("href", "/ads?employee_acronym=HM");
  });
});
