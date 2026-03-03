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
5. **Return**: Git Bash here-doc command with `&&`. User pastes as-is.

## Commit Message Formatting (Git Bash here-doc)

Use a **here-doc** piped to `git commit -F -`. Works in Git Bash, Bash, WSL. No escape sequences; natural multi-line formatting. The closing `EOF` must be at the start of its line.

### Structure

```bash
git add . && git commit -F - <<'EOF'
<subject>

<body line 1>
<body line 2>

Co-authored-by: Model <email>
EOF
```

## SSH (push/pull over SSH)

1. **Check**: `ssh-add -l` — keys loaded if exit 0
2. **If empty**: User runs `ssh-add` (or `ssh-add ~/.ssh/id_ed25519`) once; passphrase cached for session
3. **Windows agent not running**: `Start-Service ssh-agent` (admin) then `ssh-add`

Before suggesting `git push` or `git pull` over SSH: If `ssh-add -l` returns no keys, prompt user to run `ssh-add` first.

## Example Commit

```bash
git add . && git commit -F - <<'EOF'
feat(api): add user auth with OAuth2

Implements JWT login and token refresh.

Co-authored-by: Composer <noreply@cursor.com>
EOF
```

Multi-line body:

```bash
git add . && git commit -F - <<'EOF'
feat(api): add user auth

Add JWT login.
Add token refresh.
Add session management.

Co-authored-by: Composer <noreply@cursor.com>
EOF
```

## Checklist

- [ ] Subject ≤50 chars, body lines ≤72 chars
- [ ] Conventional Commits (type, imperative, optional scope)
- [ ] Co-authored-by for all AI contributors
- [ ] Rebase before merge/push when possible
- [ ] Use Git Bash here-doc format; `&&` to chain
