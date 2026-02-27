import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders with default styles", () => {
    render(<Skeleton />);
    const el = document.querySelector(".animate-pulse");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("rounded-md", "bg-zinc-200");
  });

  it("accepts custom className", () => {
    render(<Skeleton className="h-8 w-32" />);
    const el = document.querySelector(".animate-pulse");
    expect(el?.className).toContain("h-8");
    expect(el?.className).toContain("w-32");
  });

  it("has aria-hidden for accessibility", () => {
    render(<Skeleton />);
    const el = document.querySelector("[aria-hidden]");
    expect(el).toBeInTheDocument();
  });
});
