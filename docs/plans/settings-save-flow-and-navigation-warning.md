# Settings Save Flow & Navigation Warning — Implementation Plan

## Overview

Implement explicit save flow for Settings: show a Save button when any setting changes, require Save to persist, and warn when navigating away with unsaved changes.

## Scope

- **Frontend only** — Settings page, `SettingsProvider`, Sidebar, and navigation interception
- **Pages affected**: Settings (editable); Dashboard, Ads (navigation sources/targets)
- **Current behavior**: Settings auto-save on every change
- **Target behavior**: Manual save; Save button when dirty; navigation warning when leaving with unsaved changes

---

## Requirements (from user)

1. **Save icon/button on any change** — As soon as the user changes dates (or any setting), a Save button must appear.
2. **Navigation warning** — When attempting to leave the Settings page with unsaved changes: "Are you sure you want to leave? You will lose unsaved changes."
3. **Confirm: Yes** → Leave and discard changes.
4. **Confirm: No** → Stay on the Settings page.
5. **Save required** — Changes persist only when the user clicks Save.

---

## Current Architecture

| File | Role |
|------|------|
| `frontend/components/SettingsProvider.tsx` | Fetches settings; `setSettings` immediately calls `saveSettingsApi` (auto-save) |
| `frontend/app/settings/page.tsx` | Renders employee mapping (incl. DatePickers), spend/cROAS thresholds; no Save button; subtitle says "Changes are saved automatically" |
| `frontend/components/Sidebar.tsx` | Links to `/` (Dashboard) and `/settings`; plain `<Link>` components |
| `frontend/app/page.tsx` | Dashboard; links to `/ads` via `EmployeeTable` / `ProbationaryEmployeeTable` |
| `frontend/components/DatePicker.tsx` | Calls `onChange` on Apply; `onChange` triggers `updateEmployee` → `setSettings` |
| `frontend/components/DateRangePicker.tsx` | Used elsewhere (e.g. probationary filters); commits on Apply |

---

## Task Breakdown

### 1. SettingsProvider: dirty state and explicit save

**Location:** `frontend/components/SettingsProvider.tsx`

| Change | Description |
|--------|-------------|
| Add `committedSettings` | Store last-persisted settings (from fetch or successful save) |
| Add `isDirty` | `settings !== committedSettings` (deep compare for stability) |
| Change `setSettings` | Only update local `settings`; do **not** call `saveSettingsApi` |
| Add `save` | Call `saveSettingsApi(settings)`; on success, set `committedSettings = settings`; clear `isDirty` |
| Add `revert` | Set `settings = committedSettings` (discard unsaved changes) |
| Context API | Expose `settings`, `setSettings`, `isDirty`, `save`, `revert`, `error`, `isLoading` |

**Dependencies:** None.

---

### 2. Settings page: Save button and copy

**Location:** `frontend/app/settings/page.tsx`

| Change | Description |
|--------|-------------|
| Header subtitle | Change from "Changes are saved automatically" to text that explains manual save (e.g. "Click Save to persist changes.") |
| Save button | Render when `isDirty`; onClick calls `save()`. Use primary `Button` with save icon (e.g. lucide-react `Save`) |
| Placement | In header area, next to or below the title |

**Dependencies:** Task 1.

---

### 3. Navigation guard: intercept clicks and back button

**Location:** New hook and component; integrate into AppShell or layout

**Approach (Next.js App Router):**

- Next.js App Router has no `router.events`; must intercept:
  - `beforeunload` — browser close/refresh
  - Link clicks — capture phase on document, check if target is `<a href="...">` to a different route
  - `popstate` — browser back/forward (requires history manipulation to intercept)

**Components:**

1. **`useSettingsNavigationGuard`** — Custom hook that:
   - Accepts `isDirty: boolean`, `onConfirmLeave: () => void` (revert + allow navigation)
   - Registers `beforeunload` when `isDirty`
   - Registers document-level click (capture) when `isDirty` and pathname is `/settings`
   - On link click to different path: prevent default, show confirmation dialog; if Yes, call `onConfirmLeave` and `router.push(href)`
   - Registers `popstate` handler for back button
   - Returns cleanup

2. **Confirmation dialog** — Use shadcn `AlertDialog` for "Are you sure you want to leave? You will lose unsaved changes." with Yes/No. Prefer over native `confirm()` for consistent UX.

3. **Integration** — Run guard only when:
   - `pathname === '/settings'`
   - `isDirty === true`
   - Mount guard in a component that has access to both (e.g. a wrapper in AppShell or a Settings-specific layout)

**Dependencies:** Task 1; need to add `alert-dialog` via shadcn if not present.

---

### 4. Sidebar: pass-through or controlled links

**Option A (recommended):** Leave Sidebar as-is. The document-level click handler intercepts all `<a>` clicks when guard is active. No Sidebar changes.

**Option B:** Make Sidebar links conditional — when `isDirty` and on Settings, render `button` or `span` that opens the dialog, then navigates on confirm. Adds complexity; Option A is simpler.

**Decision:** Use Option A — global click interception.

---

### 5. Deep equality for `isDirty`

**Location:** `frontend/components/SettingsProvider.tsx` or `frontend/lib/settings.ts`

| Change | Description |
|--------|-------------|
| Compare `settings` vs `committedSettings` | Use stable deep equality (e.g. `JSON.stringify` or a small helper) to avoid false dirty when objects are recreated but equal |

**Dependencies:** Task 1.

---

## Execution Order

```
1. SettingsProvider (dirty state, save, revert)
2. Settings page (Save button, subtitle)
3. Add shadcn alert-dialog (if needed)
4. useSettingsNavigationGuard + confirmation dialog
5. Integrate guard into AppShell/layout
6. Tests
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `frontend/components/SettingsProvider.tsx` | Modify — dirty state, save, revert |
| `frontend/app/settings/page.tsx` | Modify — Save button, subtitle |
| `frontend/components/ui/alert-dialog.tsx` | Add (if missing) — `bunx shadcn add alert-dialog` |
| `frontend/hooks/useSettingsNavigationGuard.ts` | Create — navigation interception hook |
| `frontend/components/SettingsNavigationGuard.tsx` | Create (optional) — wrapper that uses the hook and mounts when on Settings |
| `frontend/components/AppShell.tsx` | Modify — mount guard when `pathname === '/settings'` and `isDirty` |
| `frontend/app/settings/__tests__/page.test.tsx` | Modify — add tests for Save button, dirty state |
| `frontend/components/__tests__/SettingsProvider.test.tsx` | Create or extend — test isDirty, save, revert |

---

## Dialog Copy

**Title:** Leave without saving?

**Description:** Are you sure you want to leave? You will lose unsaved changes.

**Buttons:**
- **No** (default) — Stay on page; close dialog
- **Yes, leave** — Revert changes, navigate away

---

## Technical Notes

### Next.js App Router

- No `router.events`; use click capture and `popstate`.
- For back button: push state and listen to `popstate`; if user confirms, allow back; otherwise `history.go(1)`.
- Reference: [usePageUnloadGuard gist](https://gist.github.com/icewind/71d31b2984948271db33784bb0df8393).

### Link interception

- Capture phase: `document.addEventListener('click', handler, { capture: true })`
- Check `target.tagName === 'A'`, `href` is different path (or same path with different query).
- Ignore modifier keys (Ctrl+click, etc.) for new tab.
- Only activate when `pathname === '/settings'` and `isDirty`.

### Ads page links

- Ads links are on Dashboard (`/`), not in Sidebar. When on Settings with unsaved changes, user can only leave via Sidebar (Dashboard) or browser back. Guard covers both.

---

## Unknowns / Decisions

1. **AlertDialog vs native confirm** — Prefer AlertDialog for styling; native `confirm` is acceptable fallback.
2. **Guard placement** — Guard can live in AppShell and conditionally run based on pathname + isDirty. Requires AppShell to be a client component with `usePathname` and `useSettings`.
3. **beforeunload message** — Browsers often show a generic message; setting `event.returnValue = ''` is enough to trigger the prompt.

---

## Checklist for Implementation

- [x] SettingsProvider: `committedSettings`, `isDirty`, `save`, `revert`
- [x] Settings page: Save button when dirty; subtitle updated
- [x] Add `alert-dialog` component
- [x] Create `useSettingsNavigationGuard` hook
- [x] Integrate guard (beforeunload, click, popstate)
- [x] Confirmation dialog with Yes/No
- [x] Unit/integration tests for dirty state, save, revert, navigation warning
- [ ] Manual test: change date → Save appears; click Dashboard → warning → Yes discards, No stays
- [ ] Manual test: change date → Save → no warning when navigating
- [x] Docs: README already describes settings; subtitle in UI explains manual save
