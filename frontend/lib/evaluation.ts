import type { CroasThreshold, EvaluationColor, SpendThreshold } from "./config";

/** Map CROAS value to color from evaluation key. */
export function getCroasEvaluationColor(
  croas: number,
  key: CroasThreshold[]
): EvaluationColor {
  for (const band of key) {
    const inRange =
      croas >= band.min && (band.max === null || croas < band.max);
    if (inRange) return band.color;
  }
  return "gray";
}

/** Map spend value to color from evaluation key. */
export function getSpendEvaluationColor(
  spend: number,
  key: SpendThreshold[]
): EvaluationColor {
  for (const band of key) {
    const inRange =
      spend >= band.min && (band.max === null || spend < band.max);
    if (inRange) return band.color;
  }
  return "gray";
}
