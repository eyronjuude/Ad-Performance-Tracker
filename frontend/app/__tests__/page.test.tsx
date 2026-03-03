import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import Home from "@/app/page";
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

describe("Home page (dashboard)", () => {
  it("renders the Ad Performance Dashboard heading", async () => {
    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", { name: /Ad Performance Dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders Tenured Employees section heading when tenured employees exist", async () => {
    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", { name: /Tenured Employees/i })
    ).toBeInTheDocument();
  });

  it("renders employee names as headings, collapsed by default", async () => {
    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", { name: "Employee HM" })
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

    const hmButton = await screen.findByRole("button", {
      name: "Employee HM",
    });
    expect(hmButton).toHaveAttribute("aria-expanded", "false");

    await user.click(hmButton);

    expect(hmButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument();
  });

  it("renders View Phase Ads links only when section is expanded", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Home />);

    const hmButton = await screen.findByRole("button", {
      name: "Employee HM",
    });
    expect(
      screen.queryAllByRole("link", { name: /View Phase Ads/i })
    ).toHaveLength(0);
    await user.click(hmButton);

    const links = screen.getAllByRole("link", { name: /View Phase Ads/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/ads?employee_acronym=HM");
  });

  it("does not render Probationary Employees section when none exist", async () => {
    renderWithProvider(<Home />);
    await screen.findByRole("heading", { name: /Ad Performance Dashboard/i });
    expect(
      screen.queryByRole("heading", { name: /Probationary Employees/i })
    ).not.toBeInTheDocument();
  });

  it("renders probationary employees as collapsible sections", async () => {
    const settings = getDefaultSettings();
    settings.employees.push({
      acronym: "PRB",
      name: "Employee PRB",
      status: "probationary",
      startDate: "2026-01-01",
      reviewDate: "2026-06-01",
    });
    vi.mocked(fetchSettings).mockResolvedValue(settings);

    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", { name: /Probationary Employees/i })
    ).toBeInTheDocument();

    const prbButton = screen.getByRole("button", { name: "Employee PRB" });
    expect(prbButton).toHaveAttribute("aria-expanded", "false");
  });

  it("expands probationary employee section on click", async () => {
    const user = userEvent.setup();
    const settings = getDefaultSettings();
    settings.employees.push({
      acronym: "PRB",
      name: "Employee PRB",
      status: "probationary",
      startDate: "2026-01-01",
      reviewDate: "2026-06-01",
    });
    vi.mocked(fetchSettings).mockResolvedValue(settings);

    renderWithProvider(<Home />);
    const prbButton = await screen.findByRole("button", {
      name: "Employee PRB",
    });

    await user.click(prbButton);

    expect(prbButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Start Date")).toBeInTheDocument();
    expect(screen.getByText("Review Date")).toBeInTheDocument();
    expect(screen.getByText("January 1, 2026")).toBeInTheDocument();
    expect(screen.getByText("June 1, 2026")).toBeInTheDocument();
  });

  it("renders Tenured Employee Comparison section with Phase 1 accordion", async () => {
    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", {
        name: /Tenured Employee Comparison/i,
      })
    ).toBeInTheDocument();
    const phaseOneButton = screen.getByRole("button", { name: /Phase 1/i });
    expect(phaseOneButton).toHaveAttribute("aria-expanded", "false");
  });

  it("expands Tenured Employee Comparison table on Phase 1 click", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Home />);

    const phaseOneButton = await screen.findByRole("button", {
      name: /Phase 1/i,
    });
    await user.click(phaseOneButton);

    expect(phaseOneButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("columnheader", { name: /^Employee$/i })
    ).toBeInTheDocument();
    const viewPhaseLinks = screen.getAllByRole("link", {
      name: /View Phase Ads/i,
    });
    expect(viewPhaseLinks).toHaveLength(3);
  });

  it("renders Probationary Employee Comparison with Employee Name column", async () => {
    const settings = getDefaultSettings();
    settings.employees.push({
      acronym: "PRB",
      name: "Employee PRB",
      status: "probationary",
      startDate: "2026-01-01",
      reviewDate: "2026-06-01",
    });
    vi.mocked(fetchSettings).mockResolvedValue(settings);

    renderWithProvider(<Home />);
    expect(
      await screen.findByRole("heading", {
        name: /Probationary Employee Comparison/i,
      })
    ).toBeInTheDocument();

    const phaseOneButtons = screen.getAllByRole("button", {
      name: /Phase 1/i,
    });
    const probationaryPhaseOne = phaseOneButtons.find(
      (btn) =>
        btn.getAttribute("aria-controls") ===
        "probationary-comparison-phase-one-panel"
    );
    expect(probationaryPhaseOne).toBeDefined();
  });

  it("Probationary Employee Comparison table has Employee Name column when expanded", async () => {
    const user = userEvent.setup();
    const settings = getDefaultSettings();
    settings.employees.push({
      acronym: "PRB",
      name: "Employee PRB",
      status: "probationary",
      startDate: "2026-01-01",
      reviewDate: "2026-06-01",
    });
    vi.mocked(fetchSettings).mockResolvedValue(settings);

    renderWithProvider(<Home />);
    const phaseOneButtons = await screen.findAllByRole("button", {
      name: /Phase 1/i,
    });
    const probationaryPhaseOne = phaseOneButtons.find(
      (btn) =>
        btn.getAttribute("aria-controls") ===
        "probationary-comparison-phase-one-panel"
    );
    expect(probationaryPhaseOne).toBeDefined();
    await user.click(probationaryPhaseOne!);

    expect(screen.getByText("Employee Name")).toBeInTheDocument();
    const viewPhaseLinks = screen.getAllByRole("link", {
      name: /View Phase Ads/i,
    });
    expect(viewPhaseLinks).toHaveLength(1);
  });

  it("shows skeleton while settings are loading", () => {
    vi.mocked(fetchSettings).mockReturnValue(new Promise(() => {}));

    renderWithProvider(<Home />);

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Ad Performance Dashboard/i })
    ).not.toBeInTheDocument();
  });
});
