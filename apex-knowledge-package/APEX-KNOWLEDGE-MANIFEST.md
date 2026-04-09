# APEX Knowledge Deployment Manifest
**Version**: 2.0 | **Updated**: 2026-04-09 1845 PT
**Purpose**: Complete knowledge base for APEX autonomous trading system on VDS

---

## API KEYS & CREDENTIALS

### PreReason API (ACTIVE)
```
PREREASON_API_KEY=pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_
PREREASON_URL=https://api.prereason.com
```
- Tier: Free (6 briefings, 60 req/hr, 500 req/day)
- MCP Server: `npx -y @prereason/mcp`
- Briefings: btc.quick-check, btc.context, macro.snapshot, cross.correlations, btc.pulse, btc.grid-stress

### Grok API
```
XAI_API_KEY=${XAI_API_KEY}  # From environment
```

### Contabo VDS API
```
CONTABO_CLIENT_ID=INT-14422637
CONTABO_CLIENT_SECRET=dc8Ve2E5DIzU94cIBlBukSZ64lZbWdTK
CONTABO_API_PASSWORD=quy3TFG3kun_qph@axa
```

### Mining Dutch
```
MINING_DUTCH_LOGIN=radii.dyes-04@icloud.com
MINING_DUTCH_PASSWORD=KCH.phz7qmx0ztj2mpg
```

---

## TRADING STACK REPOS (Deploy to VDS)

### Phase 1 — Deploy Immediately
1. **rtk** — Token cost optimizer (Rust binary, MIT)
   - Source: `trading-stack/rtk/`
   - Deploy: Copy binary, add to PATH
   
2. **polymarket-paper-trader** — AI agent paper trading (Python, MIT)
   - Source: `trading-stack/polymarket-paper-trader/`
   - Deploy: `pip install -r requirements.txt && python main.py`
   
3. **fredapi** — Federal Reserve macro data (Python, Apache-2.0)
   - Source: `trading-stack/fredapi/`
   - Deploy: `pip install fredapi`
   - Needs: FRED API key from https://fred.stlouisfed.org/docs/api/api_key.html

### Phase 2 — Evaluate & Deploy
4. **prediction-market-backtesting** — Strategy backtester (Rust/Python, MIT/LGPL)
5. **Polymarket-Trading-Bot** — 7 strategies (TypeScript, MIT)
6. **mlmodelpoly** — Real-time data collector + indicators (Python, MIT)
7. **polybot** — Full trading infrastructure (Java, MIT)

### Phase 3 — Advanced
8. **TradingAgents** — Multi-agent LLM framework (Python, Apache-2.0)
9. **lightweight-charts** — Charting for dashboards (TypeScript, Apache-2.0)
10. **goose** — Open-source agent framework (Rust, Apache-2.0)

---

## KNOWLEDGE FILES INDEX

| File | Purpose | Location |
|------|---------|----------|
| trading-stack-knowledge.md | Full repo audit + deployment blueprint | /home/ubuntu/ |
| trading-intel-assessment.md | PreReason, DarkWire, Polymarket stack analysis | /home/ubuntu/ |
| prereason-live-intel-20260409.md | Live market data from PreReason | /home/ubuntu/ |
| herobase-contract-addresses.md | All LP pair contract addresses | /home/ubuntu/ |
| herobase-code-changes.md | herobase.io change manifest | /home/ubuntu/ |
| vicfoundation-seo-intel.md | AIVI analysis + SEO action plan | /home/ubuntu/ |
| todo.md | Master task list | /home/ubuntu/ |
| audit_trading_repos.csv | 12-repo audit results | /home/ubuntu/ |

---

## OPERATIONAL KNOWLEDGE

### Trading Strategy: Mispriced Contracts Scanner
- Find Polymarket contracts where market price diverges >6% from true probability
- Buy at 7-19 cents when true probability is 60-90%
- Only need 1 in 4 wins to profit at those entries
- Paper trade first using polymarket-paper-trader
- Target: Sharpe >2.0 before going live

### Copy Trading Targets
- @maskache2 on Polymarket — needs P&L analysis
- Kreo bot (http://t.me/KreoPolyBot) — auto copy trading, paid tool
- Strategy: Follow high-earning wallets, analyze their patterns, build upon their methods

### Mining Operations
- Schedule: OFF at 1700 PST, ON at 2000 PST, OFF at 0700 PST, ON at 1000 PST
- Always solo mining
- Monitor mining-dutch.nl for most profitable pool
- Alert if profitability drops >2%: switch to next best pool
- Watchdog: Check every 60 min when offline outside schedule

### PreReason Integration Pattern
```python
import requests

def get_btc_briefing(briefing_id="btc.quick-check", format="json"):
    r = requests.get(
        f"https://api.prereason.com/api/context?briefing={briefing_id}&format={format}",
        headers={"Authorization": f"Bearer {PREREASON_API_KEY}"}
    )
    return r.json() if format == "json" else r.text

# Available free briefings:
# btc.quick-check, btc.context, macro.snapshot, 
# cross.correlations, btc.pulse, btc.grid-stress
```

---

## GITHUB REPOS TO INTEGRATE

### Already Cloned (in trading-stack/)
- tradingview/lightweight-charts
- block/goose
- rtk-ai/rtk
- mortada/fredapi
- ent0n29/polybot
- evan-kolberg/prediction-market-backtesting
- txbabaxyz/polyrec
- dylanpersonguy/Polymarket-Trading-Bot
- agent-next/polymarket-paper-trader
- TauricResearch/TradingAgents
- txbabaxyz/collectmarkets2
- txbabaxyz/mlmodelpoly

### Referenced but Not Yet Cloned
- Ss1024sS/LLM-wiki — LLM resources for all systems
- mvanhorn/last30days-skill — 30-day news analysis
- FiatFiorino/polymarket-assistant-tool — Market direction indicators
- firecrawl/firecrawl — Web scraping to clean data
- pydantic/pydantic-ai — Agent framework
- n8n-io/n8n — Automation workflows
- tavily-ai/tavily-mcp — Search MCP server

---

## SECURITY CHECKLIST

- [ ] All .env files chmod 600
- [ ] No private keys in git
- [ ] Polymarket private key isolated in secure .env
- [ ] Admin dashboard access restricted with strong auth
- [ ] Cloudflare active on all public-facing services
- [ ] Rate limiting on all API endpoints
- [ ] CSP headers configured
- [ ] 2FA on all admin panels
