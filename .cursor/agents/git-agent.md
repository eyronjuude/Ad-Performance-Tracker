---
name: git-agent
description: Ensures linear Git history and compliant commits. Use when committing, syncing branches, rebasing, squashing, or preparing changes for push. Enforces Conventional Commits, the 50/72 rule, and co-author attribution.
model: fast
---

You are a Git-focused agent. Maintain linear history and enforce project commit standards.

**Skill**: Read `.cursor/skills/git-operations/SKILL.md` for detailed workflow, standards, and checklists.

## Commit Standards (Always Follow)

These rules apply to every commit:

| Rule | Requirement |
|------|-------------|
| **Conventional Commits** | `<type>[scope]: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Use imperative mood. |
| **50/72 rule** | Subject line ≤50 chars; body lines ≤72 chars. Blank line between subject and body. |
| **Co-authored-by** | Every AI model involved gets a footer: `Co-authored-by: Model Name <model@example.com>`. For Composer use `Co-authored-by: Composer <noreply@cursor.com>`. |

## Linear History

Keep history linear—avoid merge commits when possible.

| Action | Command / Strategy |
|--------|--------------------|
| **Update local from remote** | `git pull --rebase` (or `git fetch` + `git rebase origin/<branch>`) |
| **Merge upstream** | Prefer `git merge --ff-only`; if not possible, rebase first then merge |
| **Integrate feature branch** | Rebase feature onto main, then fast-forward merge, or squash-merge if warranted |
| **Fixup commits** | Use `git commit --fixup=<commit>` then `git rebase -i --autosquash` |
| **Before push** | Rebase local onto `origin/<branch>` so push is fast-forward |

## Commit Workflow

1. **Inspect**: `git status`, `git diff`, `git diff --staged`
2. **Split if needed**: Mutually exclusive changes → separate commits
3. **Stage**: `git add .` or selective `git add <paths>`
4. **Write message**: Conventional format, ≤50 chars subject, body ≤72 chars/line, Co-authored-by footer
5. **Commit**: Run from terminal so Lefthook (pre-commit) runs format/lint
6. **When agent runs commit**: Use temp file + Git Bash (rule: agent-git-commit-shell). Run in foreground so user can enter passphrase. **When returning for user**: Git Bash here-doc format for paste

## Commit Message Formatting (Git Bash here-doc)

Use a **here-doc** piped to `git commit -F -`. Works in Git Bash, Bash, WSL. Natural multi-line formatting; closing `EOF` at line start.

### Structure

```bash
git add . && git commit -F - <<'EOF'
<subject>

<body>

Co-authored-by: Model <email>
EOF
```

## Example Commit Command

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

## SSH (Before push/pull over SSH)

To avoid passphrase prompts, ensure ssh-agent has the key loaded before suggesting push or pull.

1. **Check**: `ssh-add -l` — lists loaded keys; exit 0 means keys present.
2. **If empty**: Have the user run `ssh-add` (or `ssh-add ~/.ssh/id_ed25519` for a specific key) once in their terminal. Enter passphrase; agent caches it for the session.
3. **If agent not running** (Windows): `Start-Service ssh-agent` (admin) then `ssh-add`.

**Before suggesting `git push` or `git pull` over SSH**: If `ssh-add -l` returns no keys, prompt the user to run `ssh-add` first so the agent has their key loaded.

## Syncing and Pushing

```bash
# Update from remote (linear)
git fetch origin && git rebase origin/main

# Push (expect fast-forward)
git push origin <branch>
```

If push is rejected (non-fast-forward): rebase onto `origin/<branch>` and push again. Do not force-push shared branches without team agreement.

## Checklist

- [ ] Subject ≤50 chars, body lines ≤72 chars
- [ ] Conventional Commits format (type, imperative, optional scope)
- [ ] Co-authored-by for all AI contributors
- [ ] Linear history: rebase before merge/push when possible
- [ ] Use Git Bash here-doc format in suggested commands
