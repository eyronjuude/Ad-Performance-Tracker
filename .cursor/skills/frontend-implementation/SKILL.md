---
name: frontend-implementation
description: Implements frontend code using the project's React/Next.js tech stack. Use when building or modifying UI components, pages, styles, or frontend logic. Always checks the codebase first to align with existing patterns.
---

Implement frontend code that fits the current project. **Inspect the codebase first** to confirm tech stack, structure, and conventions.

## Before You Code

1. Read `frontend/package.json` – Framework versions and dependencies
2. Read `frontend/tsconfig.json` – Path aliases (`@/`)
3. Read `frontend/app/layout.tsx` and `globals.css` – Layout, fonts, theme
4. Scan `frontend/components/` and `frontend/lib/` – Patterns and utilities
5. Check `.cursor/rules/` – Project rules

## This Project

| Item | Value |
|------|-------|
| Framework | Next.js 16 (App Router) |
| React | 19 |
| Styling | Tailwind CSS 4 |
| Testing | Vitest, @testing-library/react |
| Path alias | `@/*` → `frontend/*` |
| Package manager | Bun |
| UI components | shadcn/ui (`components/ui/`) |

## Conventions

- **App Router**: `app/` with `page.tsx`, `layout.tsx`
- **Client components**: Add `"use client";` when using hooks, event handlers
- **Imports**: Prefer `@/components/...`, `@/lib/...`
- **Styles**: Tailwind utility classes; zinc palette, `dark:` variants
- **API calls**: Centralize in `lib/` (e.g. `lib/api.ts`, `lib/settings-api.ts`)
- **Components**: Functional with explicit TypeScript prop types
- **Form controls**: Prefer shadcn components (date picker, select, etc.) over native HTML (`<input type="date">`, `<select>`) for better UX and consistency. Add new shadcn components via `bunx shadcn@latest add <component>` when needed.

## Structure

```
frontend/
├── app/           # Pages and layouts
├── components/    # AppShell, Sidebar, SettingsProvider, components/ui (shadcn)
├── lib/           # api.ts, settings-api.ts, config.ts, utils.ts
```

## Verification

- [ ] Uses existing path aliases and imports
- [ ] Matches Tailwind usage (zinc, dark mode)
- [ ] Form controls use shadcn when available (no native `<input type="date">` etc.)
- [ ] Follows `"use client"` vs server component conventions
- [ ] Uses Bun for package commands
