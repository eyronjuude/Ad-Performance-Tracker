# Create Trello tasks from a transcript

**Agent**: Use the **trello-agent**. Parse the user's transcript (or feature description) and create Trello cards.

1. **Parse** – Extract discrete, actionable tasks from the transcript.
2. **Fetch** – Use Trello MCP `get_lists` to find the target list (e.g. "To Do").
3. **Create** – Use `add_card_to_list` for each task with a clear title and optional description.
4. **Workflow** – Apply trello-workflow skill: add priority labels, auto-assign members, add Implementation checklists for larger tasks.

Requires Trello MCP server to be configured. See `docs/trello-mcp-setup.md` for setup.
