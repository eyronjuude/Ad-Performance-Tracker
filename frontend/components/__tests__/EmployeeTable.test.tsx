import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmployeeTable } from "../EmployeeTable";
import type { Employee } from "@/lib/config";

const employee: Employee = {
  name: "Jane Doe",
  acronym: "JD",
  status: "tenured",
  startDate: null,
  reviewDate: null,
};

const defaultProps = {
  employees: [employee],
  periods: ["2026-01"],
  spendEvaluationKey: [],
  croasEvaluationKey: [],
  state: {
    JD: { aggregates: null, error: null, isLoading: true },
  },
};

describe("EmployeeTable", () => {
  it("renders employee toggle button with cursor-pointer", () => {
    render(<EmployeeTable {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Jane Doe/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("cursor-pointer");
  });
});
