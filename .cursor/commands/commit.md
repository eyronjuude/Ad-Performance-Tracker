# Create a `git` commit with used model(s) as Co-Author(s)

1. Look at the staged and unstaged changes with `git diff`.
2. Stage the changes to commit with `git add .`.
3. Obtain staged changes with `git diff --staged`.
4. Obtain the context of the changes, then verify to the prompter the implied context of the staged changes.
5. Write a clear commit message based on what changed, strictly following the CONVENTIONAL COMMITS standards. Reference: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
6. Verify that the commit author in the logs (`git log`) matches the user's configured Git identity for this repository.
7. Return everything as a single-line command to be run by the user in the terminal.
