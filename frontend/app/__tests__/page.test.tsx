import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("renders documentation link", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /documentation/i })
    ).toBeInTheDocument();
  });
});
