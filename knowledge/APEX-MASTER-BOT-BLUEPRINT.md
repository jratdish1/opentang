# APEX Master Bot Deployment Blueprint
**Author**: Manus AI | **Date**: 2026-04-10 | **Classification**: OPERATIONAL
**Version**: 2.0 — Final Blueprint (supersedes APEX-BOT-DEPLOYMENT-PLAN.md)

---

## 1. Mission Statement

Deploy autonomous Polymarket prediction market trading bots on the APEX VDS server (147.93.183.207), funded exclusively through Kraken, validated through 7 days of paper trading, and scaled from 1 bot to 4 concurrent bots based on proven profitability. The system operates 24/7/365 with autonomous restart, watchdog monitoring, and Telegram alerting.

---

## 2. Current Operational Status (as of 2026-04-10)

The following infrastructure is already deployed and operational on VDS APEX.

| Component | Status | Version | Location |
|-----------|--------|---------|----------|
| RTK (Token Cost Optimizer) | DEPLOYED | v0.35.0 | `/usr/local/bin/rtk` |
| Polymarket Paper Trader | DEPLOYED | v0.1.7 | `/opt/trading-stack/venv/bin/pm-trader` |
| Paper Trading Bot (cron) | RUNNING | v1.0 | `/opt/apex-agent/bots/paper-trader-bot.py` |
| Paper Account | ACTIVE | $10K initial | 5 positions open, $9,986 total value |
| Cron Schedule | ACTIVE | Every 4 hours | Searches markets, executes trades, logs P&L |
| Rust Toolchain | INSTALLED | 1.94.1 | `/root/.cargo/` |
| Python Venv | INSTALLED | 3.12.3 | `/opt/trading-stack/venv/` |
| Ollama LLMs | RUNNING | 3 models loaded | 90GB VRAM allocated |

### Current Paper Portfolio

| Market | Side | Cost | Entry Price | Strategy |
|--------|------|------|-------------|----------|
| GTA VI before June 2026 | NO | $200 | $0.982 | High Conviction |
| Bitcoin $1M before GTA VI | NO | $100 | $0.512 | Macro Thesis |
| Russia-Ukraine Ceasefire before GTA VI | YES | $150 | $0.540 | Geopolitical |
| Harvey Weinstein <5yr sentence | NO | $400 | $0.966 | High Conviction |

---

## 3. Kraken Funding Strategy

All bot funding flows through a single source: the user's Kraken account. The agent advises on amounts and timing; the user executes all withdrawals. No bot or agent ever has direct access to Kraken credentials or funds.

### Funding Phases

| Phase | Timeline | Withdrawal Amount | Purpose | Trigger |
|-------|----------|------------------|---------|---------|
| Phase 1 | Apr 10-17 | $0 | Paper trading only | Automatic (already running) |
| Phase 2 | Apr 17+ | $100 USDC | Single live bot (L1 Conservative) | 7 days profitable paper trading |
| Phase 2b | Week 4+ | $150 USDC | Scale to L1 Balanced | 2 weeks profitable live trading |
| Phase 3 | Month 2+ | $500 USDC | 4-bot fleet (L2 Conservative) | Phase 2b profitable for 2+ weeks |
| Phase 3b | Month 3+ | $1,000 USDC | Full fleet at L2 Balanced | Phase 3 profitable for 2+ weeks |

### Withdrawal Process

The withdrawal process follows a strict protocol. When the paper trading validation period ends and the bot demonstrates consistent profitability, the agent will advise the user to withdraw a specific USDC amount from Kraken to a Polygon wallet address. The user logs into Kraken, executes the withdrawal manually, and confirms the transaction hash. The agent then configures the live bot with the funded wallet. At no point does the agent have access to Kraken credentials, withdrawal functionality, or private keys.

### Capital Allocation Per Bot (Live Phase)

Each bot receives a dedicated capital allocation based on its risk profile and the strategy framework's 24 configurations.

| Signal Type | L1 ($15-50) | L2 ($100-150) | L3 ($400-500) | L4 ($1,000) |
|-------------|-------------|---------------|---------------|-------------|
| **Standard — Conservative** | $15/trade, 3 max | $100/trade, 2 max | $400/trade, 2 max | $500/trade, 2 max |
| **Standard — Balanced** | $25/trade, 4 max | $125/trade, 3 max | $450/trade, 3 max | $750/trade, 3 max |
| **Standard — Aggressive** | $50/trade, 5 max | $150/trade, 5 max | $500/trade, 5 max | $1000/trade, 5 max |
| **Sniper — Conservative** | $25/trade, 2 max | $125/trade, 2 max | $450/trade, 2 max | $750/trade, 2 max |
| **Sniper — Balanced** | $35/trade, 3 max | $135/trade, 3 max | $475/trade, 3 max | $850/trade, 3 max |
| **Sniper — Aggressive** | $50/trade, 4 max | $150/trade, 4 max | $500/trade, 4 max | $1000/trade, 4 max |

Phase 2 starts at **Standard Signal, L1 Conservative** ($15/trade, max 3 concurrent). This limits maximum exposure to $45 at any time — a loss the user can absorb without material impact.

---

## 4. Bot Fleet Architecture (Phase 3 Target)

The full fleet consists of 4 specialized bots, each focused on a different market category to diversify risk and maximize coverage across Polymarket's event types.

### Bot 1: "SENTINEL" — US Politics & Policy

This bot monitors US political markets including elections, legislation, executive orders, and regulatory decisions. It uses FRED macroeconomic data combined with news sentiment analysis to identify mispriced political outcome contracts. The primary edge comes from faster processing of policy announcements and their second-order effects on prediction market pricing.

| Parameter | Value |
|-----------|-------|
| Market Focus | US elections, legislation, executive orders, regulatory |
| Data Sources | FRED API, news APIs, social media sentiment |
| Strategy | Macro Event Positioning + Sentiment Divergence |
| Trade Frequency | 2-4 trades/day |
| Capital Allocation | L2 Balanced (Phase 3) |
| Risk Profile | Medium |

### Bot 2: "ORACLE" — Crypto & DeFi Markets

This bot focuses on cryptocurrency price prediction markets, DeFi protocol events, and blockchain governance decisions. It leverages on-chain data analysis, exchange flow monitoring, and technical indicators to identify opportunities in crypto-specific Polymarket contracts.

| Parameter | Value |
|-----------|-------|
| Market Focus | BTC/ETH price targets, DeFi events, blockchain governance |
| Data Sources | On-chain analytics, exchange flows, technical indicators |
| Strategy | AI Forecast + Multi-Source Data Fusion |
| Trade Frequency | 3-6 trades/day |
| Capital Allocation | L2 Conservative (Phase 3) |
| Risk Profile | Medium-Low |

### Bot 3: "ATLAS" — Geopolitical Events

This bot covers international relations, conflicts, trade agreements, and global macro events. It processes geopolitical intelligence from multiple news sources and cross-references with historical event resolution patterns on Polymarket.

| Parameter | Value |
|-----------|-------|
| Market Focus | Conflicts, trade wars, international agreements, sanctions |
| Data Sources | International news feeds, FRED global data, diplomatic signals |
| Strategy | Multi-Source Data Fusion + Contrarian Analysis |
| Trade Frequency | 1-3 trades/day |
| Capital Allocation | L1 Balanced (Phase 3) |
| Risk Profile | Low-Medium |

### Bot 4: "SCOUT" — Sports & Entertainment

This bot handles sports outcomes, entertainment events, and cultural prediction markets. These markets often have the highest liquidity and most predictable resolution patterns, making them ideal for systematic strategies.

| Parameter | Value |
|-----------|-------|
| Market Focus | Major sports events, entertainment awards, cultural milestones |
| Data Sources | Sports statistics APIs, entertainment news, historical odds |
| Strategy | Statistical Modeling + Liquidity Provision |
| Trade Frequency | 2-5 trades/day |
| Capital Allocation | L1 Conservative (Phase 3) |
| Risk Profile | Low |

---

## 5. VDS Resource Budget

The APEX VDS has 29GB RAM free and 121GB disk free. The following table shows resource allocation across all phases.

| Component | RAM | Disk | CPU | Phase |
|-----------|-----|------|-----|-------|
| Ollama (3 models) | 12 GB | 90 GB | Low idle | Already running |
| RTK | 50 MB | 8 MB | Minimal | Phase 1 (deployed) |
| Paper Trader | 100 MB | 50 MB | Low | Phase 1 (deployed) |
| Bot 1 (SENTINEL) | 500 MB | 200 MB | Medium | Phase 2 |
| Bot 2 (ORACLE) | 500 MB | 200 MB | Medium | Phase 3 |
| Bot 3 (ATLAS) | 500 MB | 200 MB | Medium | Phase 3 |
| Bot 4 (SCOUT) | 500 MB | 200 MB | Medium | Phase 3 |
| Kafka (event streaming) | 2 GB | 5 GB | Medium | Phase 3 |
| ClickHouse (time-series DB) | 4 GB | 20 GB | Medium | Phase 3 |
| Grafana (dashboards) | 1 GB | 500 MB | Low | Phase 3 |
| **Total Phase 3** | **~21 GB** | **~116 GB** | — | — |
| **Available** | **29 GB** | **121 GB** | — | — |
| **Headroom** | **8 GB** | **5 GB** | — | — |

The VDS can handle the full Phase 3 deployment with 8GB RAM headroom. If Ollama models need to be trimmed, unloading one 7B model frees an additional 4-7GB.

---

## 6. Timeline

| Date | Milestone | Action |
|------|-----------|--------|
| Apr 10 | Paper trading started | Bot executing every 4 hours, 5 positions open |
| Apr 13 | Mid-validation check | Review P&L, adjust strategy parameters if needed |
| Apr 17 | Paper validation complete | If 7 days profitable: advise $100 USDC Kraken withdrawal |
| Apr 17 | Phase 2 go-live | Deploy single live bot (SENTINEL) at L1 Conservative |
| Apr 24 | 1-week live review | Evaluate live P&L, slippage vs paper, strategy performance |
| May 1 | Phase 2b decision | If profitable: scale to L1 Balanced, advise $150 withdrawal |
| May 15 | Phase 3 decision | If 2+ weeks profitable: deploy 4-bot fleet, advise $500 withdrawal |
| Jun 1 | Phase 3b decision | If fleet profitable: scale to L2 Balanced, advise $1,000 withdrawal |

---

## 7. Monitoring & Alerting

Every bot in the fleet reports through a unified monitoring stack that sends alerts to Telegram.

| Monitor | Frequency | Alert Channel | Trigger |
|---------|-----------|---------------|---------|
| Bot Health Check | Every 60 min | Telegram | Bot process not running |
| Trade Execution Log | Per trade | Local log + Telegram (summary) | Every trade logged SUCCESS/FAILED |
| Daily P&L Report | Daily 0800 PT | Telegram | Automated daily summary |
| Drawdown Alert | Real-time | Telegram (URGENT) | Portfolio down >10% from peak |
| Cash Reserve Alert | Per trade | Telegram | Cash below $5K (paper) or reserve threshold (live) |
| VDS System Health | Every 2 min | Telegram | Goose watchdog (already running) |

---

## 8. Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| No bot has exchange credentials | ENFORCED | Agent advises, user executes all withdrawals |
| API keys in env vars only | ENFORCED | No hardcoded keys in any script |
| Autonomous restart | CONFIGURED | Cron-based, auto-recovers from crashes |
| Watchdog integration | ACTIVE | Goose watchdog every 2 min on VDS |
| Rate limiting | CONFIGURED | API calls rate-limited per Polymarket TOS |
| All trades logged | ACTIVE | `/opt/apex-agent/logs/paper-trading.log` |
| No referral-link bots | CONFIRMED | All tools from verified open-source repos |
| Paper trade validation | IN PROGRESS | 7-day minimum before any live capital |
| Port scan | PENDING | Run before Phase 2 go-live |
| Malicious code audit | PASSED | All repos audited during research phase |

---

## 9. Answers to User Questions

**How many autonomous bots will be running in APEX?**

Phase 1 (now): 1 paper trading bot. Phase 2 (Apr 17): 1 live bot. Phase 3 (May 15+): 4 concurrent live bots (SENTINEL, ORACLE, ATLAS, SCOUT). Maximum fleet size is 4 bots, which the VDS can handle with 8GB RAM headroom.

**Can Kraken be the single funding source?**

Yes. Kraken is the sole funding source for all bot operations. The user withdraws USDC from Kraken to a Polygon wallet based on agent recommendations. No bot ever touches Kraken directly. Clean, auditable, single-source funding.

**3 more days then we go live?**

The go-live target is **April 17** (7 days from paper trading start on April 10). The 7-day validation period is non-negotiable — it must show positive P&L, Sharpe ratio >1.0, and max drawdown <15% before any real capital is deployed.

**How is the crypto paper trading going?**

Paper trading is LIVE as of April 10. The bot has $10,000 in paper money, 5 positions open across political, crypto, and geopolitical markets, and is executing strategy scans every 4 hours via cron. Current P&L: -$13.94 (-0.14%) — this is expected initial slippage from market entry. The 7-day validation window runs through April 17.

---

## 10. Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| Paper trader bot | `/opt/apex-agent/bots/paper-trader-bot.py` | Autonomous strategy executor |
| Paper trading log | `/opt/apex-agent/logs/paper-trading.log` | All trade executions and P&L |
| Cron log | `/opt/apex-agent/logs/paper-trading-cron.log` | Cron execution output |
| RTK binary | `/usr/local/bin/rtk` | Token cost optimizer |
| Trading venv | `/opt/trading-stack/venv/` | Python environment for all trading tools |
| Knowledge base | `/opt/apex-agent/knowledge/` | 9 active files, 12 archived |
| This blueprint | `/opt/apex-agent/knowledge/APEX-MASTER-BOT-BLUEPRINT.md` | Master reference document |
