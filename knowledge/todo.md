# VETS Operations — Master Todo List
**Updated**: 2026-04-10 0200 PT | **Format**: Military Time Always

---

## COMPLETED

- [x] Mining Dashboard clock fix: Intl.DateTimeFormat America/Los_Angeles, 24hr military time
- [x] Mining Dashboard schedule times in military format (1700, 2000, 0700, 1000)
- [x] Mining Dashboard Full Autonomy Checklist (14 items all checked)
- [x] VIC Foundation — Full React + Vite + Tailwind rebuild (7 pages), deployed to VPS1
- [x] HeroBase.io — 4 components built (IntroOverlay, LiveTicker, LanguageSelector, NFTCarousel)
- [x] Server access restored — all 3 servers GREEN (fail2ban cleared)
- [x] Fail2ban fixed — VPS2 reduced to 3600s, 91 IPs cleared, cross-whitelisted
- [x] APEX VDS knowledge deployed — 11 files + 6 trading repos
- [x] Infrastructure Blueprint — created, pushed to GitHub + VDS
- [x] Trading stack research — 12 repos audited, OpenClaw debunked
- [x] SEO intel — AIVI analysis saved, 7-point action plan documented
- [x] Ares.pro wallet verified — $0 PNL, EMPTY, marketing funnel confirmed
- [x] 24 copy-trade strategy framework documented
- [x] APEX knowledge compressed — 3 master docs (Trading, Infrastructure, WebDev)
- [x] @MisterNoComents X post analyzed — confirmed marketing funnel, zero alpha
- [x] Bot deployment plan created — 3-phase approach documented
- [x] Fix BASE chain getMarketOverview bug (deployed to VPS1)
- [x] Upload intro video to VPS1 (52MB)
- [x] Upload 175 photos to VPS1 media-gallery
- [x] MARPAT camo theme injected on vicfoundation.com via Cloudflare Worker
- [x] SquirrelSwap widget fixed on herobase.io/swap (Cloudflare CSP rule)
- [x] at-foam.com email verified and test sent to jake@at-foam.com
- [x] Beaver Builder Starter license purchased ($89/yr)
- [x] VIC Foundation design brief completed
- [x] DEX Screener contract addresses compiled for all LP tickers
- [x] herobase.io code changes document prepped

---

## IN PROGRESS / BLOCKED

| # | Task | Status | Blocker |
|---|------|--------|---------|
| 1 | HeroBase.io TypeScript build error | BLOCKED | Need VPS1 access to restore AppLayout.tsx from git, convert .jsx→.tsx |
| 2 | PreReason API key | BLOCKED | Key `pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_` still invalid — user needs to check dashboard |
| 3 | GitHub auth expired | BLOCKED | Token invalid — user needs to generate new PAT with repo scope |
| 4 | Grok (xAI) API key | BLOCKED | Key format wrong (starts with aYbX, should start with xai-). Need valid key. |

---

## HIGH PRIORITY

### HEROBASE.IO
- [ ] **Fix TypeScript build**: Restore AppLayout.tsx from git on VPS1, rename .jsx→.tsx, add type annotations, rebuild, restart PM2
- [ ] **Language Dropdown**: Multilingual selector (EN/ES/FR/DE/JA/KO/ZH/AR/PT/RU minimum), works with chain toggle (PLS/BASE)
- [ ] **LiveTicker deployment**: PulseChain (EMIT, RHINO, TruFarm) + BASE (HERO, WETH, BRETT, AERO, jesse) LP prices
- [ ] **Intro video overlay**: Homepage modal, cookie-based, one-time → skip → beta disclaimer → accept → enter site (needs video URL)
- [ ] **Purge Cloudflare cache** after all changes

### VICFOUNDATION.COM — SEO
- [ ] **React-helmet + meta tags**: OG tags, Twitter cards, canonical URLs (Yoast no longer applies — site is React static now)
- [ ] **Structured data**: JSON-LD schemas (Organization, NonProfit, Article, FAQ) for all pages
- [ ] **Sitemap & robots.txt**: Generate XML sitemap, configure robots.txt
- [ ] **Content for 4 unfound AIVI queries**: decentralized fundraising, purpose-driven tokens, fiat fundraising, community-driven tokens
- [ ] **Core Web Vitals**: Optimize LCP, FID, CLS
- [ ] **Language Dropdown**: Same multilingual selector as herobase.io
- [ ] AIVI Analysis scheduled for April 16 at 0940

### TRADING / APEX VDS
- [ ] **Deploy RTK on VDS**: Install Rust 1.93.1+, build RTK binary for LLM token cost reduction (60-90%)
- [ ] **Deploy polymarket-paper-trader**: Install Python 3.12, configure $10K paper trading sim
- [ ] **Start 7-day paper trading validation**: After RTK + paper trader deployed
- [ ] **Obtain FRED API key**: User signup at research.stlouisfed.org (free)
- [ ] **PreReason MCP server**: Install `npx -y @prereason/mcp` on VDS once API key works

---

## MEDIUM PRIORITY

### HEROBASE.IO
- [ ] NFT Carousels: Wire Military Rank + First Responder collections, pause on hover (needs image URLs)
- [ ] Tokenomics: Replace rotating circle with IMG_7109.png (needs file location)
- [ ] Community Hub: Add https://double.trudefi.io/ link with TruFarm logo
- [ ] Media Hub: Upload provided photos into appropriate categories
- [ ] Dashboard chain toggle: ALL stats/tokens/prices switch natively per chain (PLS/BASE)

### VICFOUNDATION.COM
- [ ] Blog content targeting 4 unfound AIVI queries
- [ ] Backend: CMS, blog, donation flows, email drip, AI chatbot (Grok)
- [ ] Integrate NOWPayments crypto donation widget
- [ ] Security hardening (WAF, CSP, CORS, rate limiting, 2FA admin)
- [ ] Admin dashboard behind Cloudflare with 2FA

### INFRASTRUCTURE
- [ ] Watchdog monitoring script on VDS (60-min health checks, Telegram alerts)
- [ ] Telegram bot for alerts (mining, server status, trade P&L)
- [ ] Verify mining scheduled tasks are firing per dashboard config
- [ ] Fix Stripe checkout.regenvalor.com DNS error

### OTHER SITES
- [ ] Audit regenvalor.com (full site audit)
- [ ] Audit valorpeptides.net (full site audit)
- [ ] Audit at-foam.com (full site audit, mobile-first priority)

---

## LOW PRIORITY / FUTURE

- [ ] Phase 2: Single live Polymarket bot (after 7-day paper trade validation)
- [ ] Phase 3: Scaled bot fleet — 4 bots across US Politics, Crypto, Geopolitical, Sports
- [ ] Polybot full stack (Kafka/ClickHouse/Grafana) — Phase 3 infrastructure
- [ ] NautilusTrader backtesting framework (Python 3.12+ and Rust required)
- [ ] TradingAgents multi-agent LLM framework (research-grade, evaluate after Phase 2)
- [ ] PreReason subscription decision (evaluate after 1 week of trial data)
- [ ] Email campaign automation (weekly drips, abandoned cart reminders)
- [ ] LLM-wiki integration (github.com/Ss1024sS/LLM-wiki across all systems)
- [ ] DarkWire Intel (paywalled, revisit when Polymarket bot profitable)
- [ ] Deployer addresses / private keys — clarify with user

---

## USER ACTION ITEMS (Waiting on VETS)

| # | Action | Priority | Notes |
|---|--------|----------|-------|
| A1 | Fix PreReason API key | HIGH | Log into prereason.com dashboard, copy exact key |
| A2 | Generate new GitHub PAT | HIGH | Settings → Developer Settings → PAT → repo scope |
| A3 | Fix Grok (xAI) API key | HIGH | Current key invalid. Get new key from console.x.ai |
| A4 | Sign up for FRED API key | MEDIUM | Free at research.stlouisfed.org |
| A5 | Provide herobase.io video URL | MEDIUM | For IntroOverlay component |
| A6 | Provide NFT image URLs | MEDIUM | For NFTCarousel component |
| A7 | Locate IMG_7109.png | MEDIUM | For tokenomics graphic |
| A8 | Confirm herobase.io app directory path | LOW | Is it /var/www/hero-dapp/ ? |
| A9 | Confirm HERO/VETS contract addresses | LOW | For LiveTicker component |

---

## KNOWLEDGE BASE STATUS

### VDS APEX (`/opt/apex-agent/knowledge/`) — 21 files

| File | Type | Domain |
|------|------|--------|
| APEX-MASTER-TRADING.md | COMPRESSED | Trading intelligence master doc |
| APEX-MASTER-INFRASTRUCTURE.md | COMPRESSED | Infrastructure & ops master doc |
| APEX-MASTER-WEBDEV.md | COMPRESSED | Web dev & SEO master doc |
| APEX-BOT-DEPLOYMENT-PLAN.md | NEW | 3-phase bot deployment plan |
| grok-xpost-analysis.md | NEW | @MisterNoComents analysis |
| ares-wallet-verification.md | NEW | Wallet $0 PNL verification |
| polymarket-24-strategies-raw.md | Existing | 24 copy-trade configurations |
| INFRASTRUCTURE-BLUEPRINT.md | Existing | Full server blueprint |
| + 13 more legacy files | Existing | Various domains |

### GitHub (`jratdish1/opentang`) — AUTH EXPIRED
- Last successful push: 2026-04-10 (ares-wallet + 24 strategies)
- Pending push: 3 compressed masters + bot deployment plan + xpost analysis

---

## SERVER STATUS (Last Check: 2026-04-10 0200 PT)

| Server | IP | Status | Notes |
|--------|-----|--------|-------|
| VPS1 "473" | 62.146.175.67 | GREEN | 7 PM2 services, herobase.io build error pending |
| VPS2 "501" | 85.239.239.206 | GREEN | 3 PM2 services, fail2ban fixed at 3600s |
| VDS "APEX" | 147.93.183.207 | GREEN | Ollama running, 121GB free, 29GB RAM, knowledge deployed |
