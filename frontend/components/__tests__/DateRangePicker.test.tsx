import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "../DateRangePicker";

describe("DateRangePicker", () => {
  it("renders placeholder when no dates are set", () => {
    const onRangeChange = vi.fn();
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={onRangeChange}
      />
    );
    expect(screen.getByText(/Pick a date range/i)).toBeInTheDocument();
  });

  it("renders custom placeholder when provided", () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={() => {}}
        placeholder="Pick start and review dates"
      />
    );
    expect(
      screen.getByText(/Pick start and review dates/i)
    ).toBeInTheDocument();
  });

  it("renders formatted date range when both dates are set", () => {
    render(
      <DateRangePicker
        startDate="2025-01-15"
        endDate="2025-01-20"
        onRangeChange={() => {}}
      />
    );
    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 20, 2025/)).toBeInTheDocument();
  });

  it("renders disabled button when disabled prop is true", () => {
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={() => {}}
        disabled
      />
    );
    const button = screen.getByRole("button", { name: /Pick a date range/i });
    expect(button).toBeDisabled();
  });

  it("opens calendar popover when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onRangeChange={() => {}}
      />
    );
    const button = screen.getByRole("button", { name: /Pick a date range/i });
    await user.click(button);
    const popover = document.querySelector("[data-slot='popover-content']");
    expect(popover).toBeInTheDocument();
    const calendar = popover?.querySelector("[data-slot='calendar']");
    expect(calendar).toBeInTheDocument();
  });
});
