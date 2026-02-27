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
7. Verify that the commit author in the logs (`git log`) matches the user's configured Git identity for this repository.
8. Return everything as a single-line command to be run by the user in the terminal. Use `&&` to chain commands so they work in Windows Terminal.
9. **Before push** (if applicable): Rebase onto `origin/<branch>` for linear history. If pushing over SSH, ensure ssh-agent has the key (`ssh-add -l`); if empty, prompt the user to run `ssh-add` first.
10. **If the commit (or push) fails**: Always debug the failure—read the full error output, identify the cause (hooks, message format, auth, conflicts, etc.), fix it where possible, and retry. If blocked (e.g. user credentials or branch protection), report clearly what failed and what the user must do.
