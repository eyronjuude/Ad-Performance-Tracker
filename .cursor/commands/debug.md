# Debug a pasted error or log

**Agent/Skill**: Use the **debug-agent** or read `.cursor/skills/debug/SKILL.md` for full workflow. Treat the user's pasted content as error output or debug logs.

1. **Parse** – Identify error type (Python, TypeScript, build, API, etc.), message, file:line, and stack trace.
2. **Map** – Resolve paths to project files (`backend/`, `frontend/`) and open relevant code.
3. **Diagnose** – Determine root cause before suggesting changes.
4. **Fix** – Propose minimal code/config changes. Use project tools: venv for Python, bun for frontend.
5. **Verify** – Suggest how to re-run or re-test to confirm the fix.

Return a concise summary, cause, fix steps, and verification command.
