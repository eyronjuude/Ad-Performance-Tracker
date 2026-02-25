# Employee P1 Ad Performance Dashboard

## Summary of Requirements

A **new, separate page** (not Twinkling Treehouse) that automates the manual reporting workflow previously done in Converge.

---

## 1. Page Structure

### 1.1 Employee Boxes

- One **box/card per employee**
- Employee list: **&lt;INSERT EMPLOYEE LIST&gt;** (to be provided)

### 1.2 Per-Employee Table

Each employee box contains a table with these metrics:

| Column | Description |
|--------|-------------|
| **P1** | Filter ads where ad name contains `P1` (case-insensitive) |
| **Employee** | Filter ads where ad name/adset name contains employee acronym (to be clarified: ad_name vs adset_name) |
| **Total Spend** | Sum of spend for ads matching P1 + employee filter |
| **Total CROAS** | Aggregate CROAS (blended across ads) |
| **Spend Evaluation** | Color-coded per key (see below) |
| **CROAS Evaluation** | Color-coded per key (see below) |
| **Ads** | Button that opens a new page with detailed ad list |

### 1.3 Spend Evaluation Key (Colors)

- **Green**: Spend > $20,000
- **Yellow**: Spend between two thresholds (exact numbers **&lt;INSERT&gt;**)
- Other bands: **&lt;INSERT full key&gt;**

### 1.4 CROAS Evaluation Key (Colors)

- Key not yet specified — **&lt;INSERT CROAS thresholds and colors&gt;**

---

## 2. Ads Detail Page (Opened via Button)

When the **Ads** button is clicked for an employee:

1. Open a **new page** in a new tab/window
2. Show all advertisements matching: P1 filter + employee filter
3. **Deduplicate ads**: Same ad name appearing multiple times (e.g., same ad in different adsets or days) should be shown **once**
4. For deduplicated ads:
   - Sum **spend** across all rows
   - Sum **revenue** across all rows
   - Compute **blended ROAS** = total revenue / total spend
5. **Order**: Most spending ad → least spending ad
6. **Refreshed data**: Table/page should reflect updates as ads receive more spend over time (Converge → BigQuery keeps syncing)

---

## 3. Data Source & Filters

- **Source**: Converge → BigQuery (data exported from Converge)
- **P1 filter**: `ad_name` contains `P1` (case-insensitive)
- **Employee filter**: Acronym appears in ad name or ad set name — **clarify**: current backend uses `adset_name` for acronym; user mentioned “acronyms in the ad name”
- **Date range**: User can select; historical data can go back (e.g., to 2025 start). Converge BigQuery data is “aggregated by day and ad” with a `date` column.

### 3.1 Column Name Check

- **Converge docs**: `placed_order_revenue_sum_direct_session`
- **Current backend**: `placed_order_total_revenue_sum_direct_session`

**Action**: Verify actual BigQuery column name when Converge sync is set up; update backend if different.

---

## 4. What Already Exists

| Component | Status |
|-----------|--------|
| BigQuery integration | ✅ Configured |
| P1 filter (ad_name contains P1) | ✅ Backend |
| Employee acronym filter (adset_name word match) | ✅ Backend |
| Deduplication by (ad_name, adset_name) | ✅ Backend |
| Spend sum, cROAS (spend-weighted) | ✅ Backend |
| `/api/bigquery/performance?employee_acronym=X` | ✅ Working |

### 4.1 Potential Gaps

- **Deduplication scope**: Backend groups by `(ad_name, adset_name)`. If the same ad name appears in multiple adsets, it shows multiple rows. User wants “each ad only once” — likely need grouping by `ad_name` only when showing the ads detail view.
- **Aggregate totals**: Current API returns per-ad rows. Need aggregate totals (total spend, total CROAS) per employee for the summary table — can compute in frontend or add backend endpoint.
- **Date range filter**: Backend currently queries all data; may need date range parameters for historical views.
- **Frontend**: Placeholder only; new dashboard page and ads detail page need to be built.

---

## 5. Clarifications Needed Before Implementation

1. **Employee list**: Exact list of employees and their acronyms (e.g., HM, CPA, etc.)
2. **Acronym location**: Is acronym in `ad_name`, `adset_name`, or both? Current backend uses `adset_name`.
3. **Spend Evaluation key**: Full thresholds and colors (e.g., $20k green, $X–$Y yellow, etc.)
4. **CROAS Evaluation key**: All thresholds and colors
5. **Date range**: Default range and how far back historical data goes (user thinks 2025).
6. **BigQuery setup**: Is Converge → BigQuery already configured, or is that part of the “new BigQuery card”?

---

## 6. Implementation Plan

### Phase 1: BigQuery & Backend (assuming BigQuery card covers Converge sync)

- [ ] Confirm BigQuery schema matches backend (column names)
- [ ] Optionally add date range params to performance endpoint
- [ ] Add endpoint or extend existing for aggregate totals (total spend, total CROAS per employee)
- [ ] Add endpoint or extend for ads detail: group by `ad_name` only, sum spend/revenue, blend ROAS

### Phase 2: Frontend – Employee Dashboard Page

- [x] Create new route (e.g. `/dashboard` or `/employees`)
- [x] API client to fetch performance data per employee
- [x] Employee boxes with summary table (spend, CROAS, spend eval, CROAS eval)
- [x] Color-coded cells per evaluation keys
- [x] Ads button linking to detail page with query params (employee_acronym)

### Phase 3: Frontend – Ads Detail Page

- [ ] Create route (e.g. `/ads?employee_acronym=X`)
- [ ] Fetch deduplicated ads (by ad_name only)
- [ ] Table: ad name, spend, revenue, blended ROAS, sorted by spend DESC
- [ ] Open in new tab from Ads button

### Phase 4: Polish

- [ ] Refresh/auto-refresh or clear “last updated” indicator
- [ ] Loading and error states
- [ ] Tests (backend + frontend)
- [ ] Docs and README updates

---

## 7. Timeline Estimate

**Assumptions:**

- Employee list and evaluation keys provided within 1–2 days
- BigQuery/Converge sync either already done or handled by separate card
- 1 developer working on this

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1 (Backend) | 0.5–1 day | BigQuery schema confirmed |
| Phase 2 (Dashboard) | 1–1.5 days | Phase 1 |
| Phase 3 (Ads detail) | 0.5–1 day | Phase 1 |
| Phase 4 (Polish, tests) | 0.5–1 day | Phases 2–3 |

**Estimated completion**: **Thursday or Friday next week** (e.g., if starting Monday, completion by Feb 27–28 or Mar 6–7 depending on which “next week” is intended).

**Blockers:**

- Awaiting employee list and evaluation keys
- BigQuery/Converge setup status (separate card)
- Confirming column name and deduplication rules

---

## 8. References

- [Converge BigQuery Integration](https://docs.runconverge.com/data-warehouse/integrations/bigquery)
- [BigQuery Proposal](./bigquery.md)
- [API Reference](../api.md)
- Backend: `backend/routers/bigquery.py`
