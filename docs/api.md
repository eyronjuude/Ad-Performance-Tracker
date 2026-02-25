# Backend API Reference

Base URL (local): `http://127.0.0.1:8000`

**OpenAPI schema:** [openapi.json](openapi.json) (regenerate with `python scripts/generate_openapi.py` from the `backend/` directory when endpoints change).

---

## General

### `GET /`

Root message.

**Response:** `200 OK`

```json
{ "message": "Ad Performance Tracker API" }
```

---

### `GET /health`

Health check (e.g. for readiness probes).

**Response:** `200 OK`

```json
{ "status": "ok" }
```

---

## BigQuery

Endpoints under `/api/bigquery` require environment variables: `GCP_PROJECT`, `BIGQUERY_DATASET`, `BIGQUERY_TABLE`. If unset or if the BigQuery client cannot be created, responses are `503 Service Unavailable`.

### `GET /api/bigquery/sample`

Returns up to 5 raw rows from the configured BigQuery table. No query parameters.

**Response:** `200 OK` — JSON array of row objects (keys match table columns; values are JSON-serializable).

**Errors:**

- `502 Bad Gateway` — BigQuery request failed.
- `503 Service Unavailable` — BigQuery not configured or client creation failed.

---

### `GET /api/bigquery/performance`

Returns **filtered and deduplicated** ad performance:

- **Filter:** Rows where the ad qualifies as P1 and the employee acronym matches:
  - **P1:** The substring `P1` must appear in `ad_name` (case-insensitive; may be surrounded by symbols, e.g. `MP1`, `RRL - P1`).
  - **employee_acronym:** The acronym must appear in `adset_name` as a word—surrounded only by non-letters (e.g. `SC_P_HM_US` matches `HM`; `CPA` does not match `CP` because `A` is a letter).
- **Deduplication:** Rows with the same `(ad_name, adset_name)` are merged: `spend` is summed, `croas` is the spend-weighted average.

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `employee_acronym` | string | Yes | Employee acronym to filter by (min length 1). |

**Example:** `GET /api/bigquery/performance?employee_acronym=ABC`

**Response:** `200 OK` — JSON array of objects:

| Field | Type | Description |
|-------|------|-------------|
| `ad_name` | string | Ad/campaign name (unique per row after dedup). |
| `adset_name` | string | Ad set name (unique per row after dedup). |
| `spend` | number | Total spend (summed over merged rows). |
| `croas` | number | Spend-weighted average cROAS. |

Rows are ordered by `spend` descending.

**Errors:**

- `422 Unprocessable Entity` — Missing or invalid `employee_acronym`.
- `502 Bad Gateway` — BigQuery request failed.
- `503 Service Unavailable` — BigQuery not configured or client creation failed.

**Table schema:** The BigQuery table must include columns: `ad_name`, `adset_name`, `spend_sum`, `placed_order_total_revenue_sum_direct_session`. cROAS is computed as `placed_order_total_revenue_sum_direct_session / spend_sum` (aggregated as `SUM(placed_order_total_revenue_sum_direct_session) / SUM(spend_sum)` when merged). See [BigQuery proposal](proposals/bigquery.md) for details.
