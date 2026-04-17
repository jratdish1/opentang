# VetsInCrypto Infrastructure Blueprint

**Author:** Manus AI | **Date:** 2026-04-09 1815 PT | **Classification:** CONFIDENTIAL — Do Not Share

---

## 1. Server Inventory

This section documents all three Contabo servers, their roles, and current operational status as confirmed at 0109 UTC on 2026-04-10.

| Property | VPS1 "473" | VPS2 "501" | VDS "APEX" |
|---|---|---|---|
| **IP Address** | 62.146.175.67 | 85.239.239.206 | 147.93.183.207 |
| **Provider** | Contabo | Contabo | Contabo |
| **VMI ID** | vmi2941473 | vmi3188501 | Instance 203196947 |
| **Role** | Web Hosting (Primary) | Web Hosting (Mirror) | Trading Bots / AI Agents |
| **OS** | Ubuntu | Ubuntu | Ubuntu |
| **RAM** | 7.8 GB (6.4 GB avail) | 7.8 GB (6.9 GB avail) | 31 GB (29 GB avail) |
| **Disk** | 145 GB (92 GB free) | 145 GB (129 GB free) | 232 GB (121 GB free) |
| **Uptime** | 2 days | 2 days | 4 days |
| **SSH User** | root | root | root |
| **SSH Password** | K7M9XsWncMcqqQdd8p | 3Kn8Gg662GLVheYFNx | 2Mj6B6Jtz8NNGH4QsN |
| **VNC Password** | N/A | N/A | 3paVP2o2 |

---

## 2. Contabo Account Access

| Property | Value |
|---|---|
| **Login Email** | 69.humidor-subways@icloud.com |
| **Login Password** | cxxKP83zpppq4Dmm |
| **Portal URL** | https://my.contabo.com |
| **API Details** | https://my.contabo.com/api/details |
| **Server Management** | https://new.contabo.com/servers/vds |
| **Customer ID** | 14422637 |
| **Order ID** | 14794632 (03.28.2026) |
| **VDS API Client ID** | INT-14422637 |
| **VDS API Client Secret** | dc8Ve2E5DIzU94cIBIBukSZ64IZbWdTK |
| **VDS API Password** | quy3TFG3kun_qph@axa (updated 4.4.26) |

---

## 3. Fail2ban Configuration (Standardized 2026-04-09)

All three servers were standardized to the same fail2ban configuration to prevent future lockouts.

| Setting | All 3 Servers |
|---|---|
| **Ban Time** | 3600 seconds (1 hour) |
| **Max Retry** | 5 attempts |
| **Find Time** | 600 seconds (10 min) |
| **Whitelisted IPs** | 62.146.175.67 (VPS1), 85.239.239.206 (VPS2), 147.93.183.207 (VDS) |

**Fallback Procedure if Locked Out:**
1. Wait 1 hour for the ban to expire (bantime=3600).
2. If urgent, log into Contabo panel (https://new.contabo.com) and use VNC console.
3. From VNC: `fail2ban-client set sshd unbanip <YOUR_IP>` to manually unban.
4. If fail2ban is completely broken: `systemctl stop fail2ban && systemctl start fail2ban` to reset all bans.
5. Nuclear option: Contabo panel has a "Restart" button for each server.

---

## 4. VPS1 Services (62.146.175.67) — Primary Web Host

VPS1 hosts the primary web applications behind Cloudflare and nginx.

| PM2 Service | Port | Status | Description |
|---|---|---|---|
| **hero-dapp** | 3001 | ONLINE | HeroBase.io DApp (React + Express) |
| **Hero-ABLE** | varies | ONLINE | HERO-ABLE PulseChain bot |
| **Hero-ABLE-Base** | varies | ONLINE | HERO-ABLE BASE chain bot |
| **hero-terminal** | varies | ONLINE | Hero Terminal (PulseChain) |
| **hero-terminal-base** | varies | ONLINE | Hero Terminal (BASE) |
| **regen-valor** | varies | ONLINE | RegenValor.com (Express) |
| **valor-peptides** | varies | ONLINE | ValorPeptides.net (Express) |

**Websites on VPS1:**

| Domain | Type | Status | Location |
|---|---|---|---|
| herobase.io | React DApp (Node.js/PM2) | HTTP 200 | /var/www/hero-dapp |
| vicfoundation.com | React Static (nginx) | HTTP 200 | /var/www/vicfoundation-react |
| regenvalor.com | Express (PM2) | HTTP 200 | /var/www/regenvalor |
| valorpeptides.net | Express (PM2) | HTTP 200 | /var/www/valorpeptides |

**WordPress Backup:** The original WordPress vicfoundation.com site is backed up at `/root/backups/vicfoundation-wp-backup-20260409/` (352 MB). Can be restored by swapping the nginx config back.

---

## 5. VPS2 Services (85.239.239.206) — Mirror Host

VPS2 serves as the mirror/redundancy host.

| PM2 Service | Status | Description |
|---|---|---|
| **regen-valor** | ONLINE | RegenValor.com mirror |
| **valor-peptides** | ONLINE | ValorPeptides.net mirror |
| **atfoam-api** | ONLINE | At-Foam.com API |

| Domain | Status |
|---|---|
| at-foam.com | HTTP 200 |
| regenvalor.com (mirror) | ONLINE |
| valorpeptides.net (mirror) | ONLINE |

---

## 6. VDS Services (147.93.183.207) — APEX Trading Server

The VDS is strictly reserved for trading bots, AI agents, and Telegram notifications. No web hosting.

**Ollama LLM Models:**

| Model | Size |
|---|---|
| llama4:scout | 67 GB |
| qwen2.5:32b | 19 GB |
| qwen2.5:7b | 4.7 GB |

**APEX Agent Knowledge (11 files in /opt/apex-agent/knowledge/):**

| File | Purpose |
|---|---|
| APEX-KNOWLEDGE-MANIFEST.md | Master deployment blueprint |
| TRADING-INTELLIGENCE-KNOWLEDGE-BASE.md | Existing trading intel |
| Anti-DriftProtocol.md | Agent drift prevention |
| trading-stack-knowledge.md | 12-repo audit with tiers |
| trading-intel-assessment.md | PreReason + Polymarket analysis |
| prereason-live-intel-20260409.md | Live BTC briefing data |
| prereason_client.py | Python integration module |
| herobase-contract-addresses.md | All LP pair addresses |
| herobase-code-changes.md | Full change manifest |
| vicfoundation-seo-intel.md | AIVI analysis + action plan |
| todo.md | Master task list |

**Trading Stack (6 repos in /opt/trading-stack/):**

| Repo | Stars | Purpose | Priority |
|---|---|---|---|
| rtk | 21K | LLM cost optimizer (Rust) | DEPLOY FIRST |
| prediction-market-backtesting | 307 | Backtest Polymarket/Kalshi | DEPLOY SECOND |
| Polymarket-Trading-Bot | 132 | 7 trading strategies | DEPLOY THIRD |
| polybot | 330 | Execution + analytics pipeline | Tier 2 |
| polyrec | 141 | Terminal dashboard, 70+ indicators | Tier 2 |
| lightweight-charts | 14K | TradingView charting lib | Reference |

---

## 7. API Keys and External Services

| Service | Key / Credential | Status |
|---|---|---|
| **PreReason API** | pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_ | NEEDS VERIFICATION |
| **Contabo API** | Client ID: INT-14422637, Secret: dc8Ve2E5DIzU94cIBIBukSZ64IZbWdTK | Active |
| **GoDaddy API** | Key: 9u2nHDEtjGY_Vq8JDWSbkNpR4vtrjkaBMH, Secret: 4ChPSiyFoKUY3KgD3rqRiX | Active |
| **WordPress App Password** | qVPa bAe9 EcW9 1BVw nPTZ nhFe | Active (vicfoundation.com) |

---

## 8. DNS and CDN Architecture

All domains route through **Cloudflare** for DDoS protection and SSL termination. DNS records are managed at **GoDaddy** with Cloudflare nameservers.

| Domain | Registrar | CDN | Origin Server |
|---|---|---|---|
| herobase.io | GoDaddy | Cloudflare | VPS1 (62.146.175.67) |
| vicfoundation.com | GoDaddy | Cloudflare | VPS1 (62.146.175.67) |
| regenvalor.com | GoDaddy | Cloudflare | VPS1 + VPS2 (mirror) |
| valorpeptides.net | GoDaddy | Cloudflare | VPS1 + VPS2 (mirror) |
| at-foam.com | GoDaddy | Cloudflare | VPS2 (85.239.239.206) |

---

## 9. Disaster Recovery Procedures

### 9.1 Complete Server Loss — VPS1

1. Spin up replacement VPS on Contabo.
2. Clone all repos from GitHub (`jratdish1/opentang`).
3. Install Node.js 22, PM2, nginx, certbot.
4. Deploy hero-dapp: `cd /root/hero-dapp && npm install && npm run build && pm2 start`.
5. Deploy vicfoundation-react: copy `/dist` to `/var/www/vicfoundation-react/`.
6. Deploy regen-valor and valor-peptides from their repos.
7. Update Cloudflare DNS A records to new IP.
8. Run certbot for SSL: `certbot --nginx -d herobase.io -d vicfoundation.com`.
9. Configure fail2ban per Section 3.

### 9.2 Complete Server Loss — VPS2

1. Spin up replacement VPS on Contabo.
2. Clone repos, install stack (same as VPS1 minus hero-dapp and vicfoundation).
3. Deploy regen-valor, valor-peptides, atfoam-api.
4. Update Cloudflare DNS.
5. Configure fail2ban per Section 3.

### 9.3 Complete Server Loss — VDS

1. Spin up replacement VDS on Contabo (minimum 32GB RAM for Ollama models).
2. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`.
3. Pull models: `ollama pull llama4:scout && ollama pull qwen2.5:32b && ollama pull qwen2.5:7b`.
4. Clone APEX agent repo and trading stack repos from GitHub.
5. Restore knowledge files from GitHub (`jratdish1/opentang/apex-knowledge-package/`).
6. Install Rust (for rtk): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`.
7. Build rtk: `cd /opt/trading-stack/rtk && cargo build --release`.
8. Install Python 3.12+ for backtesting framework.
9. Configure fail2ban per Section 3.

### 9.4 Fail2ban Lockout Recovery

1. **Wait 1 hour** (bantime=3600s).
2. **VNC Console**: Log into https://new.contabo.com, select server, click "VNC" button. Password for VDS: `3paVP2o2`.
3. **Unban specific IP**: `fail2ban-client set sshd unbanip <IP>`.
4. **Unban all**: `fail2ban-client unban --all`.
5. **Reset fail2ban**: `systemctl restart fail2ban`.

---

## 10. GitHub Backup Locations

All critical files are backed up to the private repository `jratdish1/opentang`:

| Directory/File | Contents |
|---|---|
| `vicfoundation-rebuild/` | Full VIC Foundation React source |
| `herobase-code-package/` | 4 new components + deploy README |
| `apex-knowledge-package/` | 11 knowledge files + deploy script |
| `herobase-contract-addresses.md` | All LP pair addresses |
| `herobase-code-changes.md` | Full change manifest |
| `vicfoundation-seo-intel.md` | AIVI analysis + action plan |
| `trading-stack-knowledge.md` | 12-repo audit |
| `trading-intel-assessment.md` | PreReason + Polymarket analysis |
| `todo.md` | Master task list |
| `INFRASTRUCTURE-BLUEPRINT.md` | This document |

---

## 11. Deployed Changes This Session (2026-04-09)

| Change | Server | Status |
|---|---|---|
| VIC Foundation React frontend deployed | VPS1 | LIVE (HTTP 200) |
| HeroBase.io IntroOverlay component | VPS1 | DEPLOYED (build OK) |
| HeroBase.io LanguageSelector component | VPS1 | DEPLOYED (build OK) |
| HeroBase.io LiveTicker component | VPS1 | UPLOADED (needs wiring) |
| HeroBase.io NFTCarousel component | VPS1 | UPLOADED (needs wiring) |
| Fail2ban standardized (3600s/5 retries) | ALL 3 | ACTIVE |
| Fail2ban cross-whitelist (all server IPs) | ALL 3 | ACTIVE |
| VPS2 91 banned IPs cleared | VPS2 | DONE |
| 11 knowledge files uploaded to APEX | VDS | DEPLOYED |
| 6 trading stack repos cloned | VDS | DEPLOYED |
| PreReason Python client module | VDS | DEPLOYED |

---

## 12. Pending Items (From Master Todo)

| Priority | Item | Blocking? |
|---|---|---|
| HIGH | PreReason API key verification | Yes — key returning invalid |
| HIGH | Wire LiveTicker into HeroBase.io AppLayout | No |
| HIGH | Wire NFTCarousel into HeroBase.io | No |
| HIGH | Mining dashboard clock fix (military time) | No |
| MEDIUM | Yoast LLM.txt on vicfoundation.com | No |
| MEDIUM | Multilingual dropdown on both sites | Partially done (component built) |
| MEDIUM | 100% SEO audit score for vicfoundation.com | No |
| MEDIUM | Deploy rtk binary on VDS | No |
| MEDIUM | Paper trade Polymarket strategy | No |
| LOW | Tokenomics graphic for HeroBase.io | Needs IMG_7109.png |
| LOW | Intro video for HeroBase.io overlay | Needs video file URL |

---

**END OF BLUEPRINT — Last verified: 2026-04-09 1815 PT**
