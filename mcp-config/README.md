# MCP Config (secrets redacted)

## Goose Extensions
- memory (stdio, npx @modelcontextprotocol/server-memory)
- github (stdio, npx @modelcontextprotocol/server-github)
- sequential-thinking (stdio, npx @modelcontextprotocol/server-sequential-thinking)

## Claude Code MCP Servers
- memory (MEMORY_FILE_PATH=/opt/mcp-servers/memory-data/knowledge-graph.json)
- github (uses GITHUB_PERSONAL_ACCESS_TOKEN env var)
- sequential-thinking

## Environment Variables Required
- MEMORY_FILE_PATH
- GITHUB_PERSONAL_ACCESS_TOKEN
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_EMAIL
