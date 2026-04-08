# APEX AGENT ECOSYSTEM — MIGRATION BLUEPRINT

**Version:** 1.0
**Date:** April 5, 2026
**Purpose:** Complete reconstruction guide for any new Manus sandbox
**Classification:** CONFIDENTIAL — Do not share publicly

---

## 1. INFRASTRUCTURE OVERVIEW

### 1.1 Server Fleet

| Server | Type | IP | Specs | Role | OS |
|--------|------|-----|-------|------|-----|
| VDS M | Dedicated (Contabo) | 147.93.183.207 | 8 CPU / 32 GB RAM / 232 GB SSD | Trading Engine + Ops Dashboard | Ubuntu 24.04 |
| VPS 1 | Cloud VPS 10 (Contabo) | 62.146.175.67 | 4 CPU / 8 GB RAM / 150 GB SSD | Websites (vicfoundation) | Ubuntu 24.04 |
| VPS 2 | Cloud VPS 10 (Contabo) | 85.239.239.206 | 4 CPU / 8 GB RAM / 150 GB SSD | Websites (RegenValor, ValorPeptides) | Ubuntu 24.04 |

### 1.2 Contabo API Access

| Field | Value |
|-------|-------|
| Client ID | INT-14422637 |
| Client Secret | *(stored in cntb config — do NOT hardcode)* |
| API User | 69.humidor-subways@icloud.com |
| API Password | *(stored in cntb config — do NOT hardcode)* |
| Instance IDs | VPS1: 202941473, VPS2: 203188501, VDS: 203196947 |
| SSH Secret ID | 332356 (ed25519 key pair stored in Contabo) |

### 1.3 SSH Access

All servers use key-based SSH authentication:
- **Key location (sandbox):** `~/.ssh/contabo_vds` (private) + `~/.ssh/contabo_vds.pub`
- **Key type:** ed25519
- **Fallback password (VDS only):** The original VDS root password still works as backup
- **VPS 1 and VPS 2:** SSH key deployed via `cntb resetPassword` with secret ID 332356
- **IMPORTANT:** Password SSH is DISABLED on all servers. Key-only auth.

---

## 2. GITHUB REPOSITORIES

### 2.1 Primary Repos

| Repo | URL | Purpose |
|------|-----|---------|
| apex-agent | https://github.com/jratdish1/apex-agent | Main trading agent codebase |
| opentang | https://github.com/jratdish1/opentang | General project storage |

### 2.2 Clone Commands

```bash
gh repo clone jratdish1/apex-agent
gh repo clone jratdish1/opentang
```

### 2.3 Reference Repos (analyzed, not forked)

| Repo | What We Took |
|------|-------------|
| contabo/cntb | Official CLI — installed as binary at `~/bin/cntb` |
| Leonxlnx/claw-dev | Multi-provider LLM failover concept → `llm_router.py` |
| dair-ai/Prompt-Engineering-Guide | CoT + ReAct prompting → upgraded `alpha_pipeline.py` |
| microsoft/autogen | Multi-agent patterns (future integration) |
| langchain-ai/langchain | LLM abstractions (reference) |

---

## 3. APEX AGENT CODEBASE STRUCTURE

### 3.1 Core Modules (on VDS at `/opt/apex-agent/`)

```
apex-agent/
├── core/
│   ├── intelligence/
│   │   ├── alpha_pipeline.py      # LLM-powered market analysis (CoT + ReAct prompts)
│   │   └── llm_router.py          # 5-deep LLM failover: Anthropic→OpenAI→Grok→Gemini→Ollama
│   ├── strategies/
│   │   ├── latency_arb.py         # Binance→Polymarket latency arbitrage engine
│   │   └── wallet_intel.py        # Wallet intelligence / copy trading engine
│   ├── execution/                 # Trade execution layer
│   ├── risk/                      # Risk management
│   └── data/                      # Data feeds and aggregation
├── ops/
│   ├── dashboard.html             # Traffic light ops dashboard (HTML)
│   ├── dashboard_server.py        # Flask API server for dashboard
│   ├── server_health.py           # Green/Yellow/Red health monitor for all 3 servers
│   └── upstream_monitor.py        # 31-repo ecosystem security monitor
├── vendor/
│   └── tradememory-protocol/      # Trade memory and pattern recognition
├── .env                           # API keys (EMPTY — needs filling)
└── requirements.txt               # Python dependencies
```

### 3.2 Key Python Dependencies

```
anthropic, openai, ccxt, web3, aiohttp, fastapi, flask,
cryptography, redis, pandas, numpy, requests, websockets
```

### 3.3 LLM Router — Provider Chain

| Priority | Provider | Model | Env Var |
|----------|----------|-------|---------|
| 1 | Anthropic | claude-sonnet-4-20250514 | ANTHROPIC_API_KEY |
| 2 | OpenAI | gpt-4.1-mini | OPENAI_API_KEY |
| 3 | Grok (xAI) | grok-3-mini-fast | XAI_API_KEY |
| 4 | Gemini | gemini-2.5-flash | GOOGLE_API_KEY |
| 5 | Ollama (local) | qwen2.5:7b | N/A (localhost:11434) |

---

## 4. VDS DEPLOYMENT STATE

### 4.1 Installed Software

| Component | Version | Status |
|-----------|---------|--------|
| Docker | 29.3.1 | Installed, inactive |
| Python | 3.12.3 | Active |
| Node.js | 22.22.2 | Installed |
| Nginx | 1.24.0 | Installed, needs restart |
| Ollama | Latest | Active, qwen2.5:7b loaded |
| fail2ban | Latest | Active |
| UFW | Latest | Active (SSH only currently) |
| Certbot | Latest | Installed |

### 4.2 Systemd Services

| Service | File | Status | Notes |
|---------|------|--------|-------|
| apex-dashboard | /etc/systemd/system/apex-dashboard.service | Inactive | Needs restart after migration |
| apex-health | /etc/systemd/system/apex-health.service | Inactive | Health check timer |
| apex-agent | /etc/systemd/system/apex-agent.service | Inactive | Main trading agent — DO NOT start until API keys loaded |
| ollama | systemd | Active | Local LLM server |

### 4.3 UFW Firewall Rules (VDS)

Currently only SSH (22) is open. **Need to re-add:**
```bash
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8080/tcp  # Dashboard API
ufw allow 11434/tcp # Ollama (localhost only)
```

### 4.4 Cron Jobs (VDS)

```
0 */12 * * * cd /opt/apex-agent && python3 ops/upstream_monitor.py >> /var/log/apex-monitor.log 2>&1
*/5 * * * * cd /opt/apex-agent && python3 ops/server_health.py --check >> /var/log/apex-health.log 2>&1
```

---

## 5. VPS DEPLOYMENT STATE

### 5.1 Both VPS Units (Identical Setup)

| Component | VPS 1 (62.146.175.67) | VPS 2 (85.239.239.206) |
|-----------|----------------------|----------------------|
| UFW | Active (SSH/HTTP/HTTPS) | Active (SSH/HTTP/HTTPS) |
| fail2ban | Active | Active |
| SSH | Key-only | Key-only |
| Docker | 29.3.1 | 29.3.1 |
| Node.js | 22.22.2 | 22.22.2 |
| Python | 3.12.3 | 3.12.3 |
| Nginx | Active | Active |
| Certbot | Installed | Installed |
| Disk Used | 24% | 3% |

### 5.2 Website Assignments

| Server | Websites |
|--------|----------|
| VPS 1 | vicfoundation.com dashboard (currently on GoDaddy at 216.150.1.193) |
| VPS 2 | RegenValor.com, valorpeptides.net |
| VDS M | Trading engine ONLY — no websites |

### 5.3 Current DNS State

| Domain | Current IP | Current Host | Target |
|--------|-----------|-------------|--------|
| dashboard.vicfoundation.com | 216.150.1.193 | GoDaddy | Keep or migrate to VPS 1 |
| vicfoundation.com | 160.153.0.171 | GoDaddy/WordPress | Keep |
| regenvalor.com | 3.33.251.168 | AWS | Migrate to VPS 2 |
| valorpeptides.net | 104.18.27.246 | Cloudflare | Migrate to VPS 2 |

---

## 6. MANUS SANDBOX SKILLS

### 6.1 Custom Skills (Must Exist in New Sandbox)

| Skill | Path | Purpose |
|-------|------|---------|
| **manus-ops** | `/home/ubuntu/skills/manus-ops/` | Global ops: API keys, ecosystem monitor, best practices |
| **api-keys** | `/home/ubuntu/skills/api-keys/` | Auto-load Grok + OpenAI keys to all tasks |
| **claude-the-operation** | `/home/ubuntu/skills/claude-the-operation/` | Autonomous agent builder |

### 6.2 Built-in Skills (Auto-Available)

| Skill | Purpose |
|-------|---------|
| stock-analysis | Financial market data (Yahoo Finance API) |
| similarweb-analytics | Website traffic and domain analysis |
| meta-ads-analyzer | Meta Ads campaign diagnostics |
| excel-generator | Aesthetic, data-rich spreadsheet creation |
| video-generator | AI video production workflow |
| bgm-prompter | Music generation prompt crafting |
| skill-creator | Safe skill generation and validation |
| internet-skill-finder | Discovery tool for new Agent Skills |
| github-gem-seeker | Search for battle-tested GitHub repos |

### 6.3 Global Environment Variables

These must be set in `/etc/environment` or equivalent:
```
OPENAI_API_KEY=<from Manus secrets>
XAI_API_KEY=<from Manus secrets>
GH_TOKEN=<GitHub PAT>
GOOGLE_WORKSPACE_CLI_TOKEN=<if configured>
GOOGLE_DRIVE_TOKEN=<if configured>
```

### 6.4 Key Injection Mechanisms

The api-keys skill injects keys via multiple channels:
- System-wide: `/etc/environment`
- User profile: `~/.bashrc`, `~/.user_env`
- Python: `sitecustomize.py` auto-import
- Node.js: `NODE_OPTIONS` environment variable

### 6.5 Config Files to Export on Migration

```bash
~/.bashrc
~/.profile
~/.gitconfig
~/.user_env
/etc/environment  # scrub actual key values for transit
```

---

## 7. OPS DASHBOARD

### 7.1 Access

- **URL:** http://147.93.183.207 (via Nginx reverse proxy to port 8080)
- **API Endpoints:**
  - `/api/health` — Server status JSON
  - `/api/incidents` — Open incidents
  - `/api/reminders` — Action items
  - `/api/aar` — 7-day After Action Report
  - `/api/aar/30` — 30-day AAR

### 7.2 Pending Improvements (from this session)

- [ ] SSL certificate (needs domain pointed at VDS)
- [ ] Passkey/2FA login gate (not yet built)
- [ ] Trading agent latency indicators
- [ ] P/L chart for each agent
- [ ] Self-signed cert as interim solution

---

## 8. SCHEDULED TASKS

### 8.1 Manus Scheduled Task

| Name | Schedule | What It Does |
|------|----------|-------------|
| Apex Ops Monitor | Every 12h (6 AM / 6 PM) | Ecosystem monitor + health check + incident review |

### 8.2 VDS Cron Jobs

| Schedule | Command |
|----------|---------|
| Every 12h | `python3 ops/upstream_monitor.py` |
| Every 5min | `python3 ops/server_health.py --check` |

---

## 9. PENDING ACTION ITEMS

### 9.1 Critical (Blocks Go-Live)

| # | Item | Status |
|---|------|--------|
| 1 | Anthropic API key → VDS .env | NOT SET |
| 2 | OpenAI API key → VDS .env | NOT SET |
| 3 | xAI (Grok) API key → VDS .env | NOT SET |
| 4 | Polymarket CLOB API key → VDS .env | NOT SET |
| 5 | Binance API key/secret → VDS .env | NOT SET |
| 6 | Contabo API password may have changed — re-verify | NEEDS CHECK |

### 9.2 High Priority

| # | Item | Status |
|---|------|--------|
| 7 | SSL cert for dashboard (needs domain) | PENDING |
| 8 | Passkey/2FA login for dashboard | NOT BUILT |
| 9 | Cloudflare DDoS protection (all 3 servers + domains) | NOT SET UP |
| 10 | Migrate RegenValor.com to VPS 2 | NOT STARTED |
| 11 | Migrate valorpeptides.net to VPS 2 | NOT STARTED |
| 12 | Re-enable UFW ports on VDS (80, 443, 8080) | NEEDS FIX |
| 13 | Restart systemd services on VDS | NEEDS FIX |

### 9.3 Medium Priority

| # | Item | Status |
|---|------|--------|
| 14 | Trading agent latency indicators on dashboard | NOT BUILT |
| 15 | P/L chart on dashboard | NOT BUILT |
| 16 | Telegram bot token for alerts | NOT SET |
| 17 | Google (Gemini) API key | NOT SET |
| 18 | Kalshi API key | NOT SET |
| 19 | Paper trading mode — run 1 week / 200+ trades | NOT STARTED |

---

## 10. MIGRATION STEPS FOR NEW SANDBOX

### Step 1: Clone Repos
```bash
gh repo clone jratdish1/apex-agent
gh repo clone jratdish1/opentang
```

### Step 2: Restore SSH Key
The SSH key is stored in Contabo's secret manager (ID: 332356). To regenerate:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/contabo_vds -N ""
# Then deploy via cntb or manually copy to each server
```

### Step 3: Install cntb CLI
```bash
mkdir -p ~/bin
curl -L "https://github.com/contabo/cntb/releases/download/v1.6.0/cntb_v1.6.0_linux_amd64.tar.gz" | tar xz -C ~/bin
chmod +x ~/bin/cntb
export PATH="$HOME/bin:$PATH"
cntb config set-credentials --oauth2-clientid "INT-14422637" \
  --oauth2-clientsecret "<CLIENT_SECRET>" \
  --oauth2-user "69.humidor-subways@icloud.com" \
  --oauth2-password "<API_PASSWORD>"
```

### Step 4: Verify Server Access
```bash
ssh -i ~/.ssh/contabo_vds root@147.93.183.207 "hostname"  # VDS
ssh -i ~/.ssh/contabo_vds root@62.146.175.67 "hostname"   # VPS 1
ssh -i ~/.ssh/contabo_vds root@85.239.239.206 "hostname"   # VPS 2
```

### Step 5: Read Skills
```bash
cat /home/ubuntu/skills/manus-ops/SKILL.md
cat /home/ubuntu/skills/api-keys/SKILL.md
```

### Step 6: Verify VDS Services
```bash
ssh -i ~/.ssh/contabo_vds root@147.93.183.207 "
systemctl status apex-dashboard
systemctl status ollama
ufw status
ollama list
ls /opt/apex-agent/
"
```

### Step 7: Resume Pending Work
Refer to Section 9 (Pending Action Items) and pick up where we left off.

---

## 11. ANALYSIS FILES INDEX

These files contain research, analysis, and reports from this and previous sessions:

| File | Content |
|------|---------|
| `claude-polymarket-article.md` | Analysis of "$300 to $2.38M" Polymarket strategy article |
| `claude-rs-article.md` | Analysis of "Claude RS" wallet intelligence article |
| `claw-dev-analysis.md` | Security sweep + analysis of Claw Dev repo |
| `cntb-analysis.md` | Contabo CLI analysis |
| `repo-triage-analysis.md` | Triage of 15 GitHub repos for usefulness |
| `vds-deployment-report.md` | Full VDS deployment report |
| `manus-environment-audit.md` | Sandbox environment audit |
| `contabo-infrastructure.md` | Contabo infrastructure findings |
| `dashboard-status.md` | Dashboard deployment status |
| `polymarket-agent-blueprint.md` | Original Polymarket agent blueprint |
| `apex_agent_comprehensive_analysis.md` | Full system analysis |
| `trading-agent-assessment.md` | Trading agent capability assessment |

---

## 12. STANDARD OPERATING PROCEDURES

### 12.1 Security SOP
- **EVERY** external repo gets a full security sweep before integration
- Check for: hardcoded keys, obfuscated code, eval/exec, suspicious network calls, supply chain attacks
- Never copy code directly — steal concepts, write own implementation

### 12.2 Development SOP
- **KISS** — Keep It Simple, Stupid
- **DRY** — Don't Repeat Yourself
- **Security-first** — Firewall before features
- **Military redundancy** — Two is one, one is none
- **Paper before live** — Always test in simulation first

### 12.3 Deployment SOP
1. Commit to GitHub first
2. SCP to VDS/VPS
3. Test on server
4. Take snapshot (if available)
5. Enable service

---

## 13. QUICK REFERENCE CARD

```
VDS (Trading):  ssh -i ~/.ssh/contabo_vds root@147.93.183.207
VPS 1 (Sites):  ssh -i ~/.ssh/contabo_vds root@62.146.175.67
VPS 2 (Sites):  ssh -i ~/.ssh/contabo_vds root@85.239.239.206
Dashboard:      http://147.93.183.207
GitHub:         https://github.com/jratdish1/apex-agent
Contabo Panel:  https://my.contabo.com
Contabo API:    https://my.contabo.com/api/details
```

---

**END OF BLUEPRINT**
*"Two is one, one is none." — This document IS the redundancy.*
