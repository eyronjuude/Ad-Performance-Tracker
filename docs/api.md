# Backend API Reference

Base URL (local): `http://127.0.0.1:8000`

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

- **Filter:** Rows where `priority` = P1 and `employee_acronym` matches the query parameter.
- **Deduplication:** Rows with the same `ad_name` are merged: `spend` is summed, `croas` is the spend-weighted average.

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `employee_acronym` | string | Yes | Employee acronym to filter by (min length 1). |

**Example:** `GET /api/bigquery/performance?employee_acronym=ABC`

**Response:** `200 OK` — JSON array of objects:

| Field | Type | Description |
|-------|------|-------------|
| `ad_name` | string | Ad/campaign name (unique per row after dedup). |
| `spend` | number | Total spend (summed over merged rows). |
| `croas` | number | Spend-weighted average cROAS. |

Rows are ordered by `spend` descending.

**Errors:**

- `422 Unprocessable Entity` — Missing or invalid `employee_acronym`.
- `502 Bad Gateway` — BigQuery request failed.
- `503 Service Unavailable` — BigQuery not configured or client creation failed.

**Table schema:** The BigQuery table must include columns: `ad_name`, `spend`, `croas`, `priority`, `employee_acronym`. See [BigQuery proposal](proposals/bigquery.md) for details.
