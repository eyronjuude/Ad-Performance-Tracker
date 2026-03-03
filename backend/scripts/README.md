# Backend scripts

Essential pipeline scripts for the backend. Used by Lefthook (pre-commit) and project workflows.

| Script | Purpose |
|--------|---------|
| `check_no_secret_files.sh` | Block commits that stage `.env`, `.env.local`, or other secret env files (allows `.env.example`). Invoked from repo root by Lefthook. |
| `run_ruff.sh` | Run Ruff from `backend/.venv` for format/lint. Handles Windows and Unix paths. Invoked from repo root by Lefthook. |
| `generate_openapi.py` | Export FastAPI OpenAPI schema to `docs/openapi.json`. Run from `backend/` with `python scripts/generate_openapi.py` (venv active). |

See `.cursor/rules/project/essential-pipeline-scripts-only.mdc` for the policy on what belongs in `frontend/scripts/` and `backend/scripts/`.
