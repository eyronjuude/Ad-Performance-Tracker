#!/usr/bin/env node
/**
 * Enforces rules in .cursor/rules/project/ for beforeShellExecution.
 * - use-bun-not-npm-pnpm: use bun instead of other package managers (block npm, pnpm, yarn, npx, pnpx).
 */
const OTHER_PACKAGE_MANAGERS = /^\s*(npm|pnpm|yarn|npx|pnpx)(\s|$)/;

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

  out({ continue: true, permission: "allow" });
}

main();
