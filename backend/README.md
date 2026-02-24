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

- `GET /` – Root message
- `GET /health` – Health check
- `GET /api/bigquery/sample` – Returns up to 5 rows from the configured BigQuery table (requires BigQuery env vars)

## Environment variables

| Variable | Description |
|----------|-------------|
| `GCP_PROJECT` | GCP project ID for BigQuery |
| `BIGQUERY_DATASET` | BigQuery dataset name |
| `BIGQUERY_TABLE` | BigQuery table name |
| `GOOGLE_APPLICATION_CREDENTIALS` | (Optional) Path to service account JSON key; if unset, Application Default Credentials are used |

See `backend/.env.example` for a template.

## Tests

```bash
pytest tests/ -v
```
