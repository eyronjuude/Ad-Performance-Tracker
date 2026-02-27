import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdsTableSkeleton } from "../AdsTableSkeleton";

describe("AdsTableSkeleton", () => {
  it("renders skeleton layout", () => {
    render(<AdsTableSkeleton />);
    expect(screen.getByTestId("ads-table-skeleton")).toBeInTheDocument();
  });

  it("renders table with 5 columns and skeleton rows", () => {
    render(<AdsTableSkeleton />);
    const tables = document.querySelectorAll("table");
    expect(tables).toHaveLength(1);
    const headers = tables[0]!.querySelectorAll("thead th");
    expect(headers).toHaveLength(5);
    const rows = tables[0]!.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
  });
});
