#!/usr/bin/env python3
"""Apply suggested subjects from subject-suggestions.json via git filter-branch.
Run suggest-concise-subjects.py first, edit the JSON, then run this script."""
import json
import os
import re
import subprocess
import sys


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(script_dir)
    suggestions_file = os.path.join(root, "subject-suggestions.json")

    if not os.path.exists(suggestions_file):
        print(f"Error: {suggestions_file} not found. Run suggest-concise-subjects.py first.", file=sys.stderr)
        sys.exit(1)

    with open(suggestions_file, encoding="utf-8") as f:
        data = json.load(f)

    # Map full hash -> suggested subject (only non-empty)
    replace_map = {}
    for c in data.get("commits", []):
        sug = (c.get("suggested_subject") or "").strip()
        if sug:
            replace_map[c["hash"]] = sug

    if not replace_map:
        print("No suggested subjects to apply. Edit subject-suggestions.json and fill suggested_subject.", file=sys.stderr)
        sys.exit(1)

    # Write a helper script that filter-branch will run
    # It reads GIT_COMMIT from env and replaces subject when in map
    helper = os.path.join(root, "_apply_subject_filter.py")
    with open(helper, "w", encoding="utf-8") as f:
        f.write(f"""import json, os, sys
m = {json.dumps(replace_map)}
msg = sys.stdin.read()
h = os.environ.get("GIT_COMMIT", "")[:40]
if h in m:
    lines = msg.split("\\n")
    if lines:
        lines[0] = m[h]
        msg = "\\n".join(lines)
print(msg, end="")
""")

    try:
        py_path = os.path.abspath(helper).replace("\\", "/")
        branch = data.get("branch", "dev")
        branches = [branch]
        if branch == "dev":
            out = subprocess.run(
                ["git", "branch", "-a"],
                capture_output=True,
                text=True,
                cwd=root,
                check=False,
            )
            if "main" in (out.stdout or ""):
                branches.append("main")

        print(f"Applying {len(replace_map)} subject replacements to {branches}", file=sys.stderr)
        result = subprocess.run(
            ["git", "filter-branch", "-f", "--msg-filter", f"python '{py_path}'", "--"] + branches,
            cwd=root,
        )
        if result.returncode != 0:
            sys.exit(result.returncode)
        print("Done. Clean up refs: git update-ref -d refs/original/refs/heads/dev", file=sys.stderr)
    finally:
        if os.path.exists(helper):
            os.remove(helper)


if __name__ == "__main__":
    main()
