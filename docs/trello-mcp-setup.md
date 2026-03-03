# Trello MCP Setup

This project can use the [Trello MCP Server](https://github.com/delorenj/mcp-server-trello) to create and manage Trello cards from transcripts and feature descriptions. The **trello-agent** parses transcripts and creates cards automatically.

## 1. Get Trello Credentials

1. **API Key**: Go to [https://trello.com/app-key](https://trello.com/app-key) and copy your API key.
2. **Token**: Authorize the app using this URL (replace `YOUR_API_KEY` and `YOUR_APP_NAME`):

   ```
   https://trello.com/1/authorize?expiration=never&name=YOUR_APP_NAME&scope=read,write&response_type=token&key=YOUR_API_KEY
   ```

   Open in a browser, authorize, and copy the token.

3. **Board ID** (optional): Open your Trello board. The ID is in the URL:  
   `https://trello.com/b/XXXXXXX/board-name` → `XXXXXXX` is the board ID.

## 2. Configure Cursor MCP

Add the Trello MCP server to Cursor's MCP configuration.

**Location**: Cursor Settings → **MCP** (or edit your MCP config file).

**Config** (using Bun, per project rules):

```json
{
  "mcpServers": {
    "trello": {
      "command": "bunx",
      "args": ["@delorenj/mcp-server-trello"],
      "env": {
        "TRELLO_API_KEY": "<your-api-key>",
        "TRELLO_TOKEN": "<your-token>"
      }
    }
  }
}
```

Optional: add `TRELLO_BOARD_ID` to `env` to set a default board.

> **Security**: Do not commit real credentials. Use Cursor’s env/config UI or store in a local, gitignored file.

## 3. Verify Connection

1. Restart Cursor so it picks up the MCP config.
2. In a chat, ask: *"List my Trello boards"* or *"What lists are on my Trello board?"*
3. If the Trello MCP tools respond, the connection is working.

## 4. Use the Trello Agent

When you have a **feature transcript** (e.g. from a meeting or voice note):

1. Paste the transcript in the chat.
2. Say: *"Create Trello tasks from this transcript"* or *"Add these to Trello"*.
3. The **trello-agent** will:
   - Parse the transcript
   - Extract discrete tasks
   - Create cards in your Trello board (typically in "To Do" or first available list)

## Tools Available

All tools are invoked via `call_mcp_tool` with **server** `user-Trello`.

### Board discovery

| Tool | Purpose |
|------|---------|
| `list_workspaces` | List all workspaces the user has access to |
| `list_boards` | List all boards the user has access to |
| `list_boards_in_workspace` | List boards in a workspace (requires `workspaceId`) |
| `get_active_board_info` | Get info about the currently active board |
| `set_active_workspace` | Set active workspace (requires `workspaceId`) |
| `set_active_board` | Set active board (requires `boardId`) |

### Card workflow

| Tool | Purpose |
|------|---------|
| `get_lists` | Get lists on the board (optional `boardId`) |
| `add_card_to_list` | Create a card (`listId`, `name`, optional `description`) |
| `get_cards_by_list_id` | Fetch cards in a list |
| `get_card` | Get a single card by ID |
| `update_card_details` | Update card (name, description, labels, due date, etc.) |

### Labels, members, checklists

| Tool | Purpose |
|------|---------|
| `get_board_labels` | Get label IDs for High/Medium/Low priority |
| `get_board_members` | Get member IDs for auto-assign |
| `assign_member_to_card` | Assign member to card |
| `create_checklist` | Add checklist to card (e.g. "Implementation") |
| `add_checklist_item` | Add item to checklist (`cardId`, `checkListName`, `text`) |

### Additional tools

| Tool | Purpose |
|------|---------|
| `add_comment`, `get_card_comments`, `update_comment`, `delete_comment` | Card comments |
| `create_label`, `update_label`, `delete_label` | Label management |
| `get_acceptance_criteria`, `get_checklist_by_name`, `get_checklist_items` | Checklist / criteria |
| `get_card_history` | Card activity history |

## Board discovery flow

When `TRELLO_BOARD_ID` is not set:

1. Call `list_boards` to find your board (e.g. "Ad Performance Tracker").
2. Call `set_active_board` with the board's `boardId`.
3. Then use `get_lists`, `add_card_to_list`, etc.

Alternatively, use `list_workspaces` → `set_active_workspace` → `list_boards_in_workspace` → `set_active_board` when working within a specific workspace.

## Troubleshooting

- **"Trello MCP not found"**: Ensure MCP config is saved and Cursor was restarted.
- **Auth errors**: Regenerate the token; ensure `read,write` scope.
- **Wrong board**: Use `set_active_board` with the correct `boardId`, or set `TRELLO_BOARD_ID` in env.
