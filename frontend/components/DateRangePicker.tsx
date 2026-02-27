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
  const isSelectingEnd = React.useRef(false);

  // Temp range: working state while popover is open; commits on Apply
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    () => dateRange
  );

  // Sync tempRange when popover opens or committed range changes
  React.useEffect(() => {
    if (open) {
      setTempRange(dateRange);
      isSelectingEnd.current = false;
    }
  }, [open, dateRange]);

  const handleDayClick = React.useCallback(
    (day: Date) => {
      if (!isSelectingEnd.current || !tempRange?.from) {
        setTempRange({ from: day, to: undefined });
        isSelectingEnd.current = true;
      } else {
        const from = tempRange.from;
        if (day < from) {
          setTempRange({ from: day, to: from });
        } else {
          setTempRange({ from, to: day });
        }
        isSelectingEnd.current = false;
      }
    },
    [tempRange]
  );

  const handleApply = React.useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      onRangeChange(toYYYYMMDD(tempRange.from), toYYYYMMDD(tempRange.to));
    } else {
      // Incomplete or cleared: commit empty range
      onRangeChange(null, null);
    }
    isSelectingEnd.current = false;
    setOpen(false);
  }, [tempRange, onRangeChange]);

  const handleCancel = React.useCallback(() => {
    setTempRange(dateRange);
    isSelectingEnd.current = false;
    setOpen(false);
  }, [dateRange]);

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
        <div className="bg-background flex flex-col rounded-md">
          <Calendar
            mode="range"
            defaultMonth={tempRange?.from ?? dateRange?.from}
            selected={tempRange}
            onSelect={() => {}}
            onDayClick={handleDayClick}
            numberOfMonths={2}
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear() - 2, 0, 1)}
            endMonth={new Date()}
            reverseYears
            disabled={{ after: new Date() }}
            showOutsideDays={false}
            className="bg-background!"
          />
          <div className="flex justify-end gap-2 border-t p-3">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempRange?.from || !tempRange?.to}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
