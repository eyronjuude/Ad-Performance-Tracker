import { describe, expect, it } from "vitest";
import { DATE_DISPLAY_FORMAT, formatDateForDisplay } from "../date-utils";

describe("date-utils", () => {
  describe("DATE_DISPLAY_FORMAT", () => {
    it("is MMMM d, yyyy", () => {
      expect(DATE_DISPLAY_FORMAT).toBe("MMMM d, yyyy");
    });
  });

  describe("formatDateForDisplay", () => {
    it("formats valid date string as February 27, 2026", () => {
      expect(formatDateForDisplay("2026-02-27")).toBe("February 27, 2026");
    });

    it("formats January 15, 2025", () => {
      expect(formatDateForDisplay("2025-01-15")).toBe("January 15, 2025");
    });

    it("returns — for null", () => {
      expect(formatDateForDisplay(null)).toBe("—");
    });

    it("returns — for undefined", () => {
      expect(formatDateForDisplay(undefined)).toBe("—");
    });

    it("returns — for empty string", () => {
      expect(formatDateForDisplay("")).toBe("—");
    });

    it("returns — for invalid date string", () => {
      expect(formatDateForDisplay("not-a-date")).toBe("—");
    });
  });
});
