# Commit Message Fix Scripts

Fix commit messages that violate project standards (body lines >72 chars, paragraph breaks, Co-authored-by format) and repair truncated subjects.

## Workflow

### 1. Fix body/format (no subject changes)

```powershell
./scripts/fix-commit-messages.ps1
```

Rewrites all commits on `dev` and `main`: wraps body at 72 chars, collapses paragraph breaks, fixes Co-authored-by format. **Subjects are left unchanged.**

### 2. Repair truncated subjects (from prior ellipsis rewrites)

```powershell
# Generate suggestions for commits with "..." in subject
python scripts/suggest-concise-subjects.py dev

# Edit subject-suggestions.json - review and adjust suggested_subject for each commit
# (Or leave heuristic suggestions as-is if they look good)

# Apply the suggestions
python scripts/apply-subject-suggestions.py
```

### 3. Force-push after any history rewrite

```powershell
git push -f origin dev main
git push -f upstream main   # if applicable
```

## Files

| Script | Purpose |
|--------|---------|
| `fix_commit_messages.py` | Body wrapping, Co-authored-by, paragraph collapse (used by fix-commit-messages.ps1) |
| `fix-commit-messages.ps1` | Full history rewrite for body/format |
| `suggest-concise-subjects.py` | Find truncated subjects, output heuristic suggestions to `subject-suggestions.json` |
| `apply-subject-suggestions.py` | Apply edited suggestions via filter-branch |

`subject-suggestions.json` is gitignored (working file).
