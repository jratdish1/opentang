# PreReason Live Market Intel — April 9, 2026 2230 UTC

**API Key**: pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_ (ACTIVE, Free Tier)
**All 6 free briefings pulled successfully.**

---

## EXECUTIVE SUMMARY

| Signal | Direction | Key Data |
|--------|-----------|----------|
| **BTC Price** | BULLISH | $72,786, +8.8% 7d, accelerating upward |
| **Net Liquidity** | BULLISH | $5.95T, +2.6% 30d, expanding |
| **BTC-Liquidity Correlation** | WEAK | 0.10 — BTC moving independently |
| **S&P 500 (SPY)** | BULLISH | $680.31, +4.0% 7d, accelerating |
| **Nasdaq (QQQ)** | BULLISH | $609.96, +4.6% 7d, risk appetite expanding |
| **Volatility (VXX)** | BEARISH | $30.55, -12.9% 7d, fear declining |
| **Dollar (UUP)** | NEUTRAL | 27.49, consolidating |
| **BTC Dominance** | NEUTRAL | 57.2%, no rotation signal |
| **Mining Difficulty** | BULLISH | 139.0T, -4.2% 30d (easier mining) |
| **Hash Rate** | NEUTRAL | 1021.81 EH/s, +6.0% 7d |
| **Hash Ribbon** | NEUTRAL | 0.968, MAs converging |
| **Epoch Pace** | BULLISH | +4.1% slower than target (difficulty decrease expected) |

**Bottom Line**: Aligned bullish setup — BTC up, liquidity expanding, equities strong, volatility falling, dollar neutral. BTC moving independently of liquidity (0.10 correlation) which means it's driven by its own momentum right now. Mining economics favorable — difficulty decrease expected.

---

## MACRO ENVIRONMENT

### Fed Balance Sheet [Bullish]
Fed balance at $6.72T, up 0.8% over 30d. Expanding — supportive backdrop.

### M2 Money Supply [Bullish]
M2 at $21.76T, up 0.3% over 30d. Expanding — broad money growth positive for risk assets.

### Yield Curve [Neutral]
10Y-2Y spread at 0.38%, stable. Consolidating — no inversion signal.

### Reverse Repo (RRP) [Neutral]
RRP at $94.75B, stable. Consolidating — minimal drain/injection pressure.

### Treasury General Account [Neutral]
TGA at $676.06B, stable. Consolidating — no spending/issuance shock.

### EUR/USD [Neutral]
Stable at 1.1689. Consolidating.

---

## CROSS-ASSET CORRELATIONS (30-day rolling Pearson)

| Pair | Correlation | Interpretation |
|------|-------------|----------------|
| BTC vs SPY | +0.44 | Moderate positive — BTC tracking equities |
| BTC vs QQQ | +0.43 | Moderate positive — BTC tracking tech |
| BTC vs VXX | -0.42 | Moderate inverse — BTC rises when fear falls |
| BTC vs UUP | -0.35 | Weak negative — dollar weakness helps BTC |
| BTC vs Net Liquidity | +0.10 | Uncorrelated — BTC on its own momentum |
| SPY vs VXX | -0.96 | Strong inverse — classic risk-on/risk-off |
| Hash Ribbon vs BTC | +0.35 | Weak positive |

---

## MINING GRID STATUS

- **Difficulty**: 139.0T, down 4.2% over 30d — easier mining conditions
- **Hash Rate**: 1021.81 EH/s, up 6.0% over 7d — network strengthening
- **Epoch Pace**: +4.1% slower than 10-min target — difficulty decrease expected next adjustment
- **Hash Ribbon**: 0.968 (neutral) — 30d/60d MAs converging, watch for crossover signal

---

## PREREASON API REFERENCE

### Free Tier Briefings (6 available):
1. `btc.quick-check` — Quick directional read
2. `btc.context` — BTC price, mining health, liquidity overview
3. `macro.snapshot` — Fed balance sheet, M2, yield curve, net liquidity
4. `cross.correlations` — 9 cross-asset correlation pairs
5. `btc.pulse` — Quick price action (price, 24h change, dominance)
6. `btc.grid-stress` — Mining network health, difficulty forecast

### API Usage:
```bash
# Markdown format
curl -H "Authorization: Bearer pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_" \
  "https://api.prereason.com/api/context?briefing=btc.quick-check"

# JSON format
curl -H "Authorization: Bearer pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_" \
  "https://api.prereason.com/api/context?briefing=btc.quick-check&format=json"
```

### Rate Limits (Free): 60 req/hr, 500 req/day
