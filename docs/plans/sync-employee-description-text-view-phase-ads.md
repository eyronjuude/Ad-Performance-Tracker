# Plan: Sync Employee Description Text in View Phase Ads

## Summary

The subtitle below each employee's name on the View Phase Ads page should match the descriptive text below the Tenured Employees / Probationary Employees section headings on the Dashboard, based on employee type.

| Employee type | Current View Phase Ads subtitle | Target (from Dashboard section) |
|---------------|--------------------------------|----------------------------------|
| Tenured | "P1 ad performance details from BigQuery" | "P1 ads grouped by employee acronym." |
| Probationary | "Ad performance from {start} to {end}" | "Grouped by employee acronym and probation date range." |

## Scope

- **In scope:** Frontend-only change. Centralize section description strings and reuse on View Phase Ads.
- **Out of scope:** Backend changes; no API changes.
- **Constraint:** Single source of truth for section text to avoid drift.

## Key Files

| File | Role |
|------|------|
| `frontend/app/page.tsx` | Dashboard – Tenured/Probationary section headings and description text |
| `frontend/app/ads/page.tsx` | View Phase Ads – header with employee name and subtitle |
| `frontend/lib/config.ts` | Shared config; candidate for section description constants |

## Tasks

### Frontend

- [x] **Add section description constants** – In `frontend/lib/config.ts` (or a small `constants.ts`), define:
  - `TENURED_SECTION_DESCRIPTION = "P1 ads grouped by employee acronym."`
  - `PROBATIONARY_SECTION_DESCRIPTION = "Grouped by employee acronym and probation date range."`

- [x] **Use constants on Dashboard** – Replace the hardcoded strings in `frontend/app/page.tsx` (lines 216 and 234) with the new constants.

- [x] **Update View Phase Ads subtitle** – In `frontend/app/ads/page.tsx`, replace the current subtitle logic (lines 154–158) with:
  - Determine employee type: `employee?.status ?? (isProbationary ? "probationary" : "tenured")`
  - Tenured → `TENURED_SECTION_DESCRIPTION`
  - Probationary → `PROBATIONARY_SECTION_DESCRIPTION`

- [x] **Add tests for View Phase Ads subtitle** – In `frontend/app/ads/__tests__/page.test.tsx`:
  - Test tenured employee shows tenured section description
  - Test probationary employee (with `start_date` and `end_date`) shows probationary section description

### Docs / Config

- [ ] Update `frontend/README.md` if route behavior description changes (optional; current `/ads` description may not need edits).

## Dependencies

- None. All work is in the frontend; no backend or API changes.

## Execution Order

1. Add constants to `config.ts`
2. Update Dashboard `page.tsx` to use constants
3. Update View Phase Ads `ads/page.tsx` to use constants by employee type
4. Add tests
5. Run tests and lint

## Unknowns

- **None.** Implementation is straightforward; section text is static and employee type is derivable from settings or URL params.
