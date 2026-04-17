# APEX MASTER KNOWLEDGE — INFRASTRUCTURE & OPERATIONS
**Compressed**: 2026-04-10 | **Domain**: Servers, Websites, Security, Mining
**Location**: `/opt/apex-agent/knowledge/APEX-MASTER-INFRASTRUCTURE.md`

---

## 1. SERVER INVENTORY

| Server | Alias | IP | Provider | Role | Status |
|--------|-------|----|----------|------|--------|
| VPS1 | "473" | 62.146.175.67 | Contabo | Web hosting (herobase.io, vicfoundation.com, 3 more sites) | GREEN |
| VPS2 | "501" | 85.239.239.206 | Contabo | Secondary services, 3 PM2 processes | GREEN |
| VDS | "APEX" | 147.93.183.207 | Contabo | AI trading agents ONLY. Ollama, knowledge base, trading stack | GREEN |

### VDS Resources
- Ollama models: llama4:scout (67GB), qwen2.5:32b (19GB), qwen2.5:7b (4.7GB)
- Disk: 121GB free | RAM: 29GB available
- Tailscale: Installed
- Knowledge: `/opt/apex-agent/knowledge/` (18 files, 108KB)
- Trading repos: `/opt/trading-stack/` (rtk, prediction-market-backtesting, Polymarket-Trading-Bot, polybot, polyrec, lightweight-charts)

### VPS1 Services (PM2)
- herobase.io: Node.js/TypeScript on port 3001, nginx reverse proxy
- vicfoundation.com: React static build served by nginx (was WordPress, backed up to `/root/backups/` 352MB)
- regenvalor.com, valorpeptides.net, at-foam.com: Also hosted here
- 7 PM2 services total

### VPS2 Services (PM2)
- 3 PM2 services running

---

## 2. SECURITY CONFIGURATION

### Fail2ban (ALL SERVERS)
- Ban time: 3600s (1 hour) — fixed from VPS2's 86,400s (24hr!)
- Max retries: 5
- All server IPs cross-whitelisted
- 91 banned IPs cleared from VPS2

### SSH
- All 3 servers accessible, passwords in server-credentials.md
- Cross-whitelisted to prevent self-lockout

### Cloudflare
- vicfoundation.com behind Cloudflare CDN/proxy

---

## 3. WEBSITE STATUS

| Site | Stack | Status | Notes |
|------|-------|--------|-------|
| herobase.io | TypeScript/Node.js/React | LIVE (prev build) | TypeScript build error — components written as .jsx need .tsx conversion. AppLayout.tsx corrupted by awk. |
| vicfoundation.com | React + Vite + Tailwind (static) | DEPLOYED | 7 pages: Home, About, Programs, Donate, Blog, Contact, HERO Swap, 404. Navy/Olive/Gold/Crimson palette. |
| regenvalor.com | Unknown | LIVE | Needs audit |
| valorpeptides.net | Unknown | LIVE | Needs audit |
| at-foam.com | Unknown | LIVE | Needs audit |

### HeroBase.io Components (Built, Not Yet Deployed)
1. **IntroOverlay.jsx** — One-time video + beta disclaimer, cookie-based dismiss
2. **LiveTicker.jsx** — DEX Screener LP prices for PulseChain/BASE tokens
3. **LanguageSelector.jsx** — 12 languages dropdown
4. **NFTCarousel.jsx** — NFT image carousel

**Fix needed**: Rename .jsx → .tsx, add TypeScript annotations, restore AppLayout.tsx from git, rebuild.

### VIC Foundation SEO
- AIVI Score: 24/100 (target: 100)
- Only 1/5 queries found by AI
- Now React static — Yoast no longer applies, need react-helmet or similar
- Next AIVI analysis: April 16, 2026 at 0940

---

## 4. MINING OPERATIONS

### Schedule (Military Time, Pacific)
- 1700 PT: Miners OFF
- 2000 PT: Miners ON
- 0700 PT: Miners OFF
- 1000 PT: Miners ON

### Mining Dutch Login
- URL: mining-dutch.nl
- Login: radii.dyes-04@icloud.com
- Password: KCH.phz7qmx0ztj2mpg
- Pool adjustment: Worker tab → Custom miner configuration

### Mining Dashboard (VETS Console)
- Deployed at: vetsmining-xieyk2a8.manus.space
- Features: Real-time pool rankings, miner health traffic lights, solo coin recommendations, schedule display, autonomous switching controls
- Clock: Pacific Time via Intl.DateTimeFormat, 24hr military format
- Full Autonomy Checklist: 14/14 items complete

### Watchdog Protocol
- Check every 60 minutes when offline outside schedule
- Snooze button: every 6 hours
- Offline alerts: initial after 5 minutes, then every 12 hours
- Always stay on solo mining
- Auto-switch to most profitable pool when current drops >2%

---

## 5. ANTI-DRIFT PROTOCOL

1. Re-read skills/anti-drift.md before every session
2. Fresh session context every 3 actions
3. If tool call fails → STOP and report (no blind retry)
4. Log every action: SUCCESS or FAILED
5. Never claim complete unless tool output confirms it
6. DRY + KISS principles always
7. Safety first on bash commands
8. Verify changes by running tests

---

## 6. BACKUP & RECOVERY

### GitHub
- Repo: `jratdish1/opentang` (private)
- Contains: All knowledge files, infrastructure blueprint, trading docs

### VDS Knowledge
- Path: `/opt/apex-agent/knowledge/`
- 18 files, 108KB total

### WordPress Backup
- Location: VPS1 `/root/backups/` (352MB)
- Contains: Full WordPress/PHP/MySQL backup of vicfoundation.com (pre-React rebuild)

### Disaster Recovery
- Full blueprint at `/opt/apex-agent/knowledge/INFRASTRUCTURE-BLUEPRINT.md`
- Also on GitHub and in sandbox
