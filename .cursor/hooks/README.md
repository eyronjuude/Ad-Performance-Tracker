# Cursor hooks

Hook scripts are **mapped by event and rule folder**: each script enforces all rules from one rule folder that apply to that lifecycle event. See `.cursor/rules/` for the rules.

## Workflow when you add a rule

- **Rule in an existing folder** (e.g. `project/`, `style/`, `security/`) → Update the **existing** hook script for that folder (and event). No new hook file; add the check and document the rule in the script and in the table below.
- **Rule in a new category** (new rule folder) → **Create a new** hook script for that (event, folder), add the check, and register it in `.cursor/hooks.json` under the right event. Add a row to the mapping table below.

## Mapping (event → rule folder → script)

| Event | Rule folder | Script | Rules enforced |
|-------|-------------|--------|----------------|
| `afterFileEdit` | **style/** | `after-file-edit-style.js` | Format/lint on edited files (Prettier frontend, Ruff backend); aligns with pre-commit. |
| `beforeReadFile` | **security/** | `before-read-file-security.js` | `no-exposed-secrets`: deny reading `.env`, `.env.local` (and similar); allow `.env.example`. |
| `beforeShellExecution` | **project/** | `before-shell-execution-project.js` | `use-bun-not-npm-pnpm`: block npm, pnpm, yarn, npx, pnpx; require bun. `terminal-virtual-environment`: ask to use venv when running pip/python/pytest/uv without venv in path. |

## Adding enforcement for a new rule

1. Identify the rule’s folder (e.g. `project/`, `security/`, `style/`) and the hook event that can enforce it (e.g. `beforeShellExecution`, `afterFileEdit`).
2. Open or create the script for that (event, folder), e.g. `before-shell-execution-security.js` for security rules that apply to shell commands.
3. Add the check in that script and document the rule name in the script’s top comment and in the table above.
4. If you create a new script, add its command to `.cursor/hooks.json` under the right event.

Pre-commit (Lefthook) still runs on `git commit` in the terminal; Cursor hooks keep edits formatted and enforce project/rule constraints as you go.
