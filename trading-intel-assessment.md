# Trading Intel Stack Assessment — April 9, 2026

## 1. PreReason API

**What it is**: Bitcoin and macro data API designed for AI agents. 17 briefings, 38 metrics, MCP server integration.

**Verdict: USEFUL — Subscribe when ready**

The free tier alone gives you 6 briefings (60 req/hr, 500/day):
- btc.quick-check — Quick directional read on BTC + net liquidity
- btc.context — BTC price, mining health, liquidity overview
- macro.snapshot — Fed balance sheet, M2, yield curve, net liquidity
- cross.correlations — BTC correlation with equities, VIX, dollar (9 pairs)
- btc.pulse — Quick price action check
- btc.grid-stress — Mining network health, difficulty adjustment forecast

Basic tier ($19.99/mo) adds: BTC momentum, liquidity momentum, on-chain health, market breadth, miner survival index.
Pro tier ($49.99/mo) adds: Full context with narrative, factor attribution, regime classification, FX liquidity, energy cost index, treasury holdings.

**Why it matters for APEX**: This is pre-digested macro context that can feed directly into trading agent decision loops. Instead of scraping 10 sources, one API call gives you a structured briefing with signal direction, confidence score, and trend data. The MCP server integration means Claude/agents can call it natively.

**Status**: Your trial key `pr_live_U5Fij3o6O3Sq3pMag3gUVpAc5RuFZDuW` is returning "invalid or expired." Need to sign up fresh at https://www.prereason.com/signup (free, no credit card).

**Recommendation**: Get a fresh free key immediately. If the data proves useful in the first week, upgrade to Basic ($19.99/mo). Pro only if you need regime classification and factor attribution for the trading bots.

---

## 2. DarkWire Intel (darkwireintel.org/trading)

**What it is**: Congressional trades + prediction markets intel with "intel cross-referencing." Paid tier ("Case Officer" membership).

**Verdict: SKIP FOR NOW**

The trading desk is paywalled. Claims to cross-reference congressional trades with lobbying data and prediction markets. Could be useful for Polymarket edge (knowing what Congress is trading before the market prices it in), but we can get congressional trade data for free from other sources (Capitol Trades, Quiver Quantitative).

**Recommendation**: Don't pay for this until the Polymarket bot is profitable. Then evaluate if congressional trade cross-referencing adds alpha.

---

## 3. Polymarket Trading Stack (from X posts)

### Tier 1 — MUST HAVE (Battle-tested, high stars)

| Repo | Stars | Language | Purpose | Replaces |
|------|-------|----------|---------|----------|
| tradingview/lightweight-charts | 14,388 | TypeScript | Charting library (45KB) | TradingView Pro ($30/mo) |
| block/goose | 40,504 | Rust | Open-source agent framework | Claude Code ($200/mo) |
| rtk-ai/rtk | 21,805 | Rust | Token proxy, cuts AI costs 60-90% | Wasted tokens |
| mortada/fredapi | 1,209 | Python | Every Fed macro dataset | Bloomberg ($2K/mo) |

### Tier 2 — HIGH VALUE (Polymarket-specific)

| Repo | Stars | Language | Purpose |
|------|-------|----------|---------|
| ent0n29/polybot | 330 | Java | Execution + market data infra, paper trading, Kafka/ClickHouse/Grafana analytics |
| evan-kolberg/prediction-market-backtesting | 307 | Rust | Backtest on real Polymarket + Kalshi data |
| txbabaxyz/polyrec | 141 | Python | Terminal UI, 70+ indicators, Chainlink oracle, Binance feed, auto CSV logging |
| dylanpersonguy/Polymarket-Trading-Bot | 132 | TypeScript | 7 strategies: arbitrage, momentum, market making, AI forecast, whale copy-trade |

### Tier 3 — USEFUL SUPPORT

| Repo | Stars | Language | Purpose |
|------|-------|----------|---------|
| agent-next/polymarket-paper-trader | 37 | Python | Paper trading for AI agents, real order books, exact fee model |

### Additional repos from @kepochnik post:

| Repo | Purpose |
|------|---------|
| TauricResearch/TradingAgents | Complete trading system builder |
| mvanhorn/last30days-skill | 30-day news analysis |
| FiatFiorino/polymarket-assistant-tool | Market direction indicators |
| firecrawl/firecrawl | Web scraping to clean data |
| pydantic/pydantic-ai | Agent framework for production bots |
| n8n-io/n8n | News analysis and filtering automation |
| tavily-ai/tavily-mcp | Search MCP server |
| txbabaxyz/collectmarkets2 | Full trade history of any wallet |
| txbabaxyz/mlmodelpoly | ML model for market direction + fair value |

---

## 4. Goldman Quant Strategy (from X post)

**The strategy in plain English**: Don't predict anything. Find contracts where the market price is wrong by more than 6%. Buy at 7-19 cents when true probability is 60-90%. At those entries, you only need to be right 1 in 4 times to profit. The bot is right 81% of the time.

**Claimed results**: +$8,191 from $2,000 in 3 months. 99 trades. Sharpe 2.30.

**Credibility check**: The math checks out. If you buy at 15 cents average and win 81% of the time, expected value per trade = (0.81 * 0.85) - (0.19 * 0.15) = 0.6885 - 0.0285 = 0.66 per dollar risked. That's insane edge if real. Sharpe 2.30 is institutional-grade.

**CAUTION**: This is an X post claiming results. No verified track record. The strategy concept is sound (it's basically value investing applied to prediction markets), but the 81% win rate claim needs verification through paper trading first.

---

## 5. Copy Trading Target: @maskache2 on Polymarket

Profile found at polymarket.com/@maskache2. Need to analyze their actual P&L, position sizes, and market selection before copy trading. The Kreo tool (http://kreo.app/@1743116) is what the poster uses for automated copy trading.

---

## 6. Kreo Copy Trading Bot

**What it is**: Telegram bot that tracks top Polymarket wallets and auto-copies trades.
**Link**: http://t.me/KreoPolyBot?start=ref-kreohub
**Cost**: Paid (amount unknown)
**Claimed results from poster's 8 agents**: velvet_void +$697, nano_alpha +$541, ratking_eth +$407, darkpool_7 +$356

**Recommendation**: This is the ONE paid tool the poster kept. Evaluate after paper trading the scanner strategy first.

---

## ACTION PLAN

### Immediate (This Week)
1. Sign up for fresh PreReason API key (free) — https://www.prereason.com/signup
2. Clone and review: lightweight-charts, fredapi, rtk
3. Paper trade the "mispriced contracts" scanner strategy using polymarket-paper-trader

### Short Term (Next 2 Weeks)
4. Set up polyrec terminal dashboard on VDS
5. Deploy Polymarket-Trading-Bot in paper mode with the arbitrage + AI forecast strategies
6. Evaluate Kreo copy trading bot

### Medium Term (Month 1)
7. If paper trading profitable, go live with small capital ($500)
8. Subscribe to PreReason Basic ($19.99/mo) if data proves useful
9. Scale winning strategies, cut losers

### DO NOT DO
- Do NOT go live with real money until paper trading validates the strategy
- Do NOT pay for DarkWire Intel until Polymarket is profitable
- Do NOT trust X post claims without independent verification
