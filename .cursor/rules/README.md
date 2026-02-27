# Cursor rules

Rules are organized in subfolders and use **lowercase-with-hyphens** filenames (e.g. `co-author-model-attribution.mdc`).

## Layout

| Folder | Rules |
|--------|--------|
| **documentation/** | `sync-openapi-when-docs-updated.mdc`, `update-docs-with-codebase-changes.mdc` |
| **project/** | `co-author-model-attribution.mdc`, `ensure-conventional-commit-standards.mdc`, `ensure-env-vars-present.mdc`, `ensure-imported-modules-exist.mdc`, `ensure-linear-git-history.mdc`, `git-50-72-rule.mdc`, `prefer-established-modules.mdc`, `terminal-virtual-environment.mdc`, `third-party-services-proposal-required.mdc`, `update-api-docs-with-new-endpoints.mdc`, `use-bun-not-npm-pnpm.mdc` |
| **security/** | `no-exposed-api-urls.mdc`, `no-exposed-secrets.mdc`, `no-unsanitized-user-inputs.mdc` |
| **style/** | `gitignore-cache-and-downloads.mdc`, `strong-typing-required.mdc`, `use-official-folder-structure.mdc` |
| **testing/** | `manual-testing-scripts-cleanup.mdc`, `test-on-feature-implementation.mdc` |

Rules in subfolders are supported by Cursor per [official documentation](https://docs.cursor.com/context/rules).

## Enforcement (hooks)

Some rules are enforced by Cursor hooks. Hook scripts are grouped **by rule folder**: each script enforces all rules from one folder that apply to that event. See [.cursor/hooks/README.md](../hooks/README.md) for the event → folder → script mapping and how to add new enforced rules.
