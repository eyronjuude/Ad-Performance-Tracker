---
name: test-implementation
description: Implements and runs tests to ensure code changes are covered by their respective test suites. Use when verifying changes are tested, running test suites (vitest, pytest), or ensuring tests pass before considering work complete.
---

Ensure every code change is tested and that test suites pass.

## Scope

| Area | Runner | Command |
|------|--------|---------|
| Frontend (`frontend/`) | Vitest | `bun run test` (use bun) |
| Backend (`backend/`) | pytest | `python -m pytest tests/` (venv active) |

## Workflow

1. **Map changes** – `frontend/**` → Vitest; `backend/**` → pytest
2. **Add/update tests** – New feature → add tests; bug fix → regression test
3. **Run** – `cd frontend && bun run test` and/or `cd backend && python -m pytest tests/ -v`
4. **Fix failures** – Fix test or implementation until all pass

## File Mapping

- `backend/routers/foo.py` → `backend/tests/test_foo.py`
- `frontend/app/settings/page.tsx` → `frontend/app/settings/__tests__/page.test.tsx`
- Use `TestClient(app)` for API tests; mock via `app.dependency_overrides`
- Wrap components needing settings in `SettingsProvider`

## Commands

```bash
# Frontend
cd frontend && bun run test

# Backend (venv first on Windows)
.\venv\Scripts\Activate.ps1
cd backend && python -m pytest tests/ -v
```

## Checklist

- [ ] All modified areas have corresponding tests
- [ ] Frontend tests pass (`bun run test`)
- [ ] Backend tests pass (`pytest` with venv)
- [ ] No failing or skipped tests
- [ ] BigQuery mocked via `dependency_overrides`; settings via `temp_db` fixture
