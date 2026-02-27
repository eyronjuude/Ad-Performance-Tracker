# Agent Pipeline

Agents are grouped by stage in the development pipeline.

## Pipeline

```
plan → execute → check → commit
```

| Stage | Purpose | Agents |
|-------|---------|--------|
| **Plan** | Clarify scope, break down tasks, research unknowns | `plan-agent`, `researcher-agent` |
| **Execute** | Implement features (backend, frontend, or both) | `implement-agent`, `backend-agent`, `frontend-agent` |
| **Check** | Verify, test, audit, debug failures | `tester-agent`, `security-agent`, `debug-agent`, `docs-agent` |
| **Commit** | Commit and push with standards | `git-agent` |

## Commands

| Command | Stage | Agent |
|---------|-------|-------|
| `/plan` | Plan | plan-agent |
| `/implement` | Execute | implement-agent |
| `/debug` | Check | debug-agent |
| `/security-audit` | Check | security-agent |
| `/docs-audit` | Check | docs-agent |
| `/commit` | Commit | git-agent |

## Flow

1. **Plan** – Use `/plan` or plan-agent to create a structured task breakdown. Use researcher-agent for vetting libraries or unknown solutions.
2. **Execute** – Use `/implement` or implement-agent. Backend-agent and frontend-agent handle implementation per scope.
3. **Check** – Tests (tester-agent), security audit (security-agent), debug pasted errors (debug-agent), or docs audit (docs-agent).
4. **Commit** – Use `/commit` or git-agent for compliant commits and push.
