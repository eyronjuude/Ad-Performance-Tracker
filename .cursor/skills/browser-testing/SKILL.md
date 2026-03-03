---
name: browser-testing
description: Uses browser MCP (cursor-ide-browser or Playwright) to test frontend flows, verify UI changes, and run manual E2E checks. Use when the user wants to browser-test a page, verify a flow, or run a quick smoke test.
---

# Browser Testing

Use browser MCP tools to interact with the Ad Performance Tracker frontend for manual testing, flow verification, and visual checks.

## MCP Servers

| Server | Identifier | When to use |
|--------|------------|-------------|
| cursor-ide-browser | `cursor-ide-browser` | Default; built into Cursor; supports profiling |
| Playwright | `user-Playwright` | Alternative; same core tools |

Invoke tools via `call_mcp_tool` with the appropriate server identifier.

## Workflow (cursor-ide-browser)

1. **Ensure dev server is running** – `bun run dev` in `frontend/`, backend on port 8000
2. **Navigate** – `browser_navigate` with URL (e.g. `http://localhost:3000/campaigns`)
3. **Lock** – `browser_lock` (if tab exists) or after `browser_navigate`
4. **Snapshot** – `browser_snapshot` to get page structure and element refs
5. **Interact** – `browser_click`, `browser_type`, `browser_fill` using refs from snapshot
6. **Wait** – Short waits (1–3s) + `browser_snapshot` to check readiness
7. **Unlock** – `browser_unlock` when done with all operations

## Critical Rules

- **Never** call `browser_lock` before `browser_navigate` – lock requires an existing tab
- **Always** call `browser_snapshot` before click/type to get element refs
- **Unlock** only when completely done with that turn's browser work
- For native dialogs: call `browser_handle_dialog` **before** the action that triggers them

## Typical Flows

| User intent | Steps |
|-------------|-------|
| "Test the campaigns page" | Navigate to `/campaigns` → snapshot → verify table/headers render |
| "Test date filter" | Navigate → open date picker → select range → verify filtered results |
| "Test login flow" | Navigate to `/login` → fill form → submit → verify redirect |
| "Profile performance" | Use `browser_profile_start` before interaction, `browser_profile_stop` after |

## Project URLs

| Page | URL |
|------|-----|
| Home / Dashboard | `http://localhost:3000` |
| Campaigns | `http://localhost:3000/campaigns` |
| Settings | `http://localhost:3000/settings` |

Adjust port if frontend runs elsewhere. See `docs/browser-mcp-setup.md` for setup details.
