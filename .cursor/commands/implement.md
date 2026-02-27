# Implement a feature

**Agent/Skill**: Use the **implement-agent**. For backend work apply **backend-agent** and `.cursor/skills/backend-implementation/SKILL.md`. For frontend work apply **frontend-agent** and `.cursor/skills/frontend-implementation/SKILL.md`. Use both when the feature spans the stack.

1. **Determine scope** – Backend only, frontend only, or full-stack.
2. **Implement** – Backend API first when integration is needed; then frontend.
3. **Test** – Add pytest tests for backend changes and Vitest tests for frontend changes (per test-on-feature-implementation rule).
4. **Docs** – Update `docs/api.md`, `backend/README.md`, and regenerate OpenAPI (`python scripts/generate_openapi.py`) for new/changed endpoints.
5. **Verify** – Run `cd backend && python -m pytest tests/ -v` (venv active) and `cd frontend && bun run test`.
