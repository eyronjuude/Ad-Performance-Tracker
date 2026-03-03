---
name: security-audit
description: Audits code for security vulnerabilities including injection, XSS, auth bypass, hardcoded secrets, and input validation. Use when the user asks for a security audit, vulnerability review, security scan, or to check code for security issues.
---

Audit code for vulnerabilities.

## 1. Identify Security-Sensitive Code Paths

- Auth and authorization
- Data validation and sanitization
- API endpoints accepting user input
- Database queries and ORM usage
- Shell/command execution, dynamic HTML rendering
- Cookie/session handling

## 2. Check for Common Vulnerabilities

| Type | Look for |
|------|----------|
| **Injection** | SQL/NoSQL string concat, command injection (`exec`, `subprocess` + user input) |
| **XSS** | `innerHTML`, `dangerouslySetInnerHTML` with user data, reflected params |
| **Auth bypass** | Missing auth on protected routes, weak session management |
| **Secrets** | API keys, passwords, tokens in source; verify use of env vars |

## 3. Project-Specific Targets

| Area | Paths | Focus |
|------|-------|-------|
| API | `backend/routers/*.py` | Query params, BigQuery parameterization |
| BigQuery | `backend/routers/bigquery.py` | `ScalarQueryParameter`, no string concat |
| Frontend | `frontend/lib/*.ts`, `frontend/app/**/*.tsx` | XSS, API URL from env |

## Report Format

**Critical (must fix before deploy)**: Exploitable vulnerabilities, hardcoded secrets, missing auth on sensitive endpoints

**High (fix soon)**: XSS with user input, weak validation, path traversal, sensitive data in logs

**Medium (address when possible)**: Missing CSP/HSTS, weak session settings, overly permissive CORS

For each finding: **Location** (file:line), **Issue**, **Recommendation**, **Example fix**

```markdown
- **api/users.ts:42** – SQL injection. Use parameterized query: `db.query('SELECT * FROM users WHERE id = $1', [userId])`
```
