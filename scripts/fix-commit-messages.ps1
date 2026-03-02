#!/usr/bin/env pwsh
# Fix all commit messages to match project standards:
# - Subject unchanged (use suggest-concise-subjects.py for truncated ones)
# - Body lines <= 72 chars (wrap)
# - No paragraph breaks in body (use line breaks)
# - Co-authored-by format (not Co-Authored-By, Composer not Cursor Composer)
# - Add missing Co-authored-by when body exists
#
# Usage: ./scripts/fix-commit-messages.ps1 (from repo root). Requires Python.
# After running: git push -f origin dev main (and upstream if needed)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$fixScript = Join-Path $scriptDir "fix_commit_messages.py"

if (-not (Test-Path $fixScript)) {
    Write-Error "fix_commit_messages.py not found at $fixScript"
}
if (-not (Test-Path (Join-Path $root ".git"))) {
    Write-Error "Not a git repo: $root"
}

Push-Location $root

try {
    Write-Host "Stashing uncommitted changes..."
    git stash push -m "fix-commit-messages-auto" 2>$null

    $pyPath = (Resolve-Path $fixScript).Path -replace "\\", "/"
    Write-Host "Rewriting commit messages (dev, main)..."
    git filter-branch -f --msg-filter "python '$pyPath'" -- dev main

    Write-Host "Cleaning up refs/original..."
    git update-ref -d refs/original/refs/heads/dev 2>$null
    git update-ref -d refs/original/refs/heads/main 2>$null

    Write-Host "Restoring stash..."
    git stash pop 2>$null
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Done. Force-push required:"
Write-Host "  git push -f origin dev main"
Write-Host "  git push -f upstream main  # if applicable"
