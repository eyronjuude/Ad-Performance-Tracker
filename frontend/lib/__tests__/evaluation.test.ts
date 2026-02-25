import { describe, it, expect } from "vitest";
import {
  getSpendEvaluationColor,
  getCroasEvaluationColor,
} from "@/lib/evaluation";
import { SPEND_EVALUATION_KEY, CROAS_EVALUATION_KEY } from "@/lib/config";

describe("evaluation", () => {
  describe("getSpendEvaluationColor", () => {
    it("returns green for spend > 20000", () => {
      expect(getSpendEvaluationColor(25_000, SPEND_EVALUATION_KEY)).toBe(
        "green"
      );
      expect(getSpendEvaluationColor(20_001, SPEND_EVALUATION_KEY)).toBe(
        "green"
      );
    });

    it("returns yellow for spend between 10000 and 20000", () => {
      expect(getSpendEvaluationColor(15_000, SPEND_EVALUATION_KEY)).toBe(
        "yellow"
      );
      expect(getSpendEvaluationColor(10_000, SPEND_EVALUATION_KEY)).toBe(
        "yellow"
      );
      expect(getSpendEvaluationColor(19_999, SPEND_EVALUATION_KEY)).toBe(
        "yellow"
      );
    });

    it("returns red for spend < 10000", () => {
      expect(getSpendEvaluationColor(5_000, SPEND_EVALUATION_KEY)).toBe("red");
      expect(getSpendEvaluationColor(0, SPEND_EVALUATION_KEY)).toBe("red");
    });
  });

  describe("getCroasEvaluationColor", () => {
    it("returns green for croas >= 3", () => {
      expect(getCroasEvaluationColor(3.5, CROAS_EVALUATION_KEY)).toBe("green");
      expect(getCroasEvaluationColor(3, CROAS_EVALUATION_KEY)).toBe("green");
    });

    it("returns yellow for croas between 1 and 3", () => {
      expect(getCroasEvaluationColor(2, CROAS_EVALUATION_KEY)).toBe("yellow");
      expect(getCroasEvaluationColor(1, CROAS_EVALUATION_KEY)).toBe("yellow");
      expect(getCroasEvaluationColor(2.99, CROAS_EVALUATION_KEY)).toBe(
        "yellow"
      );
    });

    it("returns red for croas < 1", () => {
      expect(getCroasEvaluationColor(0.5, CROAS_EVALUATION_KEY)).toBe("red");
      expect(getCroasEvaluationColor(0, CROAS_EVALUATION_KEY)).toBe("red");
    });
  });
});
