#!/usr/bin/env node
/**
 * Enforces rules in .cursor/rules/security/ for beforeReadFile.
 * - no-exposed-secrets: deny reading .env and .env.local (and similar) so secrets are not sent to the LLM.
 */
// Files that may contain secrets; reading is denied. .env.example is allowed.
const SECRET_FILE_PATTERN = /(^|[\\\/])\.env($|[\\\/])|\.env\.local$|\.env\.(?!example$)\w+$/i;
const ALLOWED_EXAMPLE = /\.env\.example$/i;

function out(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function isSecretFile(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (ALLOWED_EXAMPLE.test(normalized)) return false;
  return SECRET_FILE_PATTERN.test(normalized) || /\.env$/i.test(normalized);
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

  if (payload.hook_event_name !== "beforeReadFile") {
    out({ continue: true, permission: "allow" });
    return;
  }

  const filePath = (payload.file_path || "").trim();
  if (isSecretFile(filePath)) {
    out({
      continue: false,
      permission: "deny",
      userMessage: "Reading secret-bearing files (.env, .env.local) is disabled so credentials are not sent to the model. Use .env.example for structure.",
      agentMessage: "Do not read .env or .env.local (no-exposed-secrets). Use .env.example or env var names only.",
    });
    return;
  }

  out({ continue: true, permission: "allow" });
}

main();
