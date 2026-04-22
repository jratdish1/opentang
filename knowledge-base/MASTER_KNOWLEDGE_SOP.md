# VETS IN CRYPTO — Master Knowledge Base, SOPs & Procedures
## GitHub is the MASTER FALLBACK for all knowledge, procedures, and SOPs
**Last Updated:** 2026-04-22
**Owner:** VETS (Marine Corps Veteran, Crypto Founder)
**Rule:** When Manus knowledge base is full or unavailable, GitHub is the single source of truth.

---

## 1. CRITICAL DIRECTIVE
> **GitHub (opentang repo) is the permanent master fallback for ALL knowledge, procedures, SOPs, API keys, blueprints, and architectural docs.** Manus knowledge base has reached capacity. All new knowledge MUST be committed to GitHub. Always check GitHub FIRST before asking the user.

---

## 2. SERVER ARCHITECTURE

| Server | IP | Role | SSH Access |
|--------|-----|------|------------|
| **VDS (Main Hub)** | 147.93.183.207 | Trading bots, Goose agents, Ollama, Telegram alerts | Direct SSH from sandbox |
| **VPS1** | 62.146.175.67 | herobase.io, ABLE bots, backups | Via VDS jump: `ssh -J root@147.93.183.207 root@62.146.175.67` |
| **VPS2** | 85.239.239.206 | at-foam.com, regen-valor, valor-peptides, backups | Via VDS jump: `ssh -J root@147.93.183.207 root@85.239.239.206` |
| **VPS3** | (Tailscale: vps3) | Primary ABLE bots, trade logging, backups | Via VDS: `ssh vps3` |
| **Hetzner EU** | (Tailscale: polymarket-eu) | Polymarket bot (geo-unblocked) | Via VDS: `ssh polymarket-eu` |

### SSH SOP
- **Always go through VDS as jump host** — all servers hardened, keys pre-configured
- VDS has Tailscale aliases: `vps1`, `vps2`, `vps3`, `polymarket-eu`
- Direct IP works for VPS1 and VPS2 via `-J root@147.93.183.207`
- If SSH rate-limits, wait 5-10 seconds and retry

---

## 3. ENV ARCHITECTURE
All API keys stored in `/root/.env_architecture` on every server.
```
source /root/.env_architecture
```
### Key Management SOP
1. Test key against API endpoint before deploying
2. Update `/root/.env_architecture` on VDS
3. Sync to VPS1 + VPS2 + VPS3 + Hetzner via SSH
4. Push to GitHub (apex-agent repo, REDACTED version)
5. Restart dependent services (`pm2 restart all`)

### Active API Keys (as of 2026-04-22)
- **XAI/Grok:** Stored in env_architecture (verified, all servers)
- **CoinGecko:** `CG-qQ3qyf6KWjvRgjEkjcfwJsfS` (locked in all 5 servers 2026-04-22)
- **Telegram Bot:** `8755508099:AAFDeEvGIZU-EsBWJk7r3j_2gIeYvmJ1YJc` / Chat: `1760124019`
- **Kalshi:** `507376f7-a2ac-458c-a1e5-c092f7253bf2`
- **Kraken:** Stored in env_architecture
- **Cloudflare:** Stored in env_architecture (API calls MUST go through VDS — IP restricted)
- **GitHub PAT:** Stored on VDS, repo scope
- **Prereason:** `pr_live_U5Fij3o6O3Sq3pMag3gUVpAc5RuFZDuW`
- **GoDaddy:** Key `9u2nHDEtjGY_Vq8JDWSbkNpR4vtrjkaBMH` / Secret `4ChPSiyFoKUY3KgD3rqRiX`
- **Contabo:** Client ID `INT-14422637`

---

## 4. TRADING BOT FLEET

### Bot Inventory (April 2026)

| Server | Bot | Purpose | Config Location |
|--------|-----|---------|-----------------|
| VDS | kraken-bot-v2 | Grid trading ETH/SOL/BTC | PM2 on VDS |
| VDS | kalshi-bot-v4 | Spread arb on Kalshi | PM2 on VDS |
| VDS | hero-vets-pulse | PulseChain HERO/VETS volume | PM2 on VDS |
| VDS | base-hero-vol | BASE chain HERO volume | PM2 on VDS |
| VDS | cross-chain-monitor | PulseChain vs BASE price tracking | PM2 on VDS |
| Hetzner | polymarket-bot | Black-Scholes Polymarket (40 positions) | PM2 on Hetzner EU |
| VPS1 | hero-dapp | herobase.io website | PM2 on VPS1 |
| VPS1/VPS3 | Hero-ABLE bots | ABLE trading bots | PM2 |
| VPS2 | atfoam-api | AT Foam chatbot (Grok AI) | PM2 on VPS2 |

### Trading Bot SOPs
1. **Before live deployment:** 24h paper trading minimum
2. **All bots MUST have:** Autonomous restart code, PM2 watchdog, Telegram alerts
3. **Daily report:** `daily_trading_report.py` runs every 4h via cron, sends 🟢🟡🔴 traffic light summary to Telegram
4. **P&L tracking:** `hero_farm_pnl.py` (23:00 UTC), `daily_arb_summary.py` (23:00 UTC)
5. **Bot doctor:** `trading_bot_doctor.py` runs every 4h for self-healing
6. **Safety mechanisms:** 15% stop-loss, daily spend caps, kill switches

### Diversification Strategy
- **Polymarket:** Sports (MLB/NBA/NFL), Geopolitics (0% taker fee), Crypto, Politics
- **Kalshi:** Financial markets, economic events, weather, policy (NO sports)
- **Kraken:** Grid trading major pairs (ETH, SOL, BTC)
- **PulseChain/BASE:** HERO/VETS volume and arbitrage

---

## 5. WEBSITE INVENTORY

| Domain | Server | Stack | Notes |
|--------|--------|-------|-------|
| herobase.io | VPS1 | React/Manus app | Source at `/root/hero-dapp/` on VPS1 |
| at-foam.com | VPS2 (Cloudflare proxy) | Express + Grok AI chatbot | DNS: A→85.239.239.206, www CNAME→at-foam.com |
| regenvalor.com | VPS2 | React app | PM2: regen-valor |
| valor-peptides | VPS2 | React app | PM2: valor-peptides |
| vicfoundation.com | VPS1 | WordPress (GoDaddy origin) | Behind Cloudflare |

### Cloudflare SOP
- **API calls MUST go through VDS** — key is IP-restricted to VDS
- Browser login blocked by Turnstile CAPTCHA (can't automate)
- Back door: `ssh root@147.93.183.207` → run `curl` with Cloudflare API
- Email: `sharer.buns-0f@icloud.com`

---

## 6. CRON JOBS (VDS)

| Schedule | Script | Purpose |
|----------|--------|---------|
| Every 4h | daily_trading_report.py | Unified P&L report to Telegram |
| Every 4h | trading_bot_doctor.py | Self-healing health check |
| 23:00 UTC | hero_farm_pnl.py | PulseChain farm P&L |
| 23:00 UTC | daily_arb_summary.py | Arb P&L summary |
| Every 30m | auto_redeem_unified.py | Polymarket auto-redeem |
| 04:00 UTC | bot_restart_scheduler.sh | Scheduled bot restarts |
| 06:00 UTC | daily_fleet_and_prices.sh | Fleet status + prices |
| Weekly Sun | audit_runner.sh | Code security audit |
| Weekly Sun | knowledge_export.sh | Knowledge base export |
| Monthly 1st | monthly_security_audit.sh | Full security audit |

---

## 7. OPERATIONAL PRINCIPLES

### Core Rules
1. **KISS & DRY** — Keep it simple, don't repeat yourself
2. **Two is one, one is none** — Always maintain redundancy
3. **Fix critical issues autonomously** — Don't wait for approval
4. **All servers must be green** — Auto-fix anything that isn't
5. **Never post API keys in chat** — Secure storage only
6. **Paid APIs first** — Grok, Claude, OpenAI over free alternatives
7. **GitHub is the master fallback** — When KB is full, commit to GitHub

### Task Execution SOP
1. Check todo.md first
2. If blocked on one item, move to the next
3. If a task takes >5 minutes without progress, switch to Plan B
4. Always make one retry before moving on
5. After completing a task, fall back to todo.md
6. Lock in all new knowledge to GitHub after each session

### Telegram Notifications
- Daily P&L summary: ON (every 4h)
- Individual trade alerts: OFF by default (toggle available)
- Critical alerts (crashes, safety triggers): ALWAYS ON

---

## 8. TOKENS & WALLETS

### HERO Token
- **PulseChain:** `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27`
- **BASE:** Listed on Aerodrome + Uniswap V2
- **Founder:** VETS (user)

### VETS Token
- **PulseChain:** Active, traded via PulseX V2

---

## 9. PENDING ITEMS (see todo.md for full list)

### Priority 1 — Trading
- [ ] Fix USDC.e auto-refill (Uniswap V3 SwapRouter02 + 5% slippage)
- [ ] Send USDC.e via Kraken API (Polygon) to Polymarket wallet
- [ ] Set up P&L tracking for BASE HABFF bots

### Priority 2 — HABFF
- [ ] Build HABFF contract for BASE chain
- [ ] Deploy from VDS wallet
- [ ] Get contract fee-exempted

### Priority 3 — herobase.io Fixes
- [ ] Re-label "DApp Farm" → "Boot Camp"
- [ ] Add TRU Farm section
- [ ] Add EMIT Farm on mobile
- [ ] Remove "Made with Manus" from all sites
- [ ] Fix Switch Aggregator widget
- [ ] Fix mobile text overlap on live feed
- [ ] Fix bouncing logo video

### Priority 4 — VicFoundation
- [ ] Update VETS logo to actual VETS IN CRYPTO logo

---

## 10. GITHUB REPOS

| Repo | Visibility | Purpose |
|------|-----------|---------|
| jratdish1/opentang | Private | Master knowledge base, SOPs, blueprints |
| herobase.io | Public (open source) | herobase.io website source |

### GitHub Push SOP
```bash
# From VDS:
source /root/.env_architecture
cd /opt/apex-agent/knowledge
git add -A && git commit -m "Knowledge update $(date +%Y-%m-%d)" && git push
```

---

*This document is the permanent master reference. When in doubt, check here first.*
*GitHub repo: https://github.com/jratdish1/opentang*
