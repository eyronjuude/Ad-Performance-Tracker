# Ad Performance Tracker – Backend

FastAPI backend for the Ad Performance Tracker.

## Setup

1. Create a virtual environment and install dependencies:

   ```bash
   python -m venv .venv
   .venv\Scripts\Activate.ps1   # Windows PowerShell
   pip install -r requirements.txt
   ```

2. Copy `backend/.env.example` to `.env` and set variables (see [Environment variables](#environment-variables)).

## Run

From the **backend** directory (so `main.py` and `.env` are found):

```powershell
# Windows PowerShell (from repo root first: cd backend)
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- Use `python -m uvicorn` so the venv’s Python is used.
- If port 8000 is already in use, use another port (e.g. `--port 8001`) or stop the process: `netstat -ano | findstr :8000` to get the PID, then `taskkill /PID <pid> /F`.

## API

See **[docs/api.md](../docs/api.md)** for the full API reference (parameters, response shapes, errors). Machine-readable schema: **[docs/openapi.json](../docs/openapi.json)** (regenerate with `python scripts/generate_openapi.py` from this directory when endpoints change).

Quick list:

- `GET /` – Root message
- `GET /health` – Health check
- `GET /api/bigquery/sample` – Up to 5 rows from the configured BigQuery table (requires BigQuery env vars)
- `GET /api/bigquery/performance?employee_acronym=<acronym>` – P1 ad performance for the given employee acronym, deduplicated by ad name and adset name (spend summed, cROAS spend-weighted average). Returns `ad_name`, `adset_name`, `spend`, `croas`. P1 = substring in `ad_name`; acronym = word in `adset_name` (surrounded by non-letters only). Requires BigQuery env vars and table columns: `ad_name`, `adset_name`, `spend_sum`, `placed_order_total_revenue_sum_direct_session` (cROAS = revenue / spend).
- `GET /api/settings` – App settings (employees, evaluation thresholds, periods). Stored in SQLite; shared across users.
- `PUT /api/settings` – Update app settings. Request body: same shape as GET response.

## Environment variables

| Variable | Description |
|----------|-------------|
| `GCP_PROJECT` | GCP project ID for BigQuery |
| `BIGQUERY_DATASET` | BigQuery dataset name |
| `BIGQUERY_TABLE` | BigQuery table name |
| `GOOGLE_APPLICATION_CREDENTIALS` | (Optional) Path to service account JSON key; if unset, Application Default Credentials are used |
| `DATABASE_PATH` | (Optional) Path to SQLite file for settings. Default: `backend/data/settings.db` |

See `backend/.env.example` for a template.

## Tests

```bash
pytest tests/ -v
```
