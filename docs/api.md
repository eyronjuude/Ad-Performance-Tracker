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

Returns **filtered and deduplicated** ad performance.

By default filters to P1 campaigns. When `p1_only=false` and date range params are provided, filters by the configured date column instead (for probationary employees).

- **P1 filter (default):** The substring `P1` must appear in `ad_name` (case-insensitive).
- **employee_acronym:** The acronym must appear in `adset_name` as a word—surrounded only by non-letters.
- **Date range filter:** When `p1_only=false` and `start_date`/`end_date` are provided, rows are filtered by `DATE(BIGQUERY_DATE_COLUMN) BETWEEN start_date AND end_date`.
- **Deduplication:** Rows with the same `(ad_name, adset_name)` are merged: `spend` is summed, `croas` is the spend-weighted average.

**Query parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `employee_acronym` | string | Yes | — | Employee acronym to filter by (min length 1). |
| `p1_only` | boolean | No | `true` | When true, filter to P1 ads. Set false for date-range queries. |
| `start_date` | string | No | — | Start of date range (YYYY-MM-DD). Used when `p1_only=false`. |
| `end_date` | string | No | — | End of date range (YYYY-MM-DD). Used when `p1_only=false`. |

**Examples:**

- P1 (tenured): `GET /api/bigquery/performance?employee_acronym=ABC`
- Date range (probationary): `GET /api/bigquery/performance?employee_acronym=NE&p1_only=false&start_date=2026-01-15&end_date=2026-07-15`

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

**Table schema:** The BigQuery table must include columns: `ad_name`, `adset_name`, `spend_sum`, `placed_order_total_revenue_sum_direct_session`. For date-range filtering, the table must also have the column configured via `BIGQUERY_DATE_COLUMN` (default: `date`). cROAS is computed as `placed_order_total_revenue_sum_direct_session / spend_sum`.

---

### `GET /api/bigquery/performance/summary`

Returns an aggregated single-row summary instead of per-ad rows. Accepts the same filter parameters as `/api/bigquery/performance`.

**Query parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `employee_acronym` | string | Yes | — | Employee acronym to filter by (min length 1). |
| `p1_only` | boolean | No | `true` | When true, filter to P1 ads. Set false for date-range queries. |
| `start_date` | string | No | — | Start of date range (YYYY-MM-DD). Used when `p1_only=false`. |
| `end_date` | string | No | — | End of date range (YYYY-MM-DD). Used when `p1_only=false`. |

**Response:** `200 OK` — JSON object:

| Field | Type | Description |
|-------|------|-------------|
| `total_spend` | number | Sum of spend across all matching ads. |
| `blended_croas` | number\|null | Spend-weighted cROAS. |
| `row_count` | number | Number of distinct ad rows. |

**Errors:** Same as `/api/bigquery/performance`.

---

## Settings

App settings (employee mapping, evaluation thresholds, periods) are stored in a database and shared across all users. When `DATABASE_URL` is set (e.g. from Vercel/Neon), Postgres is used. Otherwise SQLite is used via `DATABASE_PATH` (default: `backend/data/settings.db`).

### `GET /api/settings`

Returns the current app settings.

**Response:** `200 OK` — JSON object:

| Field | Type | Description |
|-------|------|-------------|
| `employees` | array | `{acronym, name, status, startDate, reviewDate}` employee entries |
| `spendEvaluationKey` | array | `{min, max, color}` thresholds for spend (AUD) |
| `croasEvaluationKey` | array | `{min, max, color}` thresholds for cROAS |
| `periods` | array | Period labels (e.g. `["P1", "P2"]`) |

Each employee object:

| Field | Type | Description |
|-------|------|-------------|
| `acronym` | string | BigQuery filter acronym. |
| `name` | string | Display name shown in the dashboard. |
| `status` | string | `"tenured"` or `"probationary"`. |
| `startDate` | string\|null | Probation start date (YYYY-MM-DD), null for tenured. |
| `reviewDate` | string\|null | Probation review date (YYYY-MM-DD), null for tenured. |

If no settings exist, returns defaults (all employees tenured).

**Errors:** `500 Internal Server Error` — Database or JSON error.

---

### `PUT /api/settings`

Replaces stored settings with the request body.

**Request body:** Same shape as `GET` response (employees, spendEvaluationKey, croasEvaluationKey, periods).

**Response:** `200 OK` — The saved settings.

**Errors:** `400 Bad Request` — Invalid JSON or save failed.
