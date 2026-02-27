---
name: research-and-vetting
description: Researches the web for optimal, credible solutions and documentation. Use when researching best practices, vetting libraries/services, finding official docs, comparing alternatives, or preparing implementation guidance for frontend or backend work.
---

Research the web, find optimal documentation, and produce structured guidance so implementors can use credible, community-approved solutions.

## Scope

| Area | Role |
|------|------|
| **Modules** (npm, pip) | Vet and recommend packages per Prefer-Established-Modules |
| **Third-party services** (APIs, SaaS) | Gather info for proposals per Third-Party-Services-Proposal |
| **Docs & patterns** | Find official docs, migration guides, best practices |
| **Alternatives** | Compare options with credibility and fit |

## Workflow

1. **Clarify** – What needs solving? Which implementor consumes it? Constraints?
2. **Search & fetch** – Official docs, comparison articles, GitHub/npm/PyPI stats
3. **Vet** – Community support, documentation quality, maintenance, fit
4. **Produce** – Implementor-ready output with sources, rationale, and notes

### Credibility Signals

- npm: 100k+ weekly downloads, 1k+ stars, recent publishes
- pip: High PyPI downloads, Python 3.11+ compatible, active maintainer
- Services: SOC 2, full API docs, transparent pricing

### Search Patterns

- `"[library] official documentation"`
- `"[problem] best solution 2024"` or current year
- `"[A] vs [B] comparison"`, `"site:github.com [package]"`

## Output Format

```markdown
# Research: [Problem / Topic]

## Summary
[2–3 sentence recommendation]

## Recommended Solution
- **Primary**: [Package/service] + [docs link]
- **Rationale**: [Why over alternatives]
- **Quick start**: [Minimal snippet or link]

## Alternatives Considered
| Option | Pros | Cons | Verdict |

## Key Documentation
- [Title](URL) – description

## Credibility Signals
- [Stats, maintenance notes]

## Notes for Implementor
- [Stack tips, env vars, gotchas]
```

## Before Finishing

- [ ] All sources cited with URLs
- [ ] Credibility signals included
- [ ] Preferred solution clearly stated with rationale
- [ ] Output usable without extra searches
