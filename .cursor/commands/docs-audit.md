# Audit and sync API docs, OpenAPI, and READMEs

1. Apply the **docs-agent** and act as a documentation specialist.
2. Scope to the files or directories the user specifies, or the full docs surface if none given:
   - `docs/api.md` — canonical API reference
   - `docs/openapi.json` — OpenAPI schema (regenerate, do not edit by hand)
   - All READMEs (`README.md`, `backend/README.md`, `frontend/README.md`, `.cursor/agents/README.md`, etc.)
3. Follow the docs-agent workflow:
   - Audit for drift between docs and code
   - Ensure `docs/api.md` and `backend/README.md` match implemented endpoints
   - Regenerate `docs/openapi.json` when API docs change: `python scripts/generate_openapi.py` from `backend/` (with venv active)
   - Update READMEs for setup, env vars, scripts, and architecture
4. Report: summary, findings per document, actions taken, recommendations.
