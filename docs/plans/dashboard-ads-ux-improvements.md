# Plan: Dashboard & Ads UX Improvements

**Source:** User transcript (voice notes / feedback)  
**Date:** Feb 27, 2026

---

## Summary

Implement UX and filtering improvements for the Ad Performance Tracker: pointer cursor on expandable sections, update section text, fix acronym/phase filtering (ad name only, underscore format), remove ad set from View Ads, add date-change save flow with navigation warning, reformat dates, add Bonus Eligibility column, and fix capitalization.

---

## Parsed Tasks from Transcript

### 1. Hover Cursor on Name/Arrow

**Scope:** Frontend

When hovering over the employee name or the expand/collapse arrow, show **pointer cursor** (hand) instead of default. Signals that the whole control is clickable.

| Location | Change |
|----------|--------|
| `EmployeeTable.tsx` | Add `cursor-pointer` to the button wrapping the arrow + name; ensure both have pointer on hover |

---

### 2. Section Text Updates

**Scope:** Frontend

| Location | Current | New |
|----------|---------|-----|
| Dashboard – Tenured Employees | "P1 ads filtered by employee acronym." | "Ads grouped by column. • Tenured employees • Phase" |
| Dashboard – Probationary Employees | "Filtered by employee acronym and probation date range." | "Ads grouped by column. • Probationary employees" |
| `frontend/app/page.tsx` | Lines 216–217, 233–234 | Replace `p` text under section headings |

---

### 3. View Ads: Filter by Ad Name Only (Backend + Frontend)

**Scope:** Backend, Frontend

**Current behavior:** Backend filters by `adset_name`; frontend search includes both `ad_name` and `adset_name`.

**Required behavior:**

- **Backend:** Filter by `ad_name` only (not `adset_name`). Apply acronym and phase patterns to `ad_name`.
- **Frontend:** Remove Adset Name column from Ads table; search/filter only by `ad_name`.

| Location | Change |
|----------|--------|
| `backend/routers/bigquery.py` | Change `REGEXP_CONTAINS(LOWER({adset}), …)` to use `ad_name`; update `GROUP BY` to dedupe by `ad_name` only (merge ad set variants) |
| `frontend/components/AdsTable.tsx` | Remove Adset Name column; remove `adset_name` from search filter; remove `adset_name` from sort; update `key` if needed |
| `frontend/components/AdsTableSkeleton.tsx` | Remove "Adset Name" from skeleton |
| `frontend/lib/api.ts` | Update `PerformanceRow` if it includes `adset_name` (can keep for API compatibility but no longer display) |

---

### 4. Acronym & Phase Filter Format (Underscores)

**Scope:** Backend

**Current:** Acronym regex uses word boundaries: `(^|[^a-zA-Z])hm([^a-zA-Z]|$)`.

**Required:** Acronyms and phases are surrounded by **two underscores**, e.g. `__HM__`, `__P1__`. Filter by the full string including underscores.

| Location | Change |
|----------|--------|
| `backend/routers/bigquery.py` | Update `_acronym_word_regex` → build pattern `__{acronym}__` (case-insensitive, escaped); same for phase (P1 → `__P1__`). Use exact substring/LIKE or regex equivalent. |

**Implementation note:**  
- Acronym: `__{acronym}__` → e.g. `__hm__` for "HM".  
- Phase (P1): `__p1__` in `ad_name`.  
- These patterns are strict: only match `__X__`, not generic word boundaries.

---

### 5. Date Change Save Flow & Navigation Warning

**Scope:** Frontend (Settings)

**Current:** Settings auto-save on every change.

**Required:**

1. When any setting changes (incl. dates), show a visible **Save** button.
2. If user tries to navigate away with unsaved changes, show:  
   "Are you sure you want to leave? You will lose unsaved changes."
3. **Yes** → Leave and discard changes.  
4. **No** → Stay on the page.
5. Changes persist only when the user clicks **Save**.

| Location | Change |
|----------|--------|
| `frontend/components/SettingsProvider.tsx` | Add dirty-state: `settings` vs `committedSettings`; expose `isDirty`, `save`, `revert` |
| `frontend/app/settings/page.tsx` | Show Save button when dirty; wire `beforeunload` and Next.js router navigation blocking |
| Consider | `useBlocker` (React Router) or `router.events` / `beforePopState` for Next.js App Router |

---

### 6. Date Format

**Scope:** Frontend

**Current:** e.g. `27 Feb 2026` (dd MMM yyyy).

**Required:** e.g. **February 27, 2026** (MMMM d, yyyy).

| Location | Change |
|----------|--------|
| `frontend/components/DatePicker.tsx` | Change `DISPLAY_FORMAT` from `"dd MMM yyyy"` to `"MMMM d, yyyy"` |
| Ads page subtitle | If dates are shown in a different format, update to `"February 27, 2026"` style |
| Any other date display | Use same format for consistency |

---

### 7. Bonus Eligibility Column

**Scope:** Frontend, Settings (optional)

Add a "Bonus eligibility" column to the ads table:

- **&lt; $50,000 spend** → white emoji
- **≥ $50,000 spend** → red emoji
- Configurable colors: white, red, purple (stored in settings)

| Location | Change |
|----------|--------|
| `frontend/components/AdsTable.tsx` | Add "Bonus eligibility" column; show emoji based on row `spend` and settings |
| Settings / config | Add bonus eligibility thresholds and color mapping (white/red/purple) if configurable |
| `frontend/lib/config.ts` or settings API | Define threshold (default 50,000) and color options |

---

### 8. Capitalization Fixes

**Scope:** Frontend

Apply consistent casing:

- **total spend** (lowercase)
- **Blended cROAS** → **blended cROAS** (cROAS stays as acronym)
- **cROAS** remains uppercase (acronym)
- **ROAS** remains uppercase
- **Spend Evaluation** → **spend evaluation**
- **cROAS Evaluation** → **cROAS evaluation**
- Remove redundant "initials" or acronym label where indicated

| Location | Change |
|----------|--------|
| `frontend/app/ads/page.tsx` | "Total Spend" → "total spend"; "Blended cROAS" → "blended cROAS" |
| `frontend/components/EmployeeTable.tsx` | "Spend (AUD)" → "spend (AUD)"; "Spend Evaluation" → "spend evaluation"; "cROAS Evaluation" → "cROAS evaluation" |
| `frontend/components/ProbationaryEmployeeTable.tsx` | Same header capitalization |
| `frontend/components/AdsTable.tsx` | "Spend (AUD)" → "spend (AUD)" |
| `frontend/app/settings/page.tsx` | "Spend evaluation thresholds" → "spend evaluation thresholds"; "cROAS evaluation thresholds" → "cROAS evaluation thresholds" |

---

### 9. Remove Acronym Badge

**Scope:** Frontend

**Current:** Ads page shows employee name and acronym badge.

**Required:** Remove the acronym badge (initials) from the ads page header. Keep only the employee name.

| Location | Change |
|----------|--------|
| `frontend/app/ads/page.tsx` | Remove the `span` showing `{acronym}` badge next to the name |

---

## Dependencies & Execution Order

| Order | Task | Depends On |
|-------|------|------------|
| 1 | Backend: Filter by ad_name only | — |
| 2 | Backend: Underscore format for acronym/phase | — |
| 3 | Frontend: Remove ad set column and adset from search | 1 |
| 4 | Pointer cursor | — |
| 5 | Section text updates | — |
| 6 | Capitalization fixes | — |
| 7 | Remove acronym badge | — |
| 8 | Date format | — |
| 9 | Settings save flow + navigation warning | — |
| 10 | Bonus Eligibility column | — |

---

## Unknowns / Research

- [ ] Exact phase pattern in BigQuery: is it always `__P1__`, `__P2__`, etc.? Confirm with sample data.
- [ ] Bonus eligibility: is threshold always $50,000 AUD? Are there other phases/thresholds?
- [ ] Next.js App Router: best pattern for blocking navigation on dirty form (e.g. `useBlocker` vs custom approach).

---

## Checklist for Implement Command

- [ ] Tasks are discrete and actionable
- [ ] Backend vs frontend clearly separated
- [ ] Dependencies and order noted
- [ ] Unknowns flagged for research
- [ ] Plan can be handed to implement command
