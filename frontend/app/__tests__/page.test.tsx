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

  it("renders View Ads links only when section is expanded", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Home />);

    const hmButton = await screen.findByRole("button", {
      name: "Employee HM",
    });
    expect(screen.queryAllByRole("link", { name: /View Ads/i })).toHaveLength(
      0
    );
    await user.click(hmButton);

    const links = screen.getAllByRole("link", { name: /View Ads/i });
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

  it("shows skeleton while settings are loading", () => {
    vi.mocked(fetchSettings).mockReturnValue(new Promise(() => {}));

    renderWithProvider(<Home />);

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Ad Performance Dashboard/i })
    ).not.toBeInTheDocument();
  });
});
