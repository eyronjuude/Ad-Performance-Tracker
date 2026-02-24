#!/usr/bin/env node
/**
 * Enforces rules in .cursor/rules/project/ for beforeShellExecution.
 * - use-bun-not-npm-pnpm: use bun instead of other package managers (block npm, pnpm, yarn, npx, pnpx).
 * - terminal-virtual-environment: require venv for pip/python/pytest/uv (suggest activate or use venv path).
 */
const OTHER_PACKAGE_MANAGERS = /^\s*(npm|pnpm|yarn|npx|pnpx)(\s|$)/;
const PYTHON_TOOLS = /^\s*(pip|python|pytest|uv)(\s|$)/;
const VENV_IN_PATH = /[\\\/]\.?venv[\\\/]|[\\\/]venv[\\\/]/;

function out(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) {
    out({ continue: true, permission: "allow" });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    out({ continue: true, permission: "allow" });
    return;
  }

  if (payload.hook_event_name !== "beforeShellExecution") {
    out({ continue: true, permission: "allow" });
    return;
  }

  const cmd = (payload.command || "").trim();

  // use-bun-not-npm-pnpm
  if (OTHER_PACKAGE_MANAGERS.test(cmd)) {
    out({
      continue: false,
      permission: "deny",
      userMessage: "Use bun instead of other package managers (e.g. bun install, bun run, bunx).",
      agentMessage: "Use bun instead of other package managers: bun install, bun run <script>, bunx <pkg>. Do not use npm, pnpm, yarn, npx, pnpx, or other package managers.",
    });
    return;
  }

  // terminal-virtual-environment: prompt to use venv when running Python tools without venv in path
  if (PYTHON_TOOLS.test(cmd) && !VENV_IN_PATH.test(cmd)) {
    out({
      continue: true,
      permission: "ask",
      userMessage: "Use the project's Python venv (e.g. backend\\.venv\\Scripts\\Activate.ps1 then run the command, or backend\\.venv\\Scripts\\python.exe -m pytest).",
      agentMessage: "Activate the backend venv before pip/python/pytest, or run via backend/.venv path (e.g. backend/.venv/Scripts/python.exe -m pytest). See rule: terminal-virtual-environment.",
    });
    return;
  }

  out({ continue: true, permission: "allow" });
}

main();
