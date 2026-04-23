# Comprehensive Bot Audit — April 24, 2026

## VPS1 Status: ONLINE
- Uptime: 3 days, 15h
- All 10 pm2 processes online
- Hero-ABLE (PulseChain): Running, scanning, simulations failing (no profitable arbs)
- Hero-ABLE-Base: Running, "Not signer" error on simulation
- hero-vets-pulse (VPS1 copy): Running
- base-hero-vol: Running
- hero-dapp: Running (8 restarts)

## VDS Trading Bots

### Kraken Bot (kraken-bot-v2)
- Status: ONLINE, scanning every 240s
- Equity: $1,504.65
- Spent today: $100.02
- Detecting volume spikes on BTC, ETH, SOL, XRP, DOT, DOGE
- Grid scanning BTC/ETH/SOL
- MISSING: No USDC.e auto-refill logic
- MISSING: No fee redemption automation
- MISSING: No $10 minimum USDC.e maintenance

### Kalshi Bot (kalshi-bot-v4)
- Status: ONLINE, scanning every 60s
- Balance: $329.85
- Spent today: $199.94 (hit $200 daily limit)
- 182 total trades executed
- Finding 17 opportunities per scan but 0 executed (daily limit reached)
- Has settlement reconciliation built in
- MISSING: No auto fee redemption

### Polymarket Bot
- Status: ONLINE but GEOBLOCKED (403 error)
- Balance: $17.23
- Error: "Trading restricted in your region"
- Cannot trade from VDS location

## HERO Bots (VDS)
- habff-arb (BASE): ONLINE, 119+ volume trades
- hero-farm-v6 (PulseChain): ONLINE, fixed datetime bug
- hero-vets-pulse (PulseChain): ONLINE, low balance (42 HERO)

## Bot Wallet: 0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6
- Used by: habff-arb, hero-vets-pulse, hero-farm-v6
- PulseChain: 42 HERO, 196 WPLS, 272,989 PLS
- BASE: 5,000 HERO (contract), 6,377 HERO (wallet), 0.029 ETH
