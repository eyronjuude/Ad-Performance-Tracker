# Plan: Bonus Eligibility Column

**Source:** User request + `dashboard-ads-ux-improvements.md` (Task 7)  
**Date:** Mar 3, 2026

---

## Summary

Add a "Bonus eligibility" column to the View Phase Ads page (`/ads`), placed **immediately after the cROAS column**. Eligibility is determined by per-row spend: below threshold (e.g. < $50,000) → white indicator; at or above threshold → red indicator. Threshold and colors are configurable via config (optional: Settings API later).

---

## Tasks

### Frontend

- [x] **Define bonus eligibility config** — In `frontend/lib/config.ts`, add:
  - `BONUS_ELIGIBILITY_THRESHOLD` (default `50_000` AUD)
  - `BonusEligibilityColor` type (`"white" | "red" | "purple"`) and mapping to emoji (e.g. ⚪ / 🔴 / 🟣) or styled span for accessibility
- [x] **Add Bonus eligibility column to AdsTable** — In `frontend/components/AdsTable.tsx`:
  - Insert column header "Bonus eligibility" after cROAS (after the cROAS `<th>`, before `</tr>`)
  - For each row, compute: `row.spend >= threshold ? "eligible" : "not eligible"`
  - Display emoji or styled indicator per row spend
  - Column is non-sortable by default; keep existing sort fields (`ad_name`, `spend`, `croas`)
- [x] **Update AdsTableSkeleton** — In `frontend/components/AdsTableSkeleton.tsx`:
  - Add skeleton cell for "Bonus eligibility" in header and each row
  - Update `["Ad Name", "Spend", "cROAS"]` → include "Bonus eligibility" or add as 5th column
- [x] **Pass config to AdsTable** — AdsTable needs threshold (and optional color key). Options:
  - A) Read from `useSettings()` if we add `bonusEligibilityThreshold` to Settings
  - B) Import from `@/lib/config` for now (config-only MVP)
- [x] **Add frontend tests** — In `frontend/components/__tests__/AdsTable.test.tsx` (or equivalent):
  - Renders "Bonus eligibility" header after cROAS
  - Shows correct indicator for row with spend < 50,000 vs ≥ 50,000
  - Handles edge case: spend exactly 50,000

### Backend

- [ ] **None** — Bonus eligibility is derived from `spend` (already in `PerformanceRow`). No API changes.

### Settings (Optional – Phase 2)

- [ ] **Extend Settings schema** — Add `bonusEligibilityThreshold?: number` and optionally `bonusEligibilityKey?: { below: string; atOrAbove: string }` to `frontend/lib/settings.ts`
- [ ] **Backend settings router** — Add fields to `backend/routers/settings.py` default and PATCH handling
- [ ] **Settings page** — Add "Bonus eligibility threshold" input in `frontend/app/settings/page.tsx`
- [ ] **Wire AdsTable** — Use `settings.bonusEligibilityThreshold` when available; fallback to config default

### Docs / Config

- [x] **Update README** — In `frontend/README.md`, mention Bonus eligibility column in ads table description (if docs mention table columns)
- [ ] **No `.env` or OpenAPI** — No env vars; no API changes

---

## Dependencies

| Task | Depends On |
|------|------------|
| Define config | — |
| Add column to AdsTable | Define config |
| Update AdsTableSkeleton | Add column (layout match) |
| Add tests | Add column |
| Settings (Phase 2) | Add column (optional) |

---

## Placement (User Clarification)

- **Page:** View Phase Ads (`/ads?employee_acronym=X` or `/ads?employee_acronym=X&start_date=…&end_date=…`)
- **Table:** `AdsTable` used by `frontend/app/ads/page.tsx`
- **Column order:** `#` | `Ad Name` | `Spend (AUD)` | `cROAS` | **`Bonus eligibility`**

---

## Implementation Notes

1. **Emoji vs accessible UI** — Emojis (⚪🔴🟣) are simple; consider `aria-label` and `title` for screen readers. Alternatively use colored circles (styled `span` with `bg-*` classes) for better a11y.
2. **Threshold default** — $50,000 AUD as in the UX plan.
3. **Exact threshold** — Plan says "< $50,000" vs "≥ $50,000". At exactly $50,000 → eligible (red).

---

## Unknowns (consider researcher-agent)

- [ ] **Accessibility** — Prefer emoji (simple) or styled indicators (better a11y)? Recommend styled `span` with `title` for tooltip.

---

## Checklist for Implement Command

- [ ] Tasks are discrete and actionable
- [ ] Backend vs frontend clearly separated
- [ ] Dependencies and order noted
- [ ] Plan can be handed to implement command
