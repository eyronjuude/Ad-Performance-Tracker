import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import AdsPage from "../page";
import { fetchSettings } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";
import type { Settings } from "@/lib/settings";
import {
  PROBATIONARY_SECTION_DESCRIPTION,
  TENURED_SECTION_DESCRIPTION,
} from "@/lib/config";
import * as api from "@/lib/api";

vi.mock("@/lib/settings-api", () => ({
  fetchSettings: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    fetchPerformance: vi.fn(),
    fetchPerformanceByDate: vi.fn(),
  };
});

const { mockSearchParamsGet } = vi.hoisted(() => ({
  mockSearchParamsGet: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

beforeEach(() => {
  vi.mocked(fetchSettings).mockResolvedValue(getDefaultSettings());
  vi.mocked(api.fetchPerformance).mockResolvedValue([]);
  mockSearchParamsGet.mockImplementation((key: string) =>
    key === "employee_acronym" ? "HM" : null
  );
});

describe("Ads page", () => {
  it("renders employee name in header without acronym badge", async () => {
    renderWithProvider(<AdsPage />);

    expect(
      await screen.findByRole("heading", { name: /Employee HM/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/^HM$/)).not.toBeInTheDocument();
  });

  it("shows tenured section description for tenured employee", async () => {
    renderWithProvider(<AdsPage />);

    expect(
      await screen.findByText(TENURED_SECTION_DESCRIPTION)
    ).toBeInTheDocument();
  });

  it("shows probationary section description for probationary employee", async () => {
    const settingsWithProbationary: Settings = {
      ...getDefaultSettings(),
      employees: [
        {
          acronym: "NE",
          name: "New Employee",
          status: "probationary",
          startDate: "2026-01-15",
          reviewDate: "2026-07-15",
        },
      ],
    };
    vi.mocked(fetchSettings).mockResolvedValue(settingsWithProbationary);
    vi.mocked(api.fetchPerformanceByDate).mockResolvedValue([]);
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "employee_acronym") return "NE";
      if (key === "start_date") return "2026-01-15";
      if (key === "end_date") return "2026-07-15";
      return null;
    });

    renderWithProvider(<AdsPage />);

    expect(
      await screen.findByText(PROBATIONARY_SECTION_DESCRIPTION)
    ).toBeInTheDocument();
  });
});
