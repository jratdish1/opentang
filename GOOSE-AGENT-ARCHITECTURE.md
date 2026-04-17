# Goose Agent Architecture Blueprint

**Version**: 1.0
**Date**: 2026-04-06
**Status**: APPROVED FOR DEPLOYMENT

---

## Executive Summary

This blueprint replaces Claude Code with Goose (block/goose) as the autonomous agent orchestrator across the APEX infrastructure. Goose is open-source, supports any LLM provider (including our existing Ollama installation on the VDS), and runs in headless mode for fully autonomous operation. The primary cost savings come from routing 90% of tasks through Ollama (free, local) and reserving paid APIs (Grok, OpenAI) only for complex reasoning tasks.

---

## Architecture Overview

### The Three-Tier Model

| Tier | Provider | Cost | Use Case | Model |
|------|----------|------|----------|-------|
| **Tier 1 — Local** | Ollama on VDS | FREE | Routine monitoring, health checks, log parsing, cron tasks, simple code fixes | `qwen2.5:32b` or `deepseek-coder-v2:16b` |
| **Tier 2 — Budget API** | Grok (xAI) | Low | Complex reasoning, trading decisions, multi-step analysis | `grok-3-mini` or `grok-3-fast` |
| **Tier 3 — Premium API** | OpenAI | Medium | Fallback for Tier 2 failures, critical trading decisions | `gpt-4.1-mini` |

Manus remains as the **strategic command layer** — used only for new architecture decisions, troubleshooting escalations, and tasks that require browser automation or multi-tool orchestration. This reduces Manus credit consumption by an estimated 80-90%.

### What Goose Replaces

| Current Tool | Replaced By | Reason |
|-------------|-------------|--------|
| Claude Code on VDS | Goose + Ollama | Free, same headless capability, MCP support |
| Manual cron scripts | Goose recipes (headless) | Smarter error handling, context-aware |
| Manual server checks | Goose overwatch agent | Autonomous monitoring with Telegram alerts |
| Manus for routine tasks | Goose headless tasks | Saves credits, runs 24/7 on VDS |

### What Stays the Same

| Tool | Why It Stays |
|------|-------------|
| Manus | Strategic decisions, browser automation, complex multi-tool tasks, escalation handler |
| Docker fleet (apex-alpha, apex-copy, apex-arb, apex-overwatch) | Trading agents — these are Python-based, not LLM-dependent |
| Ollama | Already installed, serves as Goose's free brain |
| Telegram bot | Alert channel — Goose will send alerts through it |
| GitHub auto-sync | Backup mechanism — Goose will trigger it |

---

## Goose Agent Profiles

### Agent 1: OVERWATCH (Server Health Monitor)

**Purpose**: Continuous monitoring of all 3 servers, services, and Docker containers.

**Schedule**: Every 5 minutes via cron

**Provider**: Ollama (Tier 1 — FREE)

**Recipe**: `overwatch.yaml`

```yaml
version: "1.0"
name: "apex-overwatch"
description: "Monitor all APEX infrastructure health"
prompt: |
  You are the APEX Overwatch agent. Check the following and report anomalies:
  
  1. Run `systemctl status apex-dashboard apex-telegram apex-health.timer nginx ollama` and verify all are active
  2. Run `docker ps --format '{{.Names}}: {{.Status}}'` and verify all containers are healthy
  3. Check disk usage with `df -h /` — alert if >80%
  4. Check memory with `free -m` — alert if available <2GB
  5. Check CPU load with `uptime` — alert if 15min avg >8.0
  6. Ping VPS1 (62.171.183.228) and VPS2 (check /etc/hosts) — alert if unreachable
  7. Check nginx error log for last 5 minutes: `tail -50 /var/log/nginx/error.log`
  
  If ANY check fails:
  - Write severity (1=critical, 2=warning, 3=info) to /opt/apex-agent/logs/overwatch-latest.json
  - Send Telegram alert using: curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d "chat_id=${TELEGRAM_CHAT_ID}" -d "text=🚨 OVERWATCH ALERT: [describe issue and severity]"
  
  If ALL checks pass:
  - Write "OK" status to /opt/apex-agent/logs/overwatch-latest.json
  - No Telegram message (silence = healthy)
  
  Always exit cleanly. Never ask questions.
extensions:
  - name: "developer"
    type: builtin
```

**Cron**: `*/5 * * * * cd /opt/apex-agent && goose run --no-session --provider ollama --model qwen2.5:32b --recipe recipes/overwatch.yaml --output-format json >> /opt/apex-agent/logs/overwatch.log 2>&1`

---

### Agent 2: MAINTAINER (Automated Maintenance)

**Purpose**: Daily maintenance tasks — log rotation, updates check, backup verification, security scan.

**Schedule**: Daily at 03:00 UTC

**Provider**: Ollama (Tier 1 — FREE)

**Recipe**: `maintainer.yaml`

```yaml
version: "1.0"
name: "apex-maintainer"
description: "Daily automated maintenance for APEX infrastructure"
prompt: |
  You are the APEX Maintainer agent. Perform daily maintenance:
  
  1. LOGS: Rotate any log files >50MB in /opt/apex-agent/logs/
  2. DOCKER: Run `docker system prune -f` to clean unused images/containers
  3. UPDATES: Run `apt list --upgradable 2>/dev/null` and log available updates (DO NOT install)
  4. BACKUPS: Verify /opt/apex-agent/scripts/env_backup.sh ran in last 24h by checking backup timestamps
  5. GITHUB: Verify git sync happened in last hour by checking `git log -1 --format=%ci`
  6. SECURITY: Check `journalctl -u ssh --since "24 hours ago" | grep "Failed password"` for brute force attempts
  7. SSL: Check certificate expiry for all domains with `echo | openssl s_client -servername DOMAIN -connect DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate`
  8. OLLAMA: Verify Ollama is responding: `curl -s http://localhost:11434/api/tags`
  
  Write a maintenance report to /opt/apex-agent/logs/maintenance-$(date +%Y%m%d).log
  
  If any CRITICAL issues found, send Telegram alert.
  Always exit cleanly. Never ask questions.
extensions:
  - name: "developer"
    type: builtin
```

**Cron**: `0 3 * * * cd /opt/apex-agent && goose run --no-session --provider ollama --model qwen2.5:32b --recipe recipes/maintainer.yaml --output-format json >> /opt/apex-agent/logs/maintainer.log 2>&1`

---

### Agent 3: DEPLOYER (Git-Triggered Deployments)

**Purpose**: When code is pushed to GitHub, pull and redeploy affected services.

**Schedule**: Every 30 minutes (checks for new commits)

**Provider**: Ollama (Tier 1 — FREE)

**Recipe**: `deployer.yaml`

```yaml
version: "1.0"
name: "apex-deployer"
description: "Auto-deploy on new GitHub commits"
prompt: |
  You are the APEX Deployer agent. Check for and apply updates:
  
  1. cd /opt/apex-agent && git fetch origin master
  2. Compare local HEAD with origin/master: `git rev-parse HEAD` vs `git rev-parse origin/master`
  3. If they differ:
     a. Pull changes: `git pull origin master`
     b. Check which files changed: `git diff --name-only HEAD~1`
     c. If docker-compose.yml changed: `docker compose build && docker compose up -d`
     d. If any .service file changed: `systemctl daemon-reload && systemctl restart [service]`
     e. If nginx config changed: `nginx -t && systemctl reload nginx`
     f. Log deployment to /opt/apex-agent/logs/deploy-$(date +%Y%m%d-%H%M).log
     g. Send Telegram notification: "✅ DEPLOYER: Pulled [N] new commits, redeployed [services]"
  4. If no changes: exit silently
  
  Always exit cleanly. Never ask questions.
extensions:
  - name: "developer"
    type: builtin
```

**Cron**: `*/30 * * * * cd /opt/apex-agent && goose run --no-session --provider ollama --model qwen2.5:32b --recipe recipes/deployer.yaml --output-format json >> /opt/apex-agent/logs/deployer.log 2>&1`

---

### Agent 4: TRADER-BRAIN (Trading Intelligence — Tier 2)

**Purpose**: Complex trading analysis, arbitrage detection, sentiment analysis. This agent feeds decisions to the Docker trading fleet.

**Schedule**: Every 15 minutes during market hours (24/7 for crypto)

**Provider**: Grok/xAI (Tier 2 — requires reasoning)

**Recipe**: `trader-brain.yaml`

```yaml
version: "1.0"
name: "apex-trader-brain"
description: "AI-powered trading intelligence for the APEX fleet"
prompt: |
  You are the APEX Trader Brain. Analyze current market conditions:
  
  1. Read the latest data from /opt/apex-agent/data/market-feed.json
  2. Analyze price action, volume, and any available on-chain data
  3. Check for arbitrage opportunities across configured exchanges
  4. Generate trading signals with confidence levels (0-100)
  5. Write signals to /opt/apex-agent/data/signals-latest.json in format:
     {"timestamp": "ISO8601", "signals": [{"pair": "ETH/USDT", "action": "BUY|SELL|HOLD", "confidence": 85, "reason": "..."}]}
  6. The Docker trading agents will read this file and execute accordingly
  
  RULES:
  - Never execute trades directly
  - Always provide reasoning
  - Flag any anomalies or potential scams
  - If confidence < 60, signal HOLD
  
  Always exit cleanly. Never ask questions.
extensions:
  - name: "developer"
    type: builtin
```

**Cron**: `*/15 * * * * cd /opt/apex-agent && goose run --no-session --provider xai --model grok-3-mini --recipe recipes/trader-brain.yaml --output-format json >> /opt/apex-agent/logs/trader-brain.log 2>&1`

---

### Agent 5: UPDATER (Weekly Software Updates)

**Purpose**: Check for Goose updates, Ollama model updates, Docker image updates, and security patches.

**Schedule**: Weekly on Sunday at 02:00 UTC

**Provider**: Ollama (Tier 1 — FREE)

**Recipe**: `updater.yaml`

```yaml
version: "1.0"
name: "apex-updater"
description: "Weekly software update check and apply"
prompt: |
  You are the APEX Updater agent. Check for and apply safe updates:
  
  1. GOOSE: Check `goose --version` against latest release at https://github.com/block/goose/releases
  2. OLLAMA: Run `ollama list` and check for model updates with `ollama pull [model]`
  3. SYSTEM: Run `apt update && apt list --upgradable` — apply SECURITY updates only with `apt upgrade -y --only-upgrade`
  4. DOCKER: Check for base image updates with `docker compose pull`
  5. NODE: Check `node --version` against LTS
  
  Write update report to /opt/apex-agent/logs/updates-$(date +%Y%m%d).log
  Send Telegram summary of what was updated.
  
  DO NOT update Goose itself without explicit approval (just report availability).
  Always exit cleanly. Never ask questions.
extensions:
  - name: "developer"
    type: builtin
```

**Cron**: `0 2 * * 0 cd /opt/apex-agent && goose run --no-session --provider ollama --model qwen2.5:32b --recipe recipes/updater.yaml --output-format json >> /opt/apex-agent/logs/updater.log 2>&1`

---

## Directory Structure on VDS

```
/opt/apex-agent/
├── .env                          # API keys, tokens, secrets
├── docker-compose.yml            # Trading fleet
├── goose-config.yaml             # Goose global config
├── recipes/
│   ├── overwatch.yaml            # Agent 1: Health monitoring
│   ├── maintainer.yaml           # Agent 2: Daily maintenance
│   ├── deployer.yaml             # Agent 3: Git-triggered deploys
│   ├── trader-brain.yaml         # Agent 4: Trading intelligence
│   └── updater.yaml              # Agent 5: Weekly updates
├── logs/
│   ├── overwatch.log
│   ├── maintainer.log
│   ├── deployer.log
│   ├── trader-brain.log
│   └── updater.log
├── data/
│   ├── market-feed.json          # Market data for trader-brain
│   └── signals-latest.json       # Trading signals output
├── scripts/
│   ├── env_backup.sh
│   ├── github_sync.sh
│   └── knowledge_export.sh
└── ops/
    └── disaster-recovery.sh      # Full DR script
```

---

## Goose Configuration

### Global Config (`/opt/apex-agent/goose-config.yaml`)

```yaml
# Goose global configuration
GOOSE_MODE: auto
GOOSE_CONTEXT_STRATEGY: summarize
GOOSE_MAX_TURNS: 50

# Default provider (free, local)
provider: ollama
model: qwen2.5:32b

# Fallback chain
fallback_providers:
  - provider: xai
    model: grok-3-mini
  - provider: openai
    model: gpt-4.1-mini
```

### Environment Variables (added to `/opt/apex-agent/.env`)

```bash
# Goose Configuration
export GOOSE_MODE=auto
export GOOSE_CONTEXT_STRATEGY=summarize
export GOOSE_MAX_TURNS=50

# Provider: Ollama (primary — FREE)
export OLLAMA_HOST=http://localhost:11434

# Provider: xAI/Grok (Tier 2)
export XAI_API_KEY=<from-vault>

# Provider: OpenAI (Tier 3 fallback)
export OPENAI_API_KEY=<from-vault>

# Telegram Alerts
export TELEGRAM_BOT_TOKEN=<from-vault>
export TELEGRAM_CHAT_ID=<from-vault>
```

---

## Manus Role (Post-Migration)

After Goose is fully operational, Manus transitions to a **strategic oversight role**:

| Manus Responsibility | Frequency | Trigger |
|---------------------|-----------|---------|
| Review Goose agent logs for anomalies | Weekly or on-demand | User request or Telegram escalation |
| Architecture changes and new agent design | As needed | User request |
| Complex troubleshooting (multi-server) | As needed | Goose escalation via Telegram |
| Browser-based tasks (web scraping, form filling) | As needed | User request |
| New blueprint creation | As needed | User request |
| Financial analysis and contract review | As needed | User request |

**Estimated credit savings**: 80-90% reduction in Manus usage once Goose handles all routine automation.

---

## Deployment Checklist

- [ ] Install Goose CLI on VDS
- [ ] Pull appropriate Ollama model (qwen2.5:32b or similar)
- [ ] Create `/opt/apex-agent/recipes/` directory
- [ ] Deploy all 5 recipe YAML files
- [ ] Configure environment variables in `.env`
- [ ] Install cron jobs for all 5 agents
- [ ] Test each agent in interactive mode first
- [ ] Switch to headless mode after verification
- [ ] Set up log rotation for Goose logs
- [ ] Verify Telegram alerts work end-to-end
- [ ] Document escalation path: Goose -> Telegram -> Manus (if needed)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Ollama model quality insufficient | Fallback to Grok (Tier 2) for complex tasks; keep Ollama for routine only |
| Goose hangs or crashes | Cron restarts on schedule; watchdog script kills stale processes |
| VDS runs out of RAM (Ollama + Docker) | Monitor with overwatch agent; 31GB RAM is generous but watch for leaks |
| API key exhaustion | Rate limiting in recipes; budget caps in xAI dashboard |
| Goose makes wrong trading decision | Trader-brain only generates SIGNALS, never executes trades directly |
| Network outage to VDS | VPS1/VPS2 can run lightweight Goose instances as failover |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-06 | Initial architecture — 5 agent profiles, 3-tier provider model |
