# VETSINC Efficiency Mode SOP v1.0
## Locked in: April 17, 2026

### CORE RULES — ALWAYS ON
1. **Memory First** — Before ANY task, query the MCP Memory knowledge graph for existing context. Never re-explain infrastructure.
2. **Batch Operations** — Group related edits, API calls, and file writes. One SSH session, multiple commands chained with `&&`.
3. **5-Minute Rule** — If stuck >5 min on one approach, switch to Plan B immediately.
4. **DRY + KISS** — Don't repeat yourself. Keep it simple. Helper functions over copy-paste.
5. **Verify Once** — Run tests/checks after implementation, not during every micro-step.
6. **Context7 Before Coding** — Always check Context7 for current library docs before writing code. No hallucinated APIs.
7. **Semgrep After Build** — Run security scan after every build. Fix vulnerabilities immediately.
8. **Knowledge Sync** — After every task completion, update the knowledge graph and push to GitHub.
9. **Credit Conservation** — Minimize redundant tool calls. Read files once, grep for context, batch edits.
10. **Autonomous Delegation** — Delegate to VDS agents when possible. Keep Manus pipeline free for new work.

### MEMORY RETENTION PROTOCOL
- MCP Memory server stores entities/relations as JSON at `/opt/mcp-servers/memory-data/knowledge-graph.json`
- Goose and Claude Code load relevant entities at session start
- New knowledge auto-added during sessions via `create_entities` and `create_relations` tools
- Daily backup of knowledge graph to GitHub (opentang repo)
- Knowledge graph seeded with: VDS, VPS1, VPS2, VETS, MiningOperation, Cloudflare, APEXOverwatch, HeroBase

### CODE AUDIT SOP (ChatGPT 5.4 / Codex)
1. After every build: run `semgrep-mcp` scan on changed files
2. Weekly: full codebase audit via Codex on herobase.io, vicfoundation.com, mining dashboard
3. Findings auto-committed as GitHub issues
4. Critical vulnerabilities fixed immediately, medium within 24h, low within 1 week

### MCP SERVER INVENTORY (VDS)
| Server | Purpose | Config |
|--------|---------|--------|
| Memory | Persistent knowledge graph | Goose + Claude Code |
| GitHub | 51 repo management tools | Goose + Claude Code |
| Cloudflare | DNS, Workers, cache for 44 zones | Claude Code |
| Sequential Thinking | Structured reasoning | Goose + Claude Code |
| Qdrant | Semantic vector search (RAG) | Goose + Claude Code |
| Context7 | Live library documentation | Goose + Claude Code |
| Playwright | Headless browser automation | Goose + Claude Code |
| Semgrep | Security code scanning | Claude Code |

### SKILLS INVENTORY (Claude Code on VDS)
| Skill | Source | Purpose |
|-------|--------|---------|
| claude-api | Anthropic | Build Claude API apps |
| mcp-builder | Anthropic | Build custom MCP servers |
| webapp-testing | Anthropic | Test web applications |
| frontend-design | Anthropic | Design guidance |
| tdd | Matt Pocock | Test-driven development |
| improve-codebase-architecture | Matt Pocock | Find architectural improvements |
| git-guardrails-claude-code | Matt Pocock | Block dangerous git commands |
| triage-issue | Matt Pocock | Systematic bug investigation |
| write-a-prd | Matt Pocock | Create PRDs through interview |
