#!/usr/bin/env python3
"""Fix commit messages to match project standards: subject unchanged
(rewrite for conciseness manually if needed), body lines <=72 chars,
no paragraph breaks, correct Co-authored-by format."""
import re
import sys
import textwrap

msg = sys.stdin.read().strip().replace("\r", "")

# Subject-only or empty
if not msg:
    print(msg)
    sys.exit(0)

lines = msg.split("\n")
subject = lines[0].strip()

# Skip stash / non-conventional commits
if subject.lower().startswith(("wip on", "index on")):
    print(msg)
    sys.exit(0)

# 1. Subject: pass through unchanged (rewrite for conciseness via
#    scripts/suggest-concise-subjects.py + apply-subject-suggestions.py)

# 2. Parse body and footer
trailer_re = re.compile(
    r"^(Co-authored-by:|Co-Authored-By:|Signed-off-by:|BREAKING CHANGE:)", re.I
)
body_paras = []
footer_lines = []
rest = "\n".join(lines[1:]) if len(lines) > 1 else ""

def normalize_trailer(l: str) -> str:
    l = l.replace("Co-Authored-By:", "Co-authored-by:")
    l = l.replace("Cursor Composer <noreply@cursor.com>", "Composer <noreply@cursor.com>")
    return l

if rest:
    paragraphs = re.split(r"\n\n+", rest.strip())
    for p in paragraphs:
        p_lines = [l for l in p.split("\n") if l.strip()]
        if not p_lines:
            continue
        # Split at first trailer line
        body_part = []
        trailer_part = []
        seen_trailer = False
        for l in p_lines:
            if trailer_re.match(l):
                seen_trailer = True
                trailer_part.append(normalize_trailer(l))
            elif seen_trailer:
                trailer_part.append(normalize_trailer(l))
            else:
                body_part.append(l)
        if body_part:
            body_paras.append("\n".join(body_part))
        footer_lines.extend(trailer_part)

# 3. Wrap body lines at 72 chars
def wrap_para(para: str) -> str:
    flat = para.replace("\n", " ").strip()
    if not flat:
        return ""
    return textwrap.fill(flat, width=72)

body = "\n".join(wrap_para(p) for p in body_paras if p.strip()).strip()

# 4. Add missing Co-authored-by when body exists
if body and not footer_lines:
    footer_lines.append("Co-authored-by: Composer <noreply@cursor.com>")

# Build result
result = subject
if body:
    result += "\n\n" + body
if footer_lines:
    result += "\n\n" + "\n".join(footer_lines)

print(result)
