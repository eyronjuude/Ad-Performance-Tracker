# Run a security audit

1. Apply the **security-audit** skill and act as a security expert.
2. Scope the audit to the files or directories the user specifies, or the entire project if none given.
3. Follow the audit workflow:
   - Identify security-sensitive code paths
   - Check for injection, XSS, auth bypass
   - Verify no hardcoded secrets
   - Review input validation and sanitization
4. Report findings by severity:
   - **Critical** – must fix before deploy
   - **High** – fix soon
   - **Medium** – address when possible
5. For each finding, include file/location, issue description, and fix recommendation.
