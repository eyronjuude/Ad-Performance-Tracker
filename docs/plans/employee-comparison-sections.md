# Plan: Tenured and Probationary Employee Comparison Sections

## Summary

Add two new dashboard sections: **Tenured Employee Comparison** and **Probationary Employee Comparison**. Each has a collapsible "Phase 1" accordion with a single table comparing employees side-by-side (one row per employee). Phase Two to be added later.

## Current State

- **Tenured Employees**: Per-employee accordions; expanded table has rows by period (P1; labeled "Month"), columns: Month, Spend, cROAS, Spend Eval, cROAS Eval, Ads.
- **Probationary Employees**: Per-employee accordions; expanded table has one row (date range), columns: Start Date, Review Date, Spend, cROAS, Spend Eval, cROAS Eval, Ads.
- **Data**: `tenuredState` and `probationaryState` already hold aggregates per employee. No new API calls needed.

## Target Design

### Tenured Employee Comparison

- **Section**: Heading "Tenured Employee Comparison", description text (optional).
- **Accordion**: Single collapsible "Phase 1" (reuse existing expand/collapse pattern).
- **Table** (when expanded):
  - **Rows**: One per tenured employee.
  - **Columns**: Employee | Spend (AUD) | cROAS | Spend Evaluation | cROAS Evaluation | Ads.
  - Replace "Month" with "Employee"; same column set as current Tenured detail table.

### Probationary Employee Comparison

- **Section**: Heading "Probationary Employee Comparison".
- **Accordion**: Single collapsible "Phase 1".
- **Table** (when expanded):
  - **Rows**: One per probationary employee.
  - **Columns**: Employee Name | Start Date | Review Date | Spend (AUD) | cROAS | Spend Evaluation | cROAS Evaluation | Ads.
  - Add "Employee Name" as first column; keep Start/Review dates (per-employee date range).

## Scope

- **In scope**: Frontend-only. Reuse existing `tenuredState` / `probationaryState` and evaluation helpers.
- **Out of scope**: Phase Two, backend changes, new API endpoints.

## Tasks

### Frontend

- [x] **TenuredEmployeeComparisonTable component** – New component:
  - Collapsible "Phase 1" header (same pattern as `EmployeeTable` chevron/expand).
  - Single table: rows = employees, columns = Employee, Spend, cROAS, Spend Eval, cROAS Eval, Ads.
  - Reuse `formatSpendAud`, `formatCroas`, `getSpendEvaluationColor`, `getCroasEvaluationColor`, `DOT_COLORS`.
  - Props: `employees`, `spendEvaluationKey`, `croasEvaluationKey`, `state`.
  - View Phase Ads link: `/ads?employee_acronym={acronym}`.

- [x] **ProbationaryEmployeeComparisonTable component** – New component:
  - Collapsible "Phase 1" header.
  - Single table: rows = employees, columns = Employee Name, Start Date, Review Date, Spend, cROAS, Spend Eval, cROAS Eval, Ads.
  - Props: `employees`, `spendEvaluationKey`, `croasEvaluationKey`, `state`.
  - View Phase Ads link: `buildAdsHref(employee)` (with date params for probationary).

- [x] **Integrate sections on dashboard** – In `frontend/app/page.tsx`:
  - Add "Tenured Employee Comparison" section (after Tenured Employees) when `tenuredEmployees.length > 0`.
  - Add "Probationary Employee Comparison" section (after Probationary Employees) when `probationaryEmployees.length > 0`.

- [x] **Tests** – Add tests for:
  - Tenured comparison: section renders when tenured exist; Phase 1 accordion; table with employee rows.
  - Probationary comparison: section renders when probationary exist; Phase 1 accordion; Employee Name column; table with employee rows.

### Docs / Config

- [x] Update `frontend/README.md` route description if the dashboard sections list changes.

## Dependencies

- None. Uses existing state and APIs.

## Execution Order

1. Create `TenuredEmployeeComparisonTable`.
2. Create `ProbationaryEmployeeComparisonTable`.
3. Add both sections to `page.tsx`.
4. Add tests.
5. Run tests and lint.

## Unknowns

- **None.** Design is clear; implementation follows existing patterns.
