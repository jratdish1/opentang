# Polymarket Fee Structure — Key Findings (2026)

## Critical Discovery: Fees are NOT 3% on winnings

The GPT-4.1-mini analysis was WRONG about the fee structure. Here's what's actually true:

### Actual Fee Structure:
- **0% fee on winnings** — winning shares always redeem for exactly $1.00 USDC
- **Dynamic Taker Fee** — only charged when you take liquidity (market orders)
- **0% Maker Fee** — limit orders pay nothing
- **Maker REBATE** — 100% of taker fees redistributed to makers

### Fee Tiers:
- **Tier 1 (High Velocity)**: 15-min crypto markets — up to 1.80% peak taker fee
- **Tier 2 (Core)**: Politics, Finance, Tech — moderate fees
- **Tier 3 (Niche)**: 0% fees

### 5-Minute BTC Markets:
- These are HIGH VELOCITY markets (Tier 1)
- Peak taker fee: up to 1.80% when probability is at 50%
- Fee decreases as price approaches $0 or $1

### Impact on OpenClaw Strategy:
- If buying YES at $0.49 and NO at $0.50 (both near 50% probability):
  - Taker fee on each: up to 1.80%
  - Fee on $0.49 buy: ~$0.0088
  - Fee on $0.50 buy: ~$0.0090
  - Total fees: ~$0.018 per pair
  - Gross profit: $0.01 per pair
  - NET RESULT: -$0.008 LOSS per pair after fees

### BUT — if using LIMIT ORDERS (maker):
- 0% fee + maker rebate
- Could potentially capture the full $0.01 spread
- Plus earn rebate from taker fees
- This changes the math significantly

### Conclusion:
- Strategy is IMPOSSIBLE with market orders (taker fees eat the spread)
- Strategy MIGHT work with limit orders (maker) if you can get filled on both sides
- The "structural" edge claim needs more scrutiny — it may be a market-making strategy disguised as arbitrage
