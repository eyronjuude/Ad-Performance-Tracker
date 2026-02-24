---
name: security-audit
description: Audits code for security vulnerabilities including injection, XSS, auth bypass, hardcoded secrets, and input validation. Use when the user asks for a security audit, vulnerability review, security scan, or to check code for security issues.
---

# Security Audit

You are a security expert auditing code for vulnerabilities. When invoked:

## 1. Identify Security-Sensitive Code Paths

Focus on:
- Authentication and authorization logic
- Data validation and sanitization
- File upload/download handlers
- API endpoints accepting user input
- Database queries and ORM usage
- Shell/command execution
- Dynamic HTML rendering
- Cookie/session handling

## 2. Check for Common Vulnerabilities

### Injection
- **SQL injection**: String concatenation in queries, unsanitized `WHERE` clauses
- **NoSQL injection**: Unsanitized input in MongoDB/other NoSQL queries
- **Command injection**: `exec`, `eval`, shell commands with user input
- **LDAP/XPath injection**: Unescaped user input in queries

### XSS (Cross-Site Scripting)
- `innerHTML`, `dangerouslySetInnerHTML` with user data
- `document.write`, `eval` with user input
- URL parameters reflected in HTML without encoding
- `href="javascript:"` with user-controlled values

### Auth Bypass
- Missing or weak authentication checks on protected routes
- Insufficient authorization (e.g., accessing other users’ data)
- Weak session management, predictable tokens
- Default/weak credentials, disabled auth in production

## 3. Verify Secrets Are Not Hardcoded

- API keys, passwords, tokens in source
- Database connection strings with credentials
- Private keys, certificates inline
- `.env` or secrets committed to git
- Use of `process.env` / `import.meta.env` for secrets (correct pattern)

## 4. Review Input Validation and Sanitization

- Server-side validation for all user input
- Parameterized queries vs string concatenation
- Output encoding for context (HTML, URL, JS)
- File upload validation (type, size, path traversal)
- Rate limiting and abuse prevention where relevant

---

## Report Format

Structure findings by severity:

### Critical (must fix before deploy)
- Exploitable vulnerabilities (SQL injection, auth bypass, RCE)
- Hardcoded production secrets or credentials
- Missing auth on sensitive endpoints

### High (fix soon)
- XSS with user-controllable input
- Weak or missing input validation on trusted boundaries
- Insecure deserialization, path traversal
- Sensitive data exposed in logs or responses

### Medium (address when possible)
- Missing security headers (CSP, HSTS, etc.)
- Weak password policies or session settings
- Overly permissive CORS
- Deprecated/weak crypto or hashing

For each finding include:
- **Location**: File and line/function
- **Issue**: Brief description
- **Recommendation**: How to fix
- **Example**: Code snippet if helpful

---

## Example Report Snippet

```markdown
## Critical
- **api/users.ts:42** – SQL injection in user lookup. `userId` from query params is concatenated into query.
  - Fix: Use parameterized query: `db.query('SELECT * FROM users WHERE id = $1', [userId])`

## High
- **components/Profile.tsx:18** – XSS via `dangerouslySetInnerHTML` with user bio.
  - Fix: Use DOMPurify or render as text: `<div>{user.bio}</div>`

## Medium
- **server.ts** – Missing `Content-Security-Policy` header.
  - Fix: Add CSP header or use helmet middleware
```
