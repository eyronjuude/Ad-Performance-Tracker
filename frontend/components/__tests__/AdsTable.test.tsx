import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdsTable } from "../AdsTable";
import type { PerformanceRow } from "@/lib/api";

const createRow = (
  overrides: Partial<PerformanceRow> = {}
): PerformanceRow => ({
  ad_name: "Test Ad",
  spend: 0,
  croas: 1.5,
  ...overrides,
});

describe("AdsTable", () => {
  it("renders Bonus eligibility header after cROAS", () => {
    render(<AdsTable rows={[]} />);
    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent?.trim() ?? "");
    const croasIdx = headerTexts.indexOf("cROAS");
    const bonusIdx = headerTexts.indexOf("Bonus eligibility");
    expect(croasIdx).toBeGreaterThanOrEqual(0);
    expect(bonusIdx).toBe(croasIdx + 1);
  });

  it("shows eligible indicator for row with spend >= 50,000", () => {
    const rows: PerformanceRow[] = [
      createRow({ ad_name: "High Spend Ad", spend: 60_000 }),
    ];
    render(<AdsTable rows={rows} />);
    const eligible = screen.getAllByRole("img", { name: "Eligible" });
    expect(eligible.length).toBe(1);
  });

  it("shows not eligible indicator for row with spend < 50,000", () => {
    const rows: PerformanceRow[] = [
      createRow({ ad_name: "Low Spend Ad", spend: 30_000 }),
    ];
    render(<AdsTable rows={rows} />);
    const notEligible = screen.getAllByRole("img", { name: "Not eligible" });
    expect(notEligible.length).toBe(1);
  });

  it("shows eligible indicator for row with spend exactly 50,000", () => {
    const rows: PerformanceRow[] = [
      createRow({ ad_name: "Boundary Ad", spend: 50_000 }),
    ];
    render(<AdsTable rows={rows} />);
    const eligible = screen.getAllByRole("img", { name: "Eligible" });
    expect(eligible.length).toBe(1);
  });

  it("uses custom threshold when bonusEligibilityThreshold prop is passed", () => {
    const rows: PerformanceRow[] = [
      createRow({ ad_name: "Mid", spend: 60_000 }),
    ];
    render(<AdsTable rows={rows} bonusEligibilityThreshold={75_000} />);
    const notEligible = screen.getAllByRole("img", {
      name: "Not eligible",
    });
    expect(notEligible.length).toBe(1);
  });

  it("shows correct indicators for mixed rows", () => {
    const rows: PerformanceRow[] = [
      createRow({ ad_name: "Low", spend: 10_000 }),
      createRow({ ad_name: "High", spend: 80_000 }),
      createRow({ ad_name: "Mid", spend: 40_000 }),
    ];
    render(<AdsTable rows={rows} />);
    const eligible = screen.getAllByRole("img", { name: "Eligible" });
    const notEligible = screen.getAllByRole("img", { name: "Not eligible" });
    expect(eligible.length).toBe(1);
    expect(notEligible.length).toBe(2);
  });
});
