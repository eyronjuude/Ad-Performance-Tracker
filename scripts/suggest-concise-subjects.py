#!/usr/bin/env python3
"""Identify commits with truncated subjects (...) and produce a suggestions file.
Fill in 'suggested_subject' for each, then run apply-subject-suggestions.py."""
import argparse
import json
import re
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description="Find truncated commit subjects and prepare suggestions")
    parser.add_argument("branch", nargs="?", default="dev", help="Branch to scan (default: dev)")
    parser.add_argument("-o", "--output", default="subject-suggestions.json", help="Output file")
    parser.add_argument("--body-max", type=int, default=500, help="Max body chars to include for context")
    args = parser.parse_args()

    result = subprocess.run(
        ["git", "log", f"--format=%H%x00%s%x00%b%x00---END---", args.branch],
        capture_output=True,
        text=True,
        check=True,
    )

    commits = []
    for block in result.stdout.split("---END---"):
        if not block.strip():
            continue
        parts = block.strip().split("\x00", 2)
        if len(parts) < 3:
            continue
        h, subject, body = parts[0], parts[1], parts[2]
        if "..." not in subject:
            continue
        # Body: exclude footer
        body_clean = re.sub(r"\n\n+.*Co-authored-by:.*", "", body, flags=re.DOTALL).strip()
        body_preview = body_clean[: args.body_max] + ("..." if len(body_clean) > args.body_max else "")

        # Heuristic: suggest a concise subject from body when truncated
        suggested = suggest_from_body(subject, body_clean)

        commits.append({
            "hash": h,
            "current_subject": subject,
            "body_preview": body_preview,
            "suggested_subject": suggested,
        })

    out = {"branch": args.branch, "commits": commits}
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(commits)} truncated commits to {args.output}", file=sys.stderr)
    print("Edit suggested_subject for each, then run: python scripts/apply-subject-suggestions.py", file=sys.stderr)


def suggest_from_body(subject: str, body: str) -> str:
    """Heuristic: derive a concise subject from body when original was truncated.
    No ellipsis in suggestions; aim for <=100 chars via natural shortening."""
    if not body:
        return ""
    # Preserve type(scope): from current subject
    match = re.match(r"^(\w+(?:\([^)]+\))?:\s*)", subject)
    prefix = match.group(1) if match else ""

    # First sentence of body
    first = re.split(r"[.!?\n]", body)[0].strip()
    if not first:
        return ""
    # Shorten by words if over limit (no ellipsis)
    max_desc = 100 - len(prefix)
    if len(first) > max_desc:
        words = first.split()
        first = ""
        for w in words:
            if len(first) + len(w) + 1 <= max_desc:
                first = (first + " " + w).strip()
            else:
                break
        if not first:
            first = words[0] if words else ""

    first_lower = first.lower()
    for imp in ("add ", "fix ", "remove ", "update ", "refactor ", "implement ", "allow "):
        if first_lower.startswith(imp):
            break
    else:
        if first_lower.startswith(("the ", "this ", "that ")):
            first = first[4:].strip()
        if first:
            first = first[0].lower() + first[1:]

    return prefix + first


if __name__ == "__main__":
    main()
