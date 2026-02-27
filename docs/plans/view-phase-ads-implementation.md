# Plan: View Phase Ads — Tasks from Doing

## Summary

Implement the "View Phase Ads" feature: under each person's name, add a button labeled "View Phase Ads" that filters ads by that person's acronym and the current phase (P1 for tenured, date range for probationary). The backend already supports these filters; the work is frontend-only.

---

## Doing List Tasks (from Trello)

| Card | Priority | Description |
|------|----------|-------------|
| [Watch: Filter Ads by Acronym — Tella](https://trello.com/c/9FGkBj56) | High | Reference video for acronym-filtering context |
| [Add View Phase Ads button under each person](https://trello.com/c/C8tTAIfe) | Medium | Button + filter by acronym + phase |

---

## Tasks

### Frontend

- [ ] **Rename "View Ads" to "View Phase Ads"** — In `EmployeeTable.tsx` (line 205), change button text from "View Ads" to "View Phase Ads".
- [ ] **Rename "View Ads" to "View Phase Ads"** — In `ProbationaryEmployeeTable.tsx` (line 187), change button text from "View Ads" to "View Phase Ads".
- [ ] **Verify phase filter is applied** — Tenured: `/ads?employee_acronym=X` uses `p1_only=true` (P1 phase). Probationary: `buildAdsHref` already passes `start_date` and `end_date` for the probation phase. Ensure the `/ads` page passes these correctly to the API.
- [ ] **Add frontend tests** — Add/update tests for the View Phase Ads flow: link presence, correct query params, correct label. See `frontend/app/__tests__/page.test.tsx` for existing patterns.

### Docs / Config

- [ ] None required — No API changes; no new env vars.

---

## Current Architecture (reference)

| Component | Location | Phase behavior |
|-----------|----------|----------------|
| Tenured employees | `EmployeeTable.tsx` | Link: `/ads?employee_acronym=X`. Ads page uses `p1_only=true` (P1). |
| Probationary employees | `ProbationaryEmployeeTable.tsx` | Link: `/ads?employee_acronym=X&start_date=…&end_date=…`. Ads page uses date range. |
| Ads page | `frontend/app/ads/page.tsx` | Reads `employee_acronym` from URL; for probationary, uses `start_date`/`end_date` with `p1_only=false`. |
| API | `GET /api/bigquery/performance` | `employee_acronym` (required), `p1_only`, `start_date`, `end_date`. |

---

## Dependencies

- **Button rename** — Independent; can be done in parallel for both tables.
- **Tests** — Depend on the button/link implementation.

---

---

## Execution Order

1. Rename "View Ads" → "View Phase Ads" in both `EmployeeTable.tsx` and `ProbationaryEmployeeTable.tsx`.
2. Verify `/ads` page and API correctly apply phase filter (P1 or date range).
3. Add/update frontend tests.
4. Manual smoke test: click View Phase Ads for tenured and probationary employees; confirm filtered ads.

---

## Checklist for Implement Command

- [ ] Tasks are discrete and actionable
- [ ] Backend vs frontend clearly separated
- [ ] Dependencies and order noted
- [ ] Unknowns flagged for research
- [ ] Plan can be handed to implement command
