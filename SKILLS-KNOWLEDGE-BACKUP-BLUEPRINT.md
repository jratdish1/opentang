# SKILLS & KNOWLEDGE BACKUP BLUEPRINT

**Version:** 1.0
**Created:** April 6, 2026
**Classification:** CONFIDENTIAL
**Purpose:** Ensure all institutional knowledge, skills, configs, and agent intelligence can survive catastrophic failure and be restored to any fresh environment within 30 minutes.

---

## 1. WHAT NEEDS TO BE BACKED UP

The Apex Agent ecosystem has **five categories** of knowledge that must be preserved. Losing any one of these means rebuilding from scratch — and that costs time, credits, and sanity.

### Category A: Agent Intelligence (The Brain)

These files define how the agents think, trade, and make decisions. Without them, you have servers but no intelligence.

| File | Location | What It Does | Backup Priority |
|------|----------|-------------|-----------------|
| `CLAUDE.md` | `/opt/apex-agent/CLAUDE.md` | Agent identity, safety rules, strategy playbook, coding standards | CRITICAL |
| `.claude/settings.json` | `/opt/apex-agent/.claude/settings.json` | Claude Code permissions (allow/deny), auto-mode config | CRITICAL |
| `.env` | `/opt/apex-agent/.env` | All API keys, wallet addresses, strategy parameters, safety limits | CRITICAL |
| `.env.example` | `/opt/apex-agent/.env.example` | Template showing every variable needed (safe to commit) | HIGH |

### Category B: Trading Strategies (The Playbook)

| Directory | Location | What It Contains | Backup Priority |
|-----------|----------|-----------------|-----------------|
| `core/` | `/opt/apex-agent/core/` | All Python trading engines: alpha, copy, arb, execution, memory, safety | CRITICAL |
| `core/strategies/` | `/opt/apex-agent/core/strategies/` | Latency arb, wallet intel, regime detection | CRITICAL |
| `core/intelligence/` | `/opt/apex-agent/core/intelligence/` | LLM router, alpha pipeline, position sizer | CRITICAL |
| `core/execution/` | `/opt/apex-agent/core/execution/` | Paper trader, alpha/arb/copy/kalshi executors | CRITICAL |
| `core/alerts/` | `/opt/apex-agent/core/alerts/` | Telegram bot integration | HIGH |
| `core/scanner/` | `/opt/apex-agent/core/scanner/` | Global arb scanner, Kalshi API | HIGH |
| `core/feeds/` | `/opt/apex-agent/core/feeds/` | WebSocket market data feeds | HIGH |
| `core/backtest/` | `/opt/apex-agent/core/backtest/` | Backtesting engine | MEDIUM |

### Category C: Operational Infrastructure (The Skeleton)

| File/Directory | Location | What It Does | Backup Priority |
|----------------|----------|-------------|-----------------|
| `ops/docker-compose.yml` | `/opt/apex-agent/ops/` | 4-agent Docker fleet (alpha, copy, arb, overwatch) + Redis | CRITICAL |
| `ops/docker-compose.fleet.yml` | `/opt/apex-agent/ops/` | 6-agent military redundancy fleet | CRITICAL |
| `ops/Dockerfile` | `/opt/apex-agent/ops/` | Multi-stage Python 3.11-slim container build | CRITICAL |
| `ops/disaster-recovery.sh` | `/opt/apex-agent/ops/` | Full 3-server rebuild script (VDS + VPS 1 + VPS 2) | CRITICAL |
| `ops/deploy.sh` | `/opt/apex-agent/ops/` | Original VDS deployment script (12 steps) | HIGH |
| `ops/dashboard_server.py` | `/opt/apex-agent/ops/` | Flask dashboard on port 8080 | HIGH |
| `ops/dashboard.html` | `/opt/apex-agent/ops/` | Dashboard frontend | HIGH |
| `ops/server_health.py` | `/opt/apex-agent/ops/` | Health check system | HIGH |
| `ops/watchdog.py` | `/opt/apex-agent/ops/` | Agent watchdog (restart on failure) | HIGH |
| `ops/fleet_commander.py` | `/opt/apex-agent/ops/` | Multi-agent fleet orchestration | HIGH |
| `ops/upstream_monitor.py` | `/opt/apex-agent/ops/` | 30-repo upstream change detection | MEDIUM |
| `ops/auto_evolve.py` | `/opt/apex-agent/ops/` | Self-improvement pipeline | MEDIUM |
| `ops/manus_checkin.py` | `/opt/apex-agent/ops/` | Manus sandbox bridge | MEDIUM |
| `ops/maintenance_agent.sh` | `/opt/apex-agent/ops/` | Automated maintenance tasks | MEDIUM |
| `ops/entrypoint.sh` | `/opt/apex-agent/ops/` | Docker container entrypoint | HIGH |
| `ops/apex-watchdog.service` | `/opt/apex-agent/ops/` | Systemd service template | HIGH |

### Category D: Vendor Dependencies (The Foundation)

These are upstream repos that our code depends on. They live in `vendor/` and should NEVER be modified directly.

| Vendor Repo | Purpose | Recovery Method |
|-------------|---------|-----------------|
| `vendor/polymarket-terminal/` | Trade execution engine (JavaScript) | `git clone` from GitHub |
| `vendor/polymarket-alpha-bot/` | LLM alpha detection pipeline | `git clone` from GitHub |
| `vendor/polymarket-agents/` | Reference agent implementations | `git clone` from GitHub |
| `vendor/polymarket-ws-client/` | WebSocket market data client | `git clone` from GitHub |
| `vendor/tradememory-protocol/` | Decision audit trail system | `git clone` from GitHub |
| `vendor/cloddsbot/` | Odds calculation engine | `git clone` from GitHub |

### Category E: Manus Ecosystem Knowledge (The Memory)

This is the institutional knowledge that lives across Manus tasks, sandbox skills, and conversation history.

| Knowledge Type | Where It Lives | Backup Method |
|---------------|----------------|---------------|
| Master To-Do List | `MASTER-TODO-LIST.md` in GitHub | Auto-synced via git push |
| Migration Blueprints | `docs/migration/` in GitHub | Already archived |
| Cross-Reference Analyses | `docs/migration/` in GitHub | Already archived |
| VDS Audit Findings | `vds-audit-findings.md` in GitHub | Already archived |
| Manus Task Knowledge | Manus knowledge base (auto-persisted) | Exported to CLAUDE.md |
| Sandbox Skills | `/home/ubuntu/skills/` in Manus sandbox | Export to GitHub (see below) |
| Conversation Context | Manus conversation history | Cannot be exported — document key decisions in blueprints |

---

## 2. BACKUP STRATEGY: THE 3-2-1 RULE

> **3 copies, 2 different media, 1 offsite.**

| Copy | Location | Type | Auto-Sync |
|------|----------|------|-----------|
| Primary | VDS `/opt/apex-agent/` | Live server | N/A (this IS the live copy) |
| Secondary | GitHub `jratdish1/apex-agent` | Cloud repo (private) | Every 30 min via `github_sync.sh` cron |
| Tertiary | GitHub `jratdish1/opentang` | Cloud repo (private) | Manual sync (consolidation pending) |
| Emergency | Manus sandbox `/home/ubuntu/` | Ephemeral (survives hibernation) | Manual push per session |

### What GitHub Gets (Safe to Commit)

Everything EXCEPT:
- `.env` (contains API keys and wallet private keys)
- `data/` (market data, analysis outputs)
- `logs/` (trade logs, audit trails)
- Any file containing private keys, tokens, or passwords

### What GitHub Does NOT Get (Must Be Restored Manually)

| Secret | Where to Get It | Notes |
|--------|----------------|-------|
| `POLYGON_WALLET_PRIVATE_KEY` | VETS wallet | NEVER store in git |
| `POLYMARKET_API_KEY` | polymarket.com account | Regenerate if lost |
| `OPENAI_API_KEY` | platform.openai.com | Regenerate if lost |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Regenerate if lost |
| `XAI_API_KEY` | console.x.ai | Regenerate if lost |
| `CLOUDFLARE_EMAIL` | dash.cloudflare.com | `sharer.buns-0f@icloud.com` |
| `CLOUDFLARE_PASSWORD` | dash.cloudflare.com | `y7Duy7neewsPpGuw84nu!` |
| `CF_GLOBAL_API_KEY` | dash.cloudflare.com → My Profile → API Tokens | `[REDACTED - stored in env_architecture]` — **ALWAYS USE X-Auth-Key method, never browser** |
| `CF_ACCOUNT_ID` | Cloudflare account | `f5ee65549b211b028fbd1c015c1afdcd` |
| `CF_ZONE_ATFOAM` | at-foam.com | `a6610eaa479fb6a777531b038c1bdac9` |
| `CF_ZONE_REGENVALOR` | regenvalor.com | `48f687b11d680cfd743b82cde3f13447` |
| `CF_ZONE_VALORPEPTIDES` | valorpeptides.net | `604e9afd5ab8c283870277703ca5255e` |
| `CF_ZONE_VICFOUNDATION` | vicfoundation.com | `0d6e678ffe584b470437ab7bb0199e13` |
| `CF_ZONE_HEROBASE` | herobase.io | `1f894ca8151cd3419688c8a87ce9f5e3` |
| `CF_ZONE_HERO501C3_IO` | hero501c3.io | `da8e1815926122d909fe1e7ce1b85ae3` |
| `CF_ZONE_HERO501C3_ORG` | hero501c3.org | `0b00ff8e64a91ff196371a5a85d0264e` |
| `CF_ZONE_BASESONIC` | basesonic.io | `ebb7f51c560e990c96c0deedba8b123d` |
| `CF_ZONE_CRYPTOKINGQUEEN` | cryptokingqueen.com | `596de82bf69abc89da9b83778e73d6c0` |
| `CF_ZONE_CRYPTOQUEENS` | cryptoqueens.io | `33ea99f05bdb94f31235ad2c2f9e26ce` |
| `CF_ZONE_KINGPOOIE` | kingpooie.com | `19efcfaaf723473d1b5a27a9b51895ea` |
| `CF_ZONE_KINGQUEENPOOIE` | kingqueenpooie.com | `78016e2d8e449bf00d193177f321aff5` |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram | `8755508099:AAGEM_j9l6SjYrK5BLsjBGvxr5Riy3lLDCY` (current) |
| `TELEGRAM_CHAT_ID` | @userinfobot on Telegram | `1760124019` (current) |
| `BINANCE_API_KEY` | binance.com | VETS to generate |
| `BINANCE_API_SECRET` | binance.com | VETS to generate |
| SSH private key | `/root/.ssh/contabo-vds-key` | Must be regenerated and distributed |
| SSL certificates | Let's Encrypt (auto-renew) | `certbot` will regenerate |

---

## 3. AUTOMATED BACKUP SCRIPTS

### Script 1: GitHub Auto-Sync (Every 30 Minutes)

This should be installed as a cron job on the VDS.

```bash
# /opt/apex-agent/scripts/github_sync.sh
#!/bin/bash
# Auto-sync apex-agent to GitHub every 30 minutes
# Cron: */30 * * * * /opt/apex-agent/scripts/github_sync.sh >> /var/log/apex-github-sync.log 2>&1

set -euo pipefail
REPO_DIR="/opt/apex-agent"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cd "$REPO_DIR"

# Ensure .env is in .gitignore
grep -q "^\.env$" .gitignore 2>/dev/null || echo ".env" >> .gitignore

# Stage all changes (respecting .gitignore)
git add -A

# Only commit if there are changes
if ! git diff --cached --quiet; then
    git commit -m "auto-sync: ${TIMESTAMP}"
    git push origin master 2>/dev/null || {
        echo "[${TIMESTAMP}] WARN: Push failed — will retry next cycle"
        exit 0
    }
    echo "[${TIMESTAMP}] Synced to GitHub"
else
    echo "[${TIMESTAMP}] No changes to sync"
fi
```

### Script 2: Knowledge Export to Ollama (Weekly)

Exports all agent knowledge into a format the local Ollama desktop can ingest.

```bash
# /opt/apex-agent/scripts/knowledge_export.sh
#!/bin/bash
# Export all knowledge for local Ollama consumption
# Cron: 0 3 * * 0 /opt/apex-agent/scripts/knowledge_export.sh

set -euo pipefail
EXPORT_DIR="/opt/apex-agent/data/knowledge-export"
TIMESTAMP=$(date '+%Y%m%d')

mkdir -p "$EXPORT_DIR"

# Concatenate all knowledge into a single context file
cat > "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md" << 'HEADER'
# Apex Agent Knowledge Base Export
# Generated automatically — DO NOT EDIT
# Import this into Ollama as system context
HEADER

# Append CLAUDE.md (agent identity)
echo -e "\n---\n## AGENT IDENTITY AND RULES\n" >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
cat /opt/apex-agent/CLAUDE.md >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"

# Append strategy documentation
echo -e "\n---\n## MASTER TO-DO LIST\n" >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
cat /opt/apex-agent/MASTER-TODO-LIST.md >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"

# Append migration blueprints
echo -e "\n---\n## MIGRATION BLUEPRINTS\n" >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
for f in /opt/apex-agent/docs/migration/*.md; do
    [ -f "$f" ] && cat "$f" >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
done

# Append .env.example (safe — no secrets)
echo -e "\n---\n## ENVIRONMENT TEMPLATE\n" >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
cat /opt/apex-agent/.env.example >> "$EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"

echo "[$(date)] Knowledge export complete: $EXPORT_DIR/apex-knowledge-${TIMESTAMP}.md"
```

### Script 3: Encrypted .env Backup (Daily)

Backs up the .env file with encryption so it can be stored safely.

```bash
# /opt/apex-agent/scripts/env_backup.sh
#!/bin/bash
# Encrypted backup of .env file
# Cron: 0 2 * * * /opt/apex-agent/scripts/env_backup.sh

set -euo pipefail
ENV_FILE="/opt/apex-agent/.env"
BACKUP_DIR="/opt/apex-agent/data/env-backups"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

mkdir -p "$BACKUP_DIR"

if [ -f "$ENV_FILE" ]; then
    # Encrypt with AES-256 using a passphrase
    # VETS: Set BACKUP_PASSPHRASE in root's .bashrc (NOT in .env)
    if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
        openssl enc -aes-256-cbc -salt -pbkdf2 \
            -in "$ENV_FILE" \
            -out "$BACKUP_DIR/env-${TIMESTAMP}.enc" \
            -pass env:BACKUP_PASSPHRASE
        echo "[$(date)] Encrypted .env backup: env-${TIMESTAMP}.enc"
        
        # Keep only last 30 days of backups
        find "$BACKUP_DIR" -name "env-*.enc" -mtime +30 -delete
    else
        echo "[$(date)] WARN: BACKUP_PASSPHRASE not set — skipping encrypted backup"
    fi
fi
```

---

## 4. FULL RECOVERY PROCEDURE

In the event of catastrophic failure, here is the exact sequence to get back online:

### Phase 1: Fresh Server (5 minutes)

```bash
# 1. Order new Contabo VDS/VPS from my.contabo.com
# 2. SSH in as root
# 3. Download and run the disaster recovery script:
curl -sL https://raw.githubusercontent.com/jratdish1/apex-agent/master/ops/disaster-recovery.sh -o /tmp/dr.sh
chmod +x /tmp/dr.sh
bash /tmp/dr.sh --role vds --pat YOUR_GITHUB_PAT --yes
```

### Phase 2: Restore Secrets (5 minutes)

```bash
# 1. Copy .env.example to .env
cp /opt/apex-agent/.env.example /opt/apex-agent/.env

# 2. Fill in all API keys (from your password manager or accounts):
nano /opt/apex-agent/.env
# - POLYGON_WALLET_PRIVATE_KEY
# - POLYMARKET_API_KEY
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - XAI_API_KEY
# - TELEGRAM_BOT_TOKEN (8755508099:AAGEM_j9l6SjYrK5BLsjBGvxr5Riy3lLDCY)
# - TELEGRAM_CHAT_ID (1760124019)
# - BINANCE_API_KEY + BINANCE_API_SECRET

# 3. Set backup passphrase
echo 'export BACKUP_PASSPHRASE="your-strong-passphrase"' >> ~/.bashrc
source ~/.bashrc
```

### Phase 3: Start Services (5 minutes)

```bash
# 1. Start Docker fleet
cd /opt/apex-agent && docker compose -f ops/docker-compose.yml up -d

# 2. Verify all systemd services
systemctl start apex-dashboard apex-telegram
systemctl enable apex-health.timer && systemctl start apex-health.timer

# 3. Verify Ollama
ollama list  # Should show qwen2.5:7b
ollama run qwen2.5:7b "Say hello"

# 4. Install cron jobs
crontab -l  # Verify crons were installed by DR script
```

### Phase 4: Verify Everything (5 minutes)

```bash
# 1. Check all services
systemctl status apex-dashboard apex-telegram apex-health.timer nginx ollama docker

# 2. Check Docker containers
docker ps

# 3. Check dashboard
curl -s http://localhost:8080/health | jq .

# 4. Send test Telegram alert
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=DR RECOVERY COMPLETE — All systems operational"

# 5. Run paper trading test
cd /opt/apex-agent && python3 core/main.py --mode paper --cycles 5
```

### Phase 5: Restore VPS Units (10 minutes)

```bash
# From VDS, rebuild both VPS units:
bash /opt/apex-agent/ops/disaster-recovery.sh --role all --pat YOUR_GITHUB_PAT --yes
```

---

## 5. MANUS SKILLS INVENTORY

These are the skills installed in the Manus sandbox that should be periodically exported to the VDS.

| Skill | Path | Purpose | Export to VDS? |
|-------|------|---------|---------------|
| `stock-analysis` | `/home/ubuntu/skills/stock-analysis/` | Financial market data analysis | YES — for trading decisions |
| `excel-generator` | `/home/ubuntu/skills/excel-generator/` | Spreadsheet creation | NO — Manus-only |
| `video-generator` | `/home/ubuntu/skills/video-generator/` | AI video production | NO — Manus-only |
| `meta-ads-analyzer` | `/home/ubuntu/skills/meta-ads-analyzer/` | Meta Ads campaign analysis | NO — Manus-only |
| `similarweb-analytics` | `/home/ubuntu/skills/similarweb-analytics/` | Website traffic analysis | NO — Manus-only |
| `bgm-prompter` | `/home/ubuntu/skills/bgm-prompter/` | Music generation prompts | NO — Manus-only |
| `skill-creator` | `/home/ubuntu/skills/skill-creator/` | Skill creation guide | YES — for VDS skill development |
| `api-keys` | `/home/ubuntu/skills/api-keys/` | API key auto-loading | YES — adapt for VDS |
| `manus-ops` | `/home/ubuntu/skills/manus-ops/` | Global operations skill | YES — adapt for VDS |
| `github-gem-seeker` | `/home/ubuntu/skills/github-gem-seeker/` | GitHub solution finder | YES — for VDS development |
| `claude-the-operation` | `/home/ubuntu/skills/claude-the-operation/` | Claude Code autonomous agents | YES — already on VDS |

---

## 6. KNOWLEDGE CONTINUITY CHECKLIST

Run this checklist monthly to ensure nothing has drifted:

- [ ] GitHub repo `jratdish1/apex-agent` has latest code from VDS
- [ ] GitHub repo `jratdish1/opentang` is synced (if still in use)
- [ ] `MASTER-TODO-LIST.md` reflects current state
- [ ] `CLAUDE.md` reflects current agent capabilities
- [ ] `.env.example` lists ALL required environment variables
- [ ] DR script `disaster-recovery.sh` has been tested (dry run)
- [ ] Encrypted `.env` backup exists and is less than 7 days old
- [ ] Ollama knowledge export exists and is less than 7 days old
- [ ] All API keys are valid (test each one)
- [ ] SSH keys work for VDS → VPS 1 and VDS → VPS 2
- [ ] Telegram bot responds to `/status` command
- [ ] Docker images build successfully from Dockerfile
- [ ] Manus sandbox has latest files from GitHub

---

## 7. EMERGENCY CONTACTS & ACCESS

| Resource | Access Method | Notes |
|----------|-------------|-------|
| Contabo Control Panel | my.contabo.com | Server management, reinstall OS |
| GitHub | github.com/jratdish1 | Code repos (apex-agent, opentang) |
| Cloudflare | cloudflare.com | DNS, DDoS protection (when configured) |
| Telegram Bot | @Vetsincrypto_bot | Alert channel |
| Manus | manus.im | AI assistant, task automation |
| VDS SSH | `ssh root@66.94.127.90` (or 147.93.183.207) | Primary trading server |
| VPS 1 SSH | `ssh root@62.146.175.67` | Website server 1 |
| VPS 2 SSH | `ssh root@85.239.239.206` | Website server 2 |

---

**Bottom line:** If everything burns down tomorrow, this blueprint plus the DR script plus the GitHub repo gets you back to operational in under 30 minutes. The only things you cannot recover automatically are API keys — keep those in a password manager (Bitwarden, 1Password, or even a physical notebook in a safe).

**"Two is one, one is none."** — Every Marine knows this. Your backups have backups.
