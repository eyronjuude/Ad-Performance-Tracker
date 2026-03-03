# Browser MCP Setup

This project can use **browser MCP** servers to interact with web pages for frontend testing, manual flows, and visual checks. Two options are available: **cursor-ide-browser** (built-in) and **Playwright** (user-installed).

## Available MCPs

| MCP | Server identifier | Purpose |
|-----|-------------------|---------|
| **cursor-ide-browser** | `cursor-ide-browser` | Browser automation in Cursor's IDE; lock/unlock tabs; CPU profiling |
| **Playwright** | `user-Playwright` | Browser automation via Playwright; navigate, click, type, snapshot |

## When to Use

- **Visual verification** – Check how a page looks after changes
- **Manual flow testing** – Run through a user journey (login, create campaign, etc.)
- **E2E sanity checks** – Quick smoke tests before committing
- **Performance profiling** – Use cursor-ide-browser's `browser_profile_start`/`browser_profile_stop` to profile JavaScript

## cursor-ide-browser (recommended for most cases)

Uses Cursor's integrated browser. No extra setup if Cursor MCP is enabled.

### Key workflow: lock/unlock

1. **browser_lock** requires an existing browser tab – you **cannot** lock before navigating
2. Correct order: `browser_navigate` → `browser_lock` → (interactions) → `browser_unlock`
3. If a tab already exists, call `browser_lock` first before any interactions
4. Call `browser_unlock` only when done with **all** browser operations for that turn

### Key tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URL (optionally new tab, side panel) |
| `browser_lock` / `browser_unlock` | Lock tab for automation; unlock when done |
| `browser_tabs` | List open tabs and URLs |
| `browser_snapshot` | Get page structure and element refs before click/type |
| `browser_click`, `browser_type`, `browser_fill` | Interact with elements |
| `browser_wait_for` | Wait for page changes |
| `browser_profile_start` / `browser_profile_stop` | CPU profiling |

### Best practices

- **Before interacting**: Use `browser_tabs` to list tabs, then `browser_snapshot` to get element refs
- **Waiting**: Prefer short incremental waits (1–3s) with `browser_snapshot` checks rather than one long wait
- **Dialogs**: Call `browser_handle_dialog` before the action that triggers `alert`/`confirm`/`prompt`
- **Iframes**: Content inside iframes is not accessible
- **Scroll**: Use `browser_scroll` with `scrollIntoView: true` for elements in nested scroll containers

## Playwright

Uses Playwright for browser automation. Install browsers once via `browser_install` if needed.

### Key tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URL |
| `browser_snapshot` | Get page structure for interactions |
| `browser_click`, `browser_type`, `browser_fill_form` | Interact with elements |
| `browser_tabs` | List tabs |
| `browser_wait_for` | Wait for conditions |
| `browser_install` | Install browser binaries |

## Configuration

MCP servers are configured in Cursor Settings → **MCP**. The cursor-ide-browser is typically enabled by default. For Playwright, add it if you use the community MCP server.

## Use the Browser Test Command

When you want to verify frontend changes in a live browser:

1. Ensure the dev server is running (`bun run dev` in `frontend/`).
2. Use the `/browser-test` command or say: *"Run a browser test on the campaigns page"*.
3. The agent will use the browser-testing skill to navigate, interact, and verify.

See `.cursor/skills/browser-testing/SKILL.md` for the full workflow.
