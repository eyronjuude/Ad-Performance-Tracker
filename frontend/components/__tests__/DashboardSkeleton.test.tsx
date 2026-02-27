import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardSkeleton } from "../DashboardSkeleton";

describe("DashboardSkeleton", () => {
  it("renders skeleton layout", () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
  });

  it("renders table structure", () => {
    render(<DashboardSkeleton />);
    const tables = document.querySelectorAll("table");
    expect(tables.length).toBeGreaterThan(0);
  });
});
