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

| Tool | Purpose |
|------|---------|
| `get_lists` | Get lists on the board |
| `add_card_to_list` | Create a card |
| `get_cards_by_list_id` | Fetch cards in a list |
| `list_boards` | List workspaces/boards |
| `set_active_board` | Switch active board |

## Troubleshooting

- **"Trello MCP not found"**: Ensure MCP config is saved and Cursor was restarted.
- **Auth errors**: Regenerate the token; ensure `read,write` scope.
- **Wrong board**: Use `set_active_board` with the correct `boardId`, or set `TRELLO_BOARD_ID` in env.
