import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../DatePicker";

describe("DatePicker", () => {
  it("renders placeholder when no date is set", () => {
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    expect(screen.getByText(/Select date/i)).toBeInTheDocument();
  });

  it("renders custom placeholder when provided", () => {
    render(
      <DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />
    );
    expect(screen.getByText(/Pick a date/i)).toBeInTheDocument();
  });

  it("renders formatted date when value is set", () => {
    render(<DatePicker value="2025-01-15" onChange={() => {}} />);
    expect(screen.getByText(/15 Jan 2025/)).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<DatePicker value={null} onChange={() => {}} label="Start date" />);
    expect(screen.getByText(/Start date/i)).toBeInTheDocument();
  });

  it("renders disabled button when disabled prop is true", () => {
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    const button = screen.getByRole("button", { name: /Pick a date/i });
    expect(button).toBeDisabled();
  });

  it("opens calendar popover when button is clicked", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={null} onChange={() => {}} />);
    const button = screen.getByRole("button", { name: /Pick a date/i });
    await user.click(button);
    const popover = document.querySelector("[data-slot='popover-content']");
    expect(popover).toBeInTheDocument();
    const calendar = popover?.querySelector("[data-slot='calendar']");
    expect(calendar).toBeInTheDocument();
  });

  it("shows Apply and Cancel buttons in popover", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={null} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Pick a date/i }));
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply/i })).toBeInTheDocument();
  });

  it("commits date on Apply and closes popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /Pick a date/i }));
    const dayButton = screen.getByRole("button", { name: /15th/i });
    await user.click(dayButton);
    await user.click(screen.getByRole("button", { name: /Apply/i }));
    expect(onChange).toHaveBeenCalled();
    const popover = document.querySelector("[data-slot='popover-content']");
    expect(popover).not.toBeInTheDocument();
  });
});
