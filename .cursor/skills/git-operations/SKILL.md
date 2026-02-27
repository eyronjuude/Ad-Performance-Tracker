---
name: git-operations
description: Ensures linear Git history and compliant commits per project standards. Use when committing, syncing branches, rebasing, squashing, pushing, or when the user asks for help with Git, commit messages, or history cleanup.
---

Maintain linear Git history and enforce project commit standards. Align with `.cursor/commands/commit.md` and Lefthook.

## Commit Standards

| Rule | Requirement |
|------|-------------|
| **Conventional Commits** | `<type>[scope]: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Imperative mood. |
| **50/72 rule** | Subject ≤50 chars; body lines ≤72 chars. Blank line between subject and body. |
| **Co-authored-by** | Every AI contributor: `Co-authored-by: Model Name <model@example.com>`. Composer: `Co-authored-by: Composer <noreply@cursor.com>`. |

## Linear History

| Action | Strategy |
|--------|----------|
| Update from remote | `git pull --rebase` or `git fetch` + `git rebase origin/<branch>` |
| Merge upstream | Prefer `git merge --ff-only`; otherwise rebase first |
| Integrate feature | Rebase onto main, then ff-merge or squash-merge |
| Fixup | `git commit --fixup=<commit>` then `git rebase -i --autosquash` |
| Before push | Rebase onto `origin/<branch>` for fast-forward push |

## Workflow

1. **Inspect**: `git status`, `git diff`, `git diff --staged`
2. **Split**: Mutually exclusive changes → separate commits
3. **Stage**: `git add .` or `git add <paths>`
4. **Commit**: Conventional format, ≤50 chars subject, body ≤72/line, Co-authored-by footer. Run from terminal so Lefthook runs.
5. **Return**: Single-line command with `&&` for Windows Terminal.

## SSH (push/pull over SSH)

1. **Check**: `ssh-add -l` — keys loaded if exit 0
2. **If empty**: User runs `ssh-add` (or `ssh-add ~/.ssh/id_ed25519`) once; passphrase cached for session
3. **Windows agent not running**: `Start-Service ssh-agent` (admin) then `ssh-add`

Before suggesting `git push` or `git pull` over SSH: If `ssh-add -l` returns no keys, prompt user to run `ssh-add` first.

## Example Commit

```bash
git add . && git commit -m "feat(api): add user auth with OAuth2" -m "Implements JWT login and token refresh." -m "" -m "Co-authored-by: Composer <noreply@cursor.com>"
```

## Checklist

- [ ] Subject ≤50 chars, body lines ≤72 chars
- [ ] Conventional Commits (type, imperative, optional scope)
- [ ] Co-authored-by for all AI contributors
- [ ] Rebase before merge/push when possible
- [ ] Use `&&` for Windows Terminal in suggested commands
