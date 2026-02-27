# Research: TwinklingTreehouse — Date Range Selector & Defining Features

**Source:** Local project at `e:\Work\TwinklingTree\Projects\TwinklingTreehouse`  
**Purpose:** Understand Date Range implementation and identify features to adopt in Ad Performance Tracker.

---

## How Date Selections Work (core mechanics)

### TwinklingTreehouse vs Ad Performance Tracker

| Aspect | TwinklingTreehouse | Ad Performance Tracker |
|--------|--------------------|------------------------|
| Selection handler | Custom `onDayClick` (not `onSelect`) | `onSelect` (DayPicker built-in) |
| State model | `tempRange` (working) + `range` (committed) | Single `dateRange` (commits immediately) |
| Confirmation | Apply + Cancel buttons | No Apply/Cancel — commits on second click |
| Clearing | Apply with incomplete range clears | `onSelect` clears when user deselects |
| Backwards selection | Yes — if second click < first, swaps to `{ from: day, to: from }` | Handled by DayPicker's native behavior |

### TwinklingTreehouse selection logic

- **First click** → Sets `tempRange = { from: day, to: undefined }`; `isSelectingEnd = true`.
- **Second click** → Sets `to`; if clicked date is before `from`, swaps so `from` is earlier.
- **Apply** → Copies `tempRange` → `range`, closes popover.
- **Cancel** → Restores `tempRange = range`, closes popover.

```tsx
<Calendar
  mode="range"
  selected={tempRange}
  onSelect={() => {}}
  onDayClick={(day) => {
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
  }}
/>
```

### Ad Performance Tracker (updated)

As of implementation: matches TwinklingTreehouse flow — `tempRange` + Apply/Cancel, custom `onDayClick` with backwards-selection swap, `disabled={{ after: new Date() }}`, `showOutsideDays={false}`.

---

## 1. Date Range Selector Implementation (full)

### Component: `DateFilters` (`src/modules/filters/date-filters.tsx`)

TwinklingTreehouse uses a custom **DateFilters** component built on:

| Dependency | Purpose |
|------------|---------|
| `react-day-picker` v9 | Calendar with `mode="range"` for start/end selection |
| `date-fns` + `date-fns-tz` | Timezone-aware date math (Sydney) |
| shadcn/ui | `Calendar`, `Button`, `Popover` |
| `lucide-react` | `CalendarIcon` for trigger button |

### Architecture Overview

```
DateFilters (client component)
├── Popover (trigger = Button with calendar icon + label)
└── PopoverContent
    ├── Presets sidebar (left, 140px) — quick-select buttons
    └── Calendar + Apply/Cancel (right)
```

### Defining Features of the Date Range Selector

#### 1. **Preset quick-select sidebar**

A vertical sidebar with one-click preset buttons:

| Preset | Behavior |
|--------|----------|
| Today | Single day (today in Sydney) |
| Yesterday | Single day (yesterday) |
| Last 7 days | 7 complete days before today |
| Last 30 days | 30 complete days before today |
| Last 365 days | 365 complete days before today |
| This year | Jan 1 → today |
| Last year | Full previous calendar year |
| Maximum | Earliest order date → today (data-driven) |

- Presets use Sydney timezone consistently.
- **Maximum** can be async (fetches earliest order) or sync (uses `earliestOrderDate` prop from server).

#### 2. **URL-synced state**

- Dates stored in `startDate` and `endDate` query params (e.g. `?startDate=01/15/2026&endDate=01/21/2026`).
- Uses `useSearchParams` and `useRouter` for Next.js App Router.
- Supports “implicit default” (no URL params when using default preset without user interaction).
- Detects preset from URL range and shows matching label.

#### 3. **Two-month calendar**

- `numberOfMonths={2}` for side-by-side month view.
- Custom `onDayClick` for range selection (first click = start, second = end; backwards selection supported).
- `disabled={{ after: new Date() }}` to block future dates.

#### 4. **Minimum days validation**

- Optional `minDays` prop to enforce a minimum range (e.g. 7 days).
- Inline error message when range is too short.
- Apply button disabled until valid.

#### 5. **Apply/Cancel flow**

- Popover has “working” state (`tempRange`) vs committed state (`range`).
- Cancel restores previous range and closes.
- Apply detects matching preset or custom label.

#### 6. **Sydney timezone**

- Uses `date-fns-tz` with `Australia/Sydney`.
- `getTodayInSydney()`, `shiftSydneyDateString()`, `sydneyDateStringToPickerDate()` for conversions.
- API dates formatted as `MM/dd/yyyy`.

### Helper Modules

| File | Purpose |
|------|---------|
| `daterange-presets.ts` | `getToday`, `getYesterday`, `getLast7DaysBeforeToday`, `getThisYear`, `getMaximum`, `getMaximumSync`, etc. |
| `date-utils.ts` | `getTodayInSydney`, `getSydneyDateRange`, `formatSydneyDateForApi`, `parseApiDateToSydneyString`, `isTodayInSydney` |

---

## 2. TwinklingTreehouse — Defining Features

### Core Product

**Order processing & automation** — Next.js app for managing and automating order processing (CheckoutChamp integration).

### Feature Summary

| Area | Features |
|------|----------|
| **Orders** | Orders table with filters, search, sorting; CSV export; date range filtering |
| **Reports** | Daily sales by SKU/product; product analysis; sales-by-SKU; date-column matrix view |
| **Dashboard** | Revenue display; sales trends; currency cards |
| **Revenue** | Revenue conversion tracking |
| **Call analytics** | Call analytics dashboard |
| **Auth** | Clerk or NextAuth; protected routes |
| **Date handling** | Sydney timezone; preset-based DateFilters |
| **Infra** | Docker Compose (Postgres, order sync cron, pgAdmin); automatic catch-up sync for missed days |

### Tech Stack

- Next.js 15, React 19, Tailwind 4
- `react-day-picker` v9, `date-fns`, `date-fns-tz`
- shadcn/ui (Calendar, Popover, Button, etc.)
- TanStack Table, Recharts, Motion
- Neon/Postgres, Clerk/NextAuth

---

## 3. Recommendations for Ad Performance Tracker

### High-value additions

#### A. **Date range presets** (most impactful)

**Current:** Ad Performance Tracker uses a basic DateRangePicker (start/end only) for probationary employees.

**Recommendation:** Add a preset sidebar similar to TwinklingTreehouse:

- Today
- Yesterday
- Last 7 days
- Last 30 days
- Last 365 days
- This year
- Last year
- Custom (existing calendar flow)

**Location:** Settings page probation date picker and/or Ads page when date-range mode is used.

**Scope:** New `DateFilters` or `DateRangePickerWithPresets` component that wraps or extends your existing DateRangePicker.

#### B. **URL-synced date filters**

**Current:** Ads page reads `start_date` and `end_date` from URL but user cannot easily share/bookmark filtered views.

**Recommendation:** If you add global date filters (e.g. on dashboard), sync them to URL params like TwinklingTreehouse. Your Ads page already supports URL params; extend this pattern where helpful.

#### C. **Sydney timezone consistency**

**Current:** Ad Performance Tracker uses `date-fns` for formatting. Timezone behavior is not explicit.

**Recommendation:** If your data is Sydney-based, introduce `date-fns-tz` and centralize Sydney helpers (e.g. `getTodayInSydney`, `formatSydneyDateForApi`) similar to TwinklingTreehouse.

#### D. **Two-month calendar**

**Current:** DateRangePicker already uses `numberOfMonths={2}`.

**Status:** Already aligned; no change needed.

### Medium-value additions

#### E. **Minimum days validation**

Useful if you add reporting or analytics that require a minimum range (e.g. “Last 7 days”).

#### F. **Apply/Cancel flow**

TwinklingTreehouse uses temporary range in popover + Apply/Cancel. Your DateRangePicker commits on select. For complex filters, an Apply/Cancel flow can reduce accidental changes.

### Lower priority (context-dependent)

- **Maximum preset (data-driven):** Needs “earliest ad date” API or similar.
- **Docker/catch-up infra:** Only relevant if you move to similar order sync architecture.

---

## 4. Implementation Roadmap for Ad Performance Tracker

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Add `daterange-presets.ts` (Today, Yesterday, Last 7/30/365 days, This year, Last year) | Small |
| 2 | Add optional preset sidebar to DateRangePicker (or new DateFilters component) | Medium |
| 3 | Wire presets to Settings probation picker and/or Ads page | Small |
| 4 | Add `date-fns-tz` and Sydney timezone helpers if not present | Small |
| 5 | Optional: URL-sync for date filters on dashboard/ads | Medium |

---

## 5. Files to Reference

| TwinklingTreehouse Path | Purpose |
|-------------------------|---------|
| `src/modules/filters/date-filters.tsx` | Main DateFilters component |
| `src/lib/helpers/daterange-presets.ts` | Preset range getters |
| `src/lib/helpers/date-utils.ts` | Sydney timezone utilities |
| `src/components/ui/calendar.tsx` | shadcn Calendar wrapper |

---

*Research completed: Feb 27, 2026*
