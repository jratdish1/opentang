# APEX MASTER KNOWLEDGE — TRADING INTELLIGENCE
**Compressed**: 2026-04-10 | **Domain**: Trading, Polymarket, Copy-Trade, Market Intel
**Location**: `/opt/apex-agent/knowledge/APEX-MASTER-TRADING.md`

---

## 1. TRADING STACK DEPLOYMENT (from trading-stack-knowledge.md)

### DEPLOY NOW (Immediate Value)

| Repo | Score | What It Does | Deploy To |
|------|-------|--------------|-----------|
| rtk | 8/10 | CLI proxy cuts LLM token costs 60-90%. Single Rust binary. | VDS |
| polymarket-paper-trader | 9/10 | Paper trading sim. Real order books, exact fee model, $10K paper money. | VDS |
| fredapi | 8/10 | Python wrapper for Federal Reserve FRED API. Free key needed. | VDS |

### EVALUATE (High Value, Needs Config)

| Repo | Score | What It Does | Notes |
|------|-------|--------------|-------|
| prediction-market-backtesting | 9/10 | Backtest on real Polymarket + Kalshi data. NautilusTrader fork. | Python 3.12+, Rust 1.93.1+ |
| Polymarket-Trading-Bot | 8/10 | 7 strategies: arb, momentum, market making, AI forecast, whale copy, convergence. | Node.js 20+, SQLite |
| polybot | 8/10 | Full infra: Kafka + ClickHouse + Grafana pipeline. | Java 21+, Docker, Python 3.11+ |
| TradingAgents | 8/10 | Multi-agent LLM framework for collaborative market analysis. | Python 3.13+, Docker |
| mlmodelpoly | 8/10 | Real-time Binance data + Polymarket integration. | Python 3.10+ |

### LOWER PRIORITY
goose (7/10, agent framework), lightweight-charts (7/10, TradingView charting), polyrec (6/10, recommendation engine)

---

## 2. POLYMARKET STRATEGY ANALYSIS (from trading-intel-assessment.md)

### OpenClaw 5-Min BTC Binary Arb — DEBUNKED
The claimed $400K profit from 5-min BTC binary options arbitrage is FALSE. Academic paper "Prediction Market Design for Betting on Many Outcomes" (2024) shows losses. Polymarket fees (2% maker, 3% taker) kill the 1-3% spread. Reddit consensus: "5-min BTC is a trap for retail." The X thread by @MisterNoComents is a marketing funnel for referral-link copy-trade bots.

### Ares.pro Wallet Verification — EMPTY
Wallet `0x2b3ff45c91540e46fae1e0c72f61f4b049453446` shows $0 PNL, zero activity, "No wins yet." The claimed $1.2M P&L is unverifiable.

### Polymarket Fee Structure
- Maker: 2% of potential profit
- Taker: 3% of potential profit  
- Settlement: Free
- Minimum viable edge: >3% after fees to be profitable

### Real Alpha: Longer-Timeframe Markets
Markets with 1-7 day resolution windows offer genuine edge through:
- Macro event analysis (Fed decisions, elections, policy)
- Sentiment divergence detection
- Multi-source data fusion (FRED, PreReason, news APIs)

---

## 3. COPY-TRADE STRATEGY FRAMEWORK (24 Configurations)

### Standard Signal (Moderate frequency, broader market coverage)

| Budget Level | Conservative (1x-2x) | Balanced (2x-5x) | Very Aggressive (5x-10x) |
|---|---|---|---|
| L1: $15-50 | $5-10/trade, 3-5 trades max | $10-25/trade, 2-3 trades | $15-50/trade, 1-2 trades |
| L2: $100-150 | $15-30/trade, 5-7 trades | $25-50/trade, 3-5 trades | $50-75/trade, 2-3 trades |
| L3: $400-500 | $50-80/trade, 6-8 trades | $80-125/trade, 4-6 trades | $125-250/trade, 2-3 trades |
| L4: $1000+ | $100-150/trade, 8-10 trades | $150-250/trade, 5-7 trades | $250-500/trade, 3-4 trades |

### Sniper Signal (Low frequency, high conviction picks)

| Budget Level | Conservative (1x-2x) | Balanced (2x-5x) | Very Aggressive (5x-10x) |
|---|---|---|---|
| L1: $15-50 | $10-15/trade, 2-3 trades | $15-25/trade, 1-2 trades | $25-50/trade, 1 trade |
| L2: $100-150 | $25-40/trade, 3-4 trades | $40-75/trade, 2-3 trades | $75-150/trade, 1-2 trades |
| L3: $400-500 | $75-100/trade, 4-5 trades | $100-175/trade, 3-4 trades | $175-350/trade, 2-3 trades |
| L4: $1000+ | $150-200/trade, 5-7 trades | $200-350/trade, 4-5 trades | $350-700/trade, 2-3 trades |

### KEY RULES
1. **Paper trade minimum 24 hours** before any live deployment
2. **Agent advises allocation, user executes Kraken withdrawals** — agent NEVER has direct exchange access
3. **No third-party bots via referral links** — build own tools from verified open-source repos
4. **Start at L1 Conservative** until strategy proves profitable over 7+ days

---

## 4. MARKET INTEL SOURCES

### PreReason API (prereason.com)
- Endpoints: btc.macro, btc.pulse, btc.grid-stress
- Trial key status: `pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_` — STILL INVALID
- Previous key `pr_live_U5Fij3o6O3Sq3pMag3gUVpAc5RuFZDuW` — expired
- Action: User needs to log into prereason.com dashboard and copy exact key
- Basic tier ($19.99/mo) recommended if useful in week 1

### FRED API (fredapi)
- Free key from research.stlouisfed.org
- Every macro dataset the Fed publishes
- Critical for longer-timeframe Polymarket strategies

### DEX Screener
- LP price feeds for PulseChain and BASE tokens
- Used in LiveTicker.jsx component for herobase.io

### Chains & Tokens
- **PulseChain**: EMIT, RHINO, TruFarm
- **BASE**: HERO, WETH, BRETT, AERO, jesse

---

## 5. BOT DEPLOYMENT PROTOCOL

1. Paper trade with polymarket-paper-trader ($10K sim money)
2. Validate strategy over minimum 24 hours (per Kraken bot security protocol)
3. Integrate into watchdog system on VDS
4. Harden security — check for open backdoor ports
5. Set up autonomous restart code
6. Deploy to VDS (dedicated to AI trading agents only)
7. VPS1 + VPS2 provide backup/failover support
8. Monitor via Grafana dashboard (polybot stack)
9. Continuous 24/7/365 operation — crypto never sleeps
