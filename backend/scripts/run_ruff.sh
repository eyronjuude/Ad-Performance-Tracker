#!/usr/bin/env sh
# Run ruff from backend venv so pre-commit works without ruff on global PATH.
# Invoked from repo root by Lefthook. Paths below are relative to repo root.
set -e
RUFF=""
if [ -x "backend/.venv/Scripts/ruff.exe" ]; then
  RUFF="backend/.venv/Scripts/ruff.exe"
elif [ -x "backend/.venv/bin/ruff" ]; then
  RUFF="backend/.venv/bin/ruff"
else
  RUFF="ruff"
fi
exec "$RUFF" "$@"
