---
name: debug
description: Diagnoses and fixes issues from pasted error messages, stack traces, and debug logs. Use when the user pastes an error output, exception traceback, build failure, or debug log and needs help resolving it.
---

Diagnose and fix issues from pasted errors and logs.

## Workflow

1. **Parse** – Identify error type, message, file:line, stack trace, exit/HTTP codes
2. **Map** – Resolve paths to project files; open relevant code
3. **Diagnose** – Root cause before proposing fixes
4. **Fix** – Minimal changes; use project conventions (venv, bun, env vars)
5. **Verify** – Re-run command or test to confirm

## Error-type recognition

| Signal | Type | Typical fix |
|--------|------|-------------|
| `Traceback`, `File "...", line` | Python | Import, syntax, missing dep, env var |
| `ModuleNotFoundError`, `ImportError` | Python | `pip install`, venv active, PYTHONPATH |
| `TypeError`, `AttributeError` | Python | Wrong type, missing attr, wrong API usage |
| `SyntaxError`, `IndentationError` | Python | Fix syntax at reported line |
| `error TS`, `Property 'x' does not exist` | TypeScript | Types, interface, optional chaining |
| `Module not found`, `Can't resolve` | Next.js/bun | Install dep, path alias, `bun install` |
| `Failed to compile`, `Build error` | Next.js | Syntax, imports, env vars |
| `404`, `500`, `Connection refused` | API | Endpoint, env, backend running |
| `EACCES`, `ENOENT`, `EPERM` | OS/Node | Paths, permissions, file exists |

## Project-specific

| Area | Paths | Tools | Common issues |
|------|-------|-------|---------------|
| Backend | `backend/` | pytest, FastAPI, venv | Missing `.env`, BigQuery config, import paths |
| Frontend | `frontend/` | Vitest, Next.js, bun | `NEXT_PUBLIC_*`, API URL, component imports |
| API | `backend/routers/` | `.env.example` | `API_BASE_URL`, BigQuery credentials |

- **Python**: Activate venv first; use `.\venv\Scripts\Activate.ps1` on Windows
- **Frontend**: Use bun (not npm/pnpm); `bun install`, `bun run dev`, `bun run test`
- **Env vars**: Never add real secrets; point user to `.env.example`

## When to ask for more context

- Error references files not in workspace
- Truncated or ambiguous stack trace
- "Works on my machine" / environment-specific
- Intermittent or flaky failures

## Output format

1. **Summary** – One-line issue description
2. **Cause** – Root cause
3. **Fix** – Steps with code/config changes
4. **Verify** – Command to confirm (e.g. `bun run test`, `pytest tests/test_foo.py`)

## Checklist

- [ ] Parsed error type and location
- [ ] Mapped to project files
- [ ] Root cause identified before proposing fixes
- [ ] Minimal changes only
- [ ] Project tools (venv, bun) and env var rules followed
- [ ] Verification step suggested
