---
name: backend-implementation
description: Implements backend code in the Ad Performance Tracker API using FastAPI. Use when implementing, extending, or refactoring backend routes, services, or tests. Ensures solutions fit the current backend structure and conventions.
---

Implement backend code in `backend/` for the Ad Performance Tracker API. Fit the existing tech stack and conventions.

## Tech Stack

| Area | Stack |
|------|-------|
| Framework | FastAPI (Python 3.11+) |
| Server | Uvicorn |
| Database | Postgres (psycopg) when `DATABASE_URL`; SQLite fallback (`backend/data/settings.db`) |
| External API | Google Cloud BigQuery (`google-cloud-bigquery`) |
| Config | `python-dotenv`, env vars from `.env` |
| Tests | pytest, TestClient (httpx), `app.dependency_overrides` |
| Linting | Ruff (E, F, I; 88-char line length) |

## Structure

```
backend/
├── main.py           # App entry, CORS, router includes
├── routers/          # APIRouter modules (prefix, tags)
├── tests/            # conftest.py + test_*.py
├── scripts/          # e.g. generate_openapi.py
├── data/             # SQLite DB (gitignored)
```

## Rules

- **Endpoints**: Add router in `routers/<name>.py`; include in `main.py` with prefix `/api`
- **DI**: Use `Depends()` for injectable services (e.g. `get_bigquery_client`)
- **Security**: No hardcoded secrets; parameterize SQL; validate user input
- **Tests**: Add in `tests/test_*.py`; use `app.dependency_overrides` for mocks
- **Docs**: Update `docs/api.md`, `backend/README.md`, run `python scripts/generate_openapi.py`

## Patterns

| Need | Pattern |
|------|---------|
| External client | Singleton via `Depends()`, credentials from env |
| BigQuery | `ScalarQueryParameter` for all user-supplied values |
| JSON responses | `_json_serial` for `datetime`, `Decimal`, `bytes` |

## Env Vars (`.env.example`)

GCP_PROJECT, BIGQUERY_DATASET, BIGQUERY_TABLE, GOOGLE_CREDENTIALS_JSON, DATABASE_URL, CORS_ORIGINS, PERFORMANCE_CACHE_TTL

## Before Finishing

- [ ] New/changed endpoints → docs updated, OpenAPI regenerated
- [ ] New env vars → `.env.example` with placeholder
- [ ] Tests added and passing
- [ ] Activate venv before Python commands (Windows: `.\venv\Scripts\Activate.ps1`)
