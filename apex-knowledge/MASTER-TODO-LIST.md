# APEX AGENT ECOSYSTEM — MASTER TO-DO LIST

**Last Updated:** 2026-04-08 — AT-Foam SEO fixes deployed; hero-dapp ConnectWalletPrompt added to all wallet-gated sections
**Total Items:** 67
**Classification:** CONFIDENTIAL

---

## PRIORITY 1: CRITICAL (Blocks Go-Live)

These items must be completed before any trading agent can execute live trades.

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Get Anthropic API key and load into VDS .env | VETS | NOT DONE | console.anthropic.com |
| 2 | Get OpenAI API key and load into VDS .env | VETS | NOT DONE | platform.openai.com (sandbox key works but need personal key for VDS) |
| 3 | Get xAI (Grok) API key and load into VDS .env | VETS | NOT DONE | console.x.ai |
| 4 | Get Polymarket CLOB API key | VETS | NOT DONE | Required for latency arb + wallet intel strategies |
| 5 | Get Binance API key + secret | VETS | NOT DONE | binance.com — VETS has Binance account |
| 6 | Get wallet private key for on-chain trades | VETS | NOT DONE | Store in .env ONLY, never in code |
| 7 | Re-verify Contabo API password (auth was failing) | VETS | NOT DONE | my.contabo.com/api/details |
| 8 | Re-enable UFW ports on VDS (80, 443, 8080) | MANUS | NOT DONE | Ports got reset during host key change |
| 9 | Restart all systemd services on VDS | MANUS | NOT DONE | apex-dashboard, nginx, health monitor |
| 10 | Run paper trading mode for 1 week minimum | MANUS | BLOCKED | Blocked by items 1-6 |

---

## PRIORITY 2: SECURITY (Non-Negotiable)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 11 | Set up Cloudflare for VDS (147.93.183.207) | VETS/MANUS | NOT DONE | DDoS protection for trading engine |
| 12 | Set up Cloudflare for VPS 1 (62.146.175.67) | VETS/MANUS | NOT DONE | DDoS protection for websites |
| 13 | Set up Cloudflare for VPS 2 (85.239.239.206) | VETS/MANUS | NOT DONE | DDoS protection for websites |
| 14 | Set up Cloudflare for all domains | VETS/MANUS | NOT DONE | regenvalor.com, valorpeptides.net, vicfoundation.com |
| 15 | SSL certificate for ops dashboard | MANUS | NOT DONE | Needs domain pointed at VDS first |
| 16 | Passkey/2FA login gate for dashboard | MANUS | NOT BUILT | Dashboard currently public — MUST lock down |
| 17 | Disable password SSH on VDS (re-verify) | MANUS | NEEDS CHECK | Was set but host key changed |

---

## PRIORITY 3: DASHBOARD UPGRADES

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 18 | Add trading agent latency indicators | MANUS | NOT BUILT | Show ms latency for each strategy engine |
| 19 | Add P/L chart per agent | MANUS | NOT BUILT | ROI tracking, win rate, drawdown visualization |
| 20 | Add Binance Skills Hub integration status | MANUS | NOT BUILT | Show which Binance skills are active |
| 21 | Integrate all monitoring into single dashboard | MANUS | NOT DONE | Consolidate — no separate dashboards |
| 22 | Point a subdomain at VDS for SSL | VETS | NOT DONE | e.g., ops.regenvalor.com → 147.93.183.207 |

---

## PRIORITY 4: SERVER MIGRATION (Save Manus Credits)

### VDS (Trading Engine — 147.93.183.207)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 23 | Deploy Apex Agent via Docker Compose | MANUS | NOT DONE | ops/docker-compose.yml exists |
| 24 | Deploy Mining-Dutch Monitor to VDS | MANUS | NOT DONE | Dockerfile ready, cron every 30 min |
| 25 | Set up Telegram bot for alerts | VETS/MANUS | ✅ DONE | @Vetsincrypto_bot configured, credentials in .env, live test passed April 8 2026 |
| 26 | Configure health-check.sh auto-updater | MANUS | NOT DONE | Auto-pull from GitHub, rebuild containers |
| 27 | Install cron jobs on VDS | MANUS | PARTIAL | Monitor crons set, need mining + health check |
| 28 | Clone and deploy Binance Skills Hub on VDS | MANUS | NOT DONE | Spot trading, futures, signals skills |
| 29 | Clone and deploy BNB Chain Toolkit MCP servers | MANUS | NOT DONE | binance-mcp, bnbchain-mcp, market data |

### VPS 1 (Websites — 62.146.175.67)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 30 | Decide: migrate vicfoundation dashboard from GoDaddy? | VETS | DECISION NEEDED | Currently at 216.150.1.193 on GoDaddy |
| 31 | Deploy HERO Dapp (after auth replacement) | MANUS | BLOCKED | Needs Manus OAuth replaced with Auth0/JWT |
| 32 | Replace Manus OAuth in HERO Dapp with standard auth | MANUS | NOT DONE | Auth0, Firebase, or JWT implementation |
| 33 | Remove vite-plugin-manus-runtime from HERO Dapp | MANUS | NOT DONE | Dependency on Manus ecosystem |
| 34 | Provision MySQL database for HERO Dapp | MANUS | NOT DONE | hero-dapp-compose.yml template exists |

### VPS 2 (Websites — 85.239.239.206)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 35 | Migrate RegenValor.com to VPS 2 | MANUS | NOT DONE | Currently on AWS (3.33.251.168) |
| 36 | Migrate valorpeptides.net to VPS 2 | MANUS | NOT DONE | Currently on Cloudflare (104.18.27.246) |
| 37 | Set up Nginx reverse proxy for both sites | MANUS | NOT DONE | After migration |
| 38 | SSL certs via Let's Encrypt for both domains | MANUS | NOT DONE | certbot already installed |
| 39 | DNS A record updates for both domains | VETS | NOT DONE | Point to 85.239.239.206 |

---

## PRIORITY 5: TRADING STRATEGY ENHANCEMENTS

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 40 | Integrate Binance spot trading skill | MANUS | NOT DONE | From binance-skills-hub |
| 41 | Integrate Binance futures trading skill | MANUS | NOT DONE | From binance-skills-hub |
| 42 | Integrate meme-rush signal detection | MANUS | NOT DONE | From binance-skills-hub |
| 43 | Integrate trading-signal skill | MANUS | NOT DONE | From binance-skills-hub |
| 44 | Set up crypto market data feed (BNB toolkit) | MANUS | NOT DONE | Real-time price feeds |
| 45 | Set up PancakeSwap trading agent | MANUS | NOT DONE | From bnb-chain-toolkit |
| 46 | Add Kraken exchange support | MANUS | NOT DONE | VETS has Kraken account |
| 47 | Add Coinbase exchange support | MANUS | NOT DONE | VETS has Coinbase account |
| 48 | Multi-agent orchestration (AutoGen patterns) | MANUS | FUTURE | From microsoft/autogen analysis |

---

## PRIORITY 6: OPERATIONAL EXCELLENCE

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 49 | Set up Telegram alert channel | VETS | ✅ DONE | @Vetsincrypto_bot active, @VETS_IN_CRYPTO chat confirmed, credentials live in ~/.bashrc + apex-agent/.env |
| 50 | Configure Manus check-in bridge to VDS | MANUS | NOT DONE | scripts/manus-checkin-bridge.py from migration report |
| 51 | Set up automated Docker cleanup + log rotation | MANUS | NOT DONE | From install-crons.sh |
| 52 | Create Kreo Telegram bot integration | MANUS | RESEARCH DONE | @kreomainbot — copy trading features |
| 53 | Create Ollama knowledge export pipeline | MANUS | NOT DONE | Export all knowledge for local Ollama desktop to save Manus credits |
| 54 | Sync opentang repo with latest project files | MANUS | NOT DONE | jratdish1/opentang — primary storage per workspace blueprint |
| 55 | Check Google Workspace/Drive token status | VETS | NOT DONE | GOOGLE_WORKSPACE_CLI_TOKEN and GOOGLE_DRIVE_TOKEN — are these active? |
| 56 | Document Dapp deployment pattern (CNAME + Cloudflare) | MANUS | NOT DONE | dapp.vicfoundation.com CNAME, Cloudflare DNS-only mode |
| 57 | Deploy TurboQuant to VDS for Ollama optimization | MANUS | NOT DONE | CPU-only mode, KV cache compression for qwen2.5 models |
| 58 | Install turboquant + stitch-design Manus skills | MANUS | DONE | Installed to /home/ubuntu/skills/ |
| 59 | Get Google Stitch API key | VETS | NOT DONE | stitch.withgoogle.com — AI UI design tool |
| 60 | Integrate TurboQuant health check into VDS cron | MANUS | NOT DONE | Add to daily 8 AM health check |
| 61 | Add deployer wallet address to VDS .env | MANUS | NOT DONE | 0xfB253971... for PulseChain (369) + BASE (8453) |
| 62 | Set up Hardhat + Foundry on VPS 1 for contract deployment | MANUS | NOT DONE | $HERO and $VETS smart contract deployment |
| 63 | Implement github_sync.sh (30-min auto-push) on VDS | MANUS | NOT DONE | Cron-based auto-sync to GitHub |
| 67 | Configure TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in apex-agent/.env | MANUS | ✅ DONE | Found in SKILLS-KNOWLEDGE-BACKUP-BLUEPRINT.md — @Vetsincrypto_bot, injected into ~/.bashrc + .env, live test confirmed (msg_id: 340) |
| 64 | Investigate Z.AI as 6th LLM provider in router | MANUS | NOT DONE | Cost-effective alternative, user had key |
| 65 | Verify Anthropic API key rotation | VETS | NOT DONE | Key was exposed in previous session — MUST verify rotated |
| 66 | Sync apex-agent files to opentang repo | MANUS | NOT DONE | Consolidate both repos |

---

## ACCOUNTS NEEDED (VETS Action Required)

| Service | URL | What For |
|---------|-----|----------|
| Anthropic | console.anthropic.com | Claude API key |
| OpenAI | platform.openai.com | GPT API key (personal, not sandbox) |
| xAI | console.x.ai | Grok API key |
| Google AI | aistudio.google.com | Gemini API key |
| Polymarket | polymarket.com | CLOB API for trading |
| Binance | binance.com | Exchange API key + secret |
| Kalshi | kalshi.com | Prediction market API |
| Cloudflare | cloudflare.com | DDoS protection, DNS proxy |
| Telegram | @BotFather | Bot token for alerts — ALSO needed for auto_github_upload.sh notifications |
| Z.AI | z.ai | GLM models — cost-effective Claude alternative |

---

## QUICK WINS (Can Do Right Now)

These items can be completed immediately without waiting on API keys:

1. **#8** — Re-enable UFW ports on VDS
2. **#9** — Restart systemd services on VDS
3. **#17** — Verify SSH security on VDS
4. **#23** — Deploy Apex Agent via Docker Compose
5. **#24** — Deploy Mining-Dutch Monitor
6. **#27** — Install remaining cron jobs
7. **#37** — Set up Nginx on VPS 2

---

## DECISION POINTS (Need VETS Input)

| # | Decision | Options |
|---|----------|---------|
| A | Which subdomain for ops dashboard SSL? | ops.regenvalor.com, ops.vicfoundation.com, or custom |
| B | Migrate vicfoundation dashboard from GoDaddy? | Keep on GoDaddy or move to VPS 1 |
| C | Which Cloudflare plan? | Free (basic DDoS) or Pro ($20/mo, WAF + advanced) |
| D | Funding amount for paper trading? | Recommended: start with $50-100 test funds |
| E | Which exchanges to prioritize? | Polymarket + Binance first, then Kraken/Coinbase? |
| F | Was the exposed Anthropic API key rotated? | CRITICAL — verify immediately |

---

**"The more you sweat in training, the less you bleed in combat."**
*Paper trade first. Scale on evidence. Never risk what you can't afford to lose.*
