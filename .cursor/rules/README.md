# Cursor rules

Rules are organized in subfolders and use **lowercase-with-hyphens** filenames (e.g. `co-author-model-attribution.mdc`).

## Layout

| Folder | Rules |
|--------|--------|
| **documentation/** | `update-docs-with-codebase-changes.mdc` |
| **project/** | `co-author-model-attribution.mdc`, `ensure-conventional-commit-standards.mdc`, `ensure-env-vars-present.mdc`, `ensure-imported-modules-exist.mdc`, `prefer-established-modules.mdc`, `terminal-virtual-environment.mdc`, `third-party-services-proposal-required.mdc` |
| **security/** | `no-exposed-api-urls.mdc`, `no-exposed-secrets.mdc`, `no-unsanitized-user-inputs.mdc` |
| **style/** | `gitignore-cache-and-downloads.mdc`, `strong-typing-required.mdc`, `use-official-folder-structure.mdc` |
| **testing/** | `test-on-feature-implementation.mdc` |

## Cursor limitation

Cursor only loads `.mdc` files that are **directly in** `.cursor/rules/`, not in subfolders. Rules in the folders above are for organization; they **will not be applied** unless Cursor adds support for nested rules or you move/copy them to the root of `.cursor/rules/`.
