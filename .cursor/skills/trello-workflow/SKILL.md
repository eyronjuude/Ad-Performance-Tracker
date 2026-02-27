---
name: trello-workflow
description: Applies Trello workflow standards when creating cards: add priority labels, Implementation checklists for larger tasks, and auto-assign members. Use when creating Trello cards, adding tasks to Trello, or when the user asks for Trello workflow standards.
---

# Trello Workflow Standards

When creating Trello cards on the Ad Performance Tracker board, apply these steps after each card is created.

## 1. Priority Labels

Use board labels: **High Priority**, **Medium Priority**, **Low Priority**.

| Task type | Label |
|-----------|-------|
| Backend/blocking work, core new feature | High |
| Foundational settings, UI that enables other work | High |
| Follow-up UI, refactors, incremental features | Medium |
| Minor polish, documentation-only | Low |

**Tool**: `update_card_details` with `labels: ["<labelId>"]`. Get IDs via `get_board_labels`.

## 2. Checklists for Larger Tasks

Add an **Implementation** checklist for tasks with multiple sub-steps. Include concrete checklist items per card type.

| Card type | Checklist items |
|-----------|-----------------|
| Backend | Add fields to model → Create/update migration → Update API schemas and endpoints → Add tests |
| Settings (simple) | Add UI control → Wire to backend |
| Settings (complex) | Add picker/field 1 → Add picker/field 2 → Conditional enable/disable logic |
| Dashboard section | Create section → Apply filter → Include required columns |

**Tools**: `create_checklist` with `name: "Implementation"`, then `add_checklist_item` per step. Pass `cardId` and `checkListName: "Implementation"` for each item.

## 3. Auto-Assign

Assign the first board member to every new card. Use `get_board_members` to obtain member IDs, then `assign_member_to_card` with the first member's ID.

**Tool**: `assign_member_to_card` with `cardId` and `memberId` (from `get_board_members`).

## Workflow Order

1. `add_card_to_list` → create card
2. `update_card_details` → add priority label
3. `assign_member_to_card` → assign first board member
4. `create_checklist` → add Implementation checklist (for larger tasks)
5. `add_checklist_item` → add each sub-step (for larger tasks)

## Trello MCP Tools

| Tool | Purpose |
|------|---------|
| `get_board_labels` | Get label IDs for High/Medium/Low |
| `get_board_members` | Get member ID for auto-assign |
| `update_card_details` | Set labels on card |
| `assign_member_to_card` | Assign member to card |
| `create_checklist` | Create Implementation checklist |
| `add_checklist_item` | Add checklist items (pass `cardId`, `checkListName`, `text`) |

## Board Setup

If no active board is set: `list_boards` to find "Ad Performance Tracker", then `set_active_board` with its `boardId` before creating cards.
