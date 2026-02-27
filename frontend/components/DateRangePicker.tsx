"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps {
  /** Start date (YYYY-MM-DD) */
  startDate: string | null;
  /** End date (YYYY-MM-DD) */
  endDate: string | null;
  /** Called when the range changes. Pass null for cleared dates. */
  onRangeChange: (startDate: string | null, endDate: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

function toDateRange(
  startDate: string | null,
  endDate: string | null
): DateRange | undefined {
  if (!startDate) return undefined;
  const from = new Date(startDate);
  if (isNaN(from.getTime())) return undefined;
  if (!endDate) return { from };
  const to = new Date(endDate);
  if (isNaN(to.getTime())) return { from };
  return { from, to };
}

function toYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  disabled = false,
  placeholder = "Pick a date range",
  id,
  "aria-label": ariaLabel,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dateRange = toDateRange(startDate, endDate);

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        onRangeChange(null, null);
        return;
      }
      const fromStr = toYYYYMMDD(range.from);
      if (!range.to) {
        onRangeChange(fromStr, null);
        return;
      }
      const toStr = toYYYYMMDD(range.to);
      onRangeChange(fromStr, toStr);
    },
    [onRangeChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "justify-start px-2.5 text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} –{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
