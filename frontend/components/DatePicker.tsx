"use client";

import * as React from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DISPLAY_FORMAT = "dd MMM yyyy";
const PLACEHOLDER = "Select date";

export interface DatePickerProps {
  /** Date value (YYYY-MM-DD) */
  value: string | null;
  /** Called when the date changes. Pass null for cleared dates. */
  onChange: (value: string | null) => void;
  /** Label shown beside the input (e.g. "Start date", "Review date") */
  label?: string;
  /** Disable dates before this (YYYY-MM-DD). Use when the other bound is set. */
  minDate?: string | null;
  /** Disable dates after this (YYYY-MM-DD). Use when the other bound is set. */
  maxDate?: string | null;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function toYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled = false,
  placeholder = PLACEHOLDER,
  id,
  "aria-label": ariaLabel,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = toDate(value);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(() => date);

  React.useEffect(() => {
    if (open) setTempDate(date);
  }, [open, date]);

  const handleSelect = React.useCallback((d: Date | undefined) => {
    setTempDate(d);
  }, []);

  const handleApply = React.useCallback(() => {
    if (tempDate) {
      onChange(toYYYYMMDD(tempDate));
    } else {
      onChange(null);
    }
    setOpen(false);
  }, [tempDate, onChange]);

  const handleCancel = React.useCallback(() => {
    setTempDate(date);
    setOpen(false);
  }, [date]);

  const today = React.useMemo(() => new Date(), []);
  const disabledMatcher = React.useMemo(() => {
    const before = minDate ? toDate(minDate) : undefined;
    const maxDateObj = maxDate ? toDate(maxDate) : undefined;
    const after = maxDateObj && maxDateObj < today ? maxDateObj : today;
    return { before, after };
  }, [minDate, maxDate, today]);

  const triggerContent = date ? (
    format(date, DISPLAY_FORMAT)
  ) : (
    <span className="text-muted-foreground">{placeholder}</span>
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400"
        >
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel ?? label ?? "Pick a date"}
            className={cn(
              "h-9 min-w-[140px] justify-start px-3 py-2 text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {triggerContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col rounded-md">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={handleSelect}
              defaultMonth={tempDate ?? date}
              captionLayout="dropdown"
              startMonth={new Date(new Date().getFullYear() - 2, 0, 1)}
              endMonth={new Date()}
              reverseYears
              disabled={disabledMatcher}
              showOutsideDays={false}
              className="bg-background!"
            />
            <div className="flex justify-end gap-2 border-t p-3">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
