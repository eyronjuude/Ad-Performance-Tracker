import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsSkeleton } from "../SettingsSkeleton";

describe("SettingsSkeleton", () => {
  it("renders skeleton layout", () => {
    render(<SettingsSkeleton />);
    expect(screen.getByTestId("settings-skeleton")).toBeInTheDocument();
  });

  it("renders three section cards", () => {
    render(<SettingsSkeleton />);
    const sections = document.querySelectorAll("section");
    expect(sections).toHaveLength(3);
  });
});
