#!/usr/bin/env sh
# Pre-commit: fail if any staged file is a secret-bearing env file (.env, .env.local, .env.* except .env.example).
# Aligns with Cursor rule no-exposed-secrets and .cursor/hooks/before-read-file-security.js.
set -e
STAGED=$(git diff --cached --name-only --diff-filter=ACMR)
if [ -z "$STAGED" ]; then
  exit 0
fi
# Match paths that look like .env, .env.local, or .env.<something> (allow only .env.example)
SECRETS=$(echo "$STAGED" | grep -E '(^|/)\.env$|(^|/)\.env\.local$|(^|/)\.env\.[^/]+$' | grep -v '\.env\.example$' || true)
if [ -n "$SECRETS" ]; then
  echo "Commit rejected: do not commit secret-bearing env files. Only .env.example is allowed."
  echo "Staged secret-like file(s):"
  echo "$SECRETS"
  exit 1
fi
exit 0
