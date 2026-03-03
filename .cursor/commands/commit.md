# Create a `git` commit with used model(s) as Co-Author(s)

**Agent/Skill**: Use the **git-agent** or read `.cursor/skills/git-operations/SKILL.md` for full workflow.

**Hooks**: Pre-commit (Lefthook) runs format/lint when you run `git commit` in the terminal. Cursor hooks (`.cursor/hooks.json`) run the same checks after AI file edits. Commit from the terminal so Lefthook runs.

1. Look at the staged and unstaged changes with `git diff`.
2. Stage the changes to commit with `git add .`.
3. Obtain staged changes with `git diff --staged`.
4. Obtain the context of the changes, then verify to the prompter the implied context of the staged changes.
5. If some changes are mutually exclusive based on the changes, divide them into separate commits.
6. Write a clear commit message:
   - **Conventional Commits**: `<type>[scope]: <description>`. Reference: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
   - **50/72 rule**: Subject ≤50 chars; body lines ≤72 chars.
   - **Co-authored-by**: Add `Co-authored-by: Model Name <model@example.com>` in the footer for every AI model involved. For Composer: `Co-authored-by: Composer <noreply@cursor.com>`.
   - **Here-doc (Git Bash)**: Use `git commit -F - <<'EOF'` with the message, then `EOF`. Works in Git Bash, Bash, WSL. Closing `EOF` at line start.
7. Verify that the commit author in the logs (`git log`) matches the user's configured Git identity for this repository.
8. Return the commit command to be run in Git Bash. Use here-doc format so the user can paste as-is.
