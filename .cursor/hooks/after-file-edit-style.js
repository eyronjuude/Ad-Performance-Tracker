#!/usr/bin/env node
/**
 * Enforces rules in .cursor/rules/style/ for afterFileEdit.
 * Format/lint on edited files (Prettier for frontend, Ruff for backend) — aligns with pre-commit.
 * Paths in payload are relative to workspace_roots[0].
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FRONTEND_GLOB = /^frontend\/.+\.(ts|tsx|js|jsx|mjs|json|css|md)$/i;
const BACKEND_PY = /^backend\/.+\\.py$/i;

function resolveRuffBin(projectRoot) {
  const win = path.join(projectRoot, "backend", ".venv", "Scripts", "ruff.exe");
  const unix = path.join(projectRoot, "backend", ".venv", "bin", "ruff");
  if (fs.existsSync(win)) return win;
  if (fs.existsSync(unix)) return unix;
  return "ruff";
}

function run(cwd, cmd, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, env, stdio: "inherit", shell: false });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    proc.on("error", reject);
  });
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) process.exit(0);

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  if (payload.hook_event_name !== "afterFileEdit") process.exit(0);

  const filePath = payload.file_path;
  const roots = payload.workspace_roots || [];
  const projectRoot = roots[0] ? path.resolve(roots[0]) : process.cwd();
  const normalized = path.isAbsolute(filePath)
    ? path.relative(projectRoot, filePath).replace(/\\/g, "/")
    : filePath.replace(/\\/g, "/");

  if (FRONTEND_GLOB.test(normalized)) {
    const frontendDir = path.join(projectRoot, "frontend");
    const relToFrontend = path.relative(frontendDir, path.join(projectRoot, normalized));
    try {
      await run(frontendDir, "bunx", ["prettier", "--write", relToFrontend]);
    } catch {
      try {
        await run(frontendDir, "npx", ["prettier", "--write", relToFrontend]);
      } catch {
        // Prettier not available or failed; don't fail the hook
      }
    }
    return;
  }

  if (BACKEND_PY.test(normalized)) {
    const absPath = path.join(projectRoot, normalized);
    const ruff = resolveRuffBin(projectRoot);
    try {
      await run(projectRoot, ruff, ["format", absPath]);
      await run(projectRoot, ruff, ["check", "--fix", absPath]);
    } catch {
      // Ruff not available or failed; don't fail the hook
    }
  }
}

main().then(
  () => process.exit(0),
  () => process.exit(0)
);
