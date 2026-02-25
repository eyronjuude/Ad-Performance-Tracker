import { describe, it, expect } from "vitest";
import { aggregatePerformance, type PerformanceRow } from "@/lib/api";

describe("aggregatePerformance", () => {
  it("returns zeros for empty rows", () => {
    const result = aggregatePerformance([]);
    expect(result).toEqual({
      totalSpend: 0,
      blendedCroas: 0,
      rowCount: 0,
    });
  });

  it("sums spend and computes spend-weighted CROAS", () => {
    const rows: PerformanceRow[] = [
      { ad_name: "A", adset_name: "X", spend: 100, croas: 2 },
      { ad_name: "B", adset_name: "Y", spend: 200, croas: 3 },
    ];
    const result = aggregatePerformance(rows);
    expect(result.totalSpend).toBe(300);
    // Blended = (100*2 + 200*3) / 300 = 800/300 ≈ 2.67
    expect(result.blendedCroas).toBeCloseTo(800 / 300);
    expect(result.rowCount).toBe(2);
  });

  it("handles null croas as zero", () => {
    const rows: PerformanceRow[] = [
      { ad_name: "A", adset_name: "X", spend: 100, croas: null },
    ];
    const result = aggregatePerformance(rows);
    expect(result.totalSpend).toBe(100);
    expect(result.blendedCroas).toBe(0);
    expect(result.rowCount).toBe(1);
  });
});
