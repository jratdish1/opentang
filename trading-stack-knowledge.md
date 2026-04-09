# APEX Trading Stack — Complete Repo Audit & Deployment Blueprint

**Updated**: 2026-04-09 1830 PT
**Location**: `/home/ubuntu/trading-stack/` (sandbox) + backed up to `jratdish1/opentang`

---

## DEPLOYMENT PRIORITY MATRIX

### DEPLOY NOW — Immediate Value

| Repo | Score | Complexity | What It Does | Deploy To |
|------|-------|-----------|--------------|-----------|
| **rtk** | 8/10 | Easy | CLI proxy that cuts LLM token costs 60-90%. Single Rust binary, zero deps. | VDS |
| **polymarket-paper-trader** | 9/10 | Easy | Paper trading simulator for AI agents. Real order books, exact fee model, slippage tracking. $10K paper money. | VDS |
| **fredapi** | 8/10 | Easy | Python wrapper for Federal Reserve FRED API. Every macro dataset the Fed publishes. Needs free FRED API key. | VDS |

### EVALUATE — High Value, Needs Config

| Repo | Score | Complexity | What It Does | Notes |
|------|-------|-----------|--------------|-------|
| **prediction-market-backtesting** | 9/10 | Medium | Backtest prediction market strategies on real Polymarket + Kalshi data. NautilusTrader fork with custom adapters. | Needs Python 3.12+ and Rust 1.93.1+. Best backtesting framework in the stack. |
| **Polymarket-Trading-Bot** | 8/10 | Easy | 7 trading strategies: arbitrage, momentum, market making, AI forecast, whale copy-trade, convergence. SaaS-ready with admin dashboard. | Node.js 20+, SQLite. Has admin dashboard security concern (env var editing). |
| **polybot** | 8/10 | Hard | Full trading infrastructure: execution, strategy, data ingestion, analytics. Kafka + ClickHouse + Grafana pipeline. | Java 21+, Docker, Python 3.11+. Heavy but comprehensive. Best for production-grade ops. |
| **TradingAgents** | 8/10 | Medium | Multi-agent LLM framework for collaborative market analysis. Research-grade but powerful concept. | Python 3.13+, Docker, multiple API keys (OpenAI, Google, Alpha Vantage). |
| **mlmodelpoly** | 8/10 | Medium | Real-time Binance Futures/Spot data collector with Polymarket integration. Calculates trading indicators, REST API for monitoring. | Python 3.10+. Good data pipeline for feeding into trading agents. |
| **goose** | 7/10 | Easy | Open-source AI agent framework by Block (Jack Dorsey). Works with any LLM. Full agent loop. | 1.7GB repo. Apache-2.0. Alternative to Claude Code but we already have Grok + Manus. |
| **lightweight-charts** | 7/10 | Easy | TradingView's own charting library. 45KB, fast, interactive. | Frontend only. Useful for dashboards but not for autonomous trading. |

### LOWER PRIORITY — Niche Use

| Repo | Score | Complexity | What It Does | Notes |
|------|-------|-----------|--------------|-------|
| **collectmarkets2** | 5/10 | Easy | Menu-driven Polymarket trade history collector + visualizations. | Good for research, not for live trading. |
| **polyrec** | 4/10 | Medium | Terminal dashboard for BTC 15-min prediction markets. Chainlink + Binance + Polymarket. | Research/educational only. No execution capability. |

---

## SECURITY AUDIT SUMMARY

**No critical security issues found across any repo.** Key notes:

- **polybot** and **Polymarket-Trading-Bot** both require `POLYMARKET_PRIVATE_KEY` in .env — standard for on-chain trading but must be secured with proper file permissions (chmod 600) and never committed to git.
- **TradingAgents** requires multiple API keys in .env — same precaution.
- **Polymarket-Trading-Bot** has admin dashboard that can edit env vars — restrict admin access with strong auth.
- All repos are open-source with permissive licenses (MIT or Apache-2.0). No licensing restrictions for commercial use.

---

## RECOMMENDED DEPLOYMENT ORDER (VDS)

**Phase 1 — Foundation (Week 1)**:
1. Deploy `rtk` — immediate token cost savings
2. Deploy `polymarket-paper-trader` — start paper trading the "mispriced contracts" strategy
3. Deploy `fredapi` — macro data feed for trading decisions
4. Get FRED API key from https://fred.stlouisfed.org/docs/api/api_key.html (free)

**Phase 2 — Strategy Development (Week 2-3)**:
5. Deploy `prediction-market-backtesting` — backtest strategies on historical data
6. Deploy `mlmodelpoly` — real-time data collection + indicators
7. Deploy `Polymarket-Trading-Bot` — 7 strategies in paper mode first

**Phase 3 — Production (Week 4+)**:
8. Deploy `polybot` if need Kafka/ClickHouse/Grafana analytics pipeline
9. Deploy `TradingAgents` for multi-agent collaborative analysis
10. Go live with validated strategies only

---

## PREREASON API INTEGRATION

**Status**: API key needs refresh. Sign up at https://www.prereason.com/signup

**Best bang for buck analysis**:

| Tier | Price | Briefings | Rate Limit | Value Proposition |
|------|-------|-----------|------------|-------------------|
| Free | $0 | 6 | 60/hr, 500/day | BTC quick check, macro snapshot, correlations, pulse, grid stress. Enough for basic agent context. |
| Basic | $19.99/mo | 11 | 120/hr, 2K/day | Adds BTC momentum, liquidity momentum, on-chain health, market breadth, miner survival. **Best value — doubles briefings for $20.** |
| Pro | $49.99/mo | 17 | 300/hr, 5K/day | Adds full context with narrative, factor attribution, regime classification, FX liquidity, energy cost, treasury holdings. |
| Enterprise | Custom | 17 | Custom | SLA, custom limits. |

**Recommendation**: Start Free → upgrade to **Basic ($19.99/mo)** after 1 week if data is useful. The jump from 6 to 11 briefings for $20 is the sweet spot. Pro is only worth it if you need regime classification (risk-on/risk-off/accumulation/distribution) for automated strategy switching.

**MCP Integration**: `npx -y @prereason/mcp` — install on VDS for native Claude/agent tool access. Set `PREREASON_API_KEY` env var.

---

## REPO LOCATIONS

All repos cloned to `/home/ubuntu/trading-stack/`:
```
trading-stack/
├── lightweight-charts/     (153M, TypeScript, Apache-2.0)
├── goose/                  (1.7G, Rust, Apache-2.0)
├── rtk/                    (7.3M, Rust, MIT)
├── fredapi/                (372K, Python, Apache-2.0)
├── polybot/                (4.2M, Java, MIT)
├── prediction-market-backtesting/ (290M, Rust/Python, MIT/LGPL)
├── polyrec/                (316K, Python, MIT)
├── Polymarket-Trading-Bot/ (4.1M, TypeScript, MIT)
├── polymarket-paper-trader/ (1.3M, Python, MIT)
├── TradingAgents/          (9.6M, Python, Apache-2.0)
├── collectmarkets2/        (252K, Python, MIT)
└── mlmodelpoly/            (1.3M, Python, MIT)
```

Total: ~2.4GB (goose is 1.7GB alone)
