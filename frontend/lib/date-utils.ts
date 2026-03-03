import { format } from "date-fns";

/** Display format for dates in the UI: "February 27, 2026" */
export const DATE_DISPLAY_FORMAT = "MMMM d, yyyy";

/**
 * Format a date string (YYYY-MM-DD) for display in the UI.
 * Returns the formatted string or "—" if the date is invalid or null.
 */
export function formatDateForDisplay(
  dateString: string | null | undefined
): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return format(date, DATE_DISPLAY_FORMAT);
}
