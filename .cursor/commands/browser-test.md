# Run a browser test

**Agent/Skill**: Use the **browser-testing** skill. Read `.cursor/skills/browser-testing/SKILL.md` for the full workflow.

1. **Prereq** – Ensure dev server is running (`bun run dev` in `frontend/`).
2. **Navigate** – Use browser MCP to go to the target URL (e.g. `http://localhost:3000/campaigns`).
3. **Lock** – For cursor-ide-browser: `browser_navigate` → `browser_lock` before interactions.
4. **Snapshot** – Get page structure and element refs before click/type.
5. **Verify** – Interact with the page and confirm expected behavior.
6. **Unlock** – Call `browser_unlock` when done.

Server: `cursor-ide-browser` (or `user-Playwright`). See `docs/browser-mcp-setup.md` for setup.
