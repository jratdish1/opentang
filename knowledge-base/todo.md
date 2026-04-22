# Task Queue — 2026-04-22 (Updated 20:10 UTC)

## COMPLETED (Archived)
- [x] Fix default swap output token from NUTS to HERO in Swap.tsx
- [x] Get BASE ABLE Bot contract/wallet address for ETH refill → `0x5F1D1af1EbA90FD4A29e194275c6DfA42f4E7Dba`
- [x] Copy floating social media bar from vicfoundation.com to herobase.io
- [x] Rebuild, deploy, purge Cloudflare cache
- [x] Verify ABLE bot ETH receipt and restart bots on VPS1
- [x] Store Kalshi API credentials on all 3 servers
- [x] Build and deploy Kalshi trading bot on VDS — LIVE, placing trades
- [x] Store Kraken API credentials on all 3 servers
- [x] Build and deploy Kraken trading bot on VDS — LIVE
- [x] Generate Polygon wallet for Polymarket → `0xB6841Ca4442CEF39863F413f84AeEc027077343c`
- [x] Swap 195 USDC → 194.97 USDC.e on Polygon for Polymarket
- [x] Deploy Polymarket bot — LIVE on Hetzner EU
- [x] Full SEO audit on herobase.io — all 8 fix items complete
- [x] Create reusable click-through audit Manus Skill
- [x] Server architecture blueprints for VDS, VPS1, VPS2
- [x] AvantLink affiliate verification for regenvalor.com — CONFIRMED
- [x] regenvalor.com: Disable shopping cart, remove banner, affiliate links, save-for-later hearts
- [x] Edit explainer video: replace H shield frames with soldier logo
- [x] herobase.io: SEO fixes, CDN migration, www redirect, x-powered-by removal
- [x] Deploy Hero Farm V3 bot on VDS (PulseChain, direct DEX arb)
- [x] Harden VPS3 (UFW, fail2ban, SSH key-only)
- [x] Migrate ABLE bots from VPS1 to VPS3
- [x] Security audit all 3 servers
- [x] Fix SSH rate limiting on VDS (maxretry 50, bantime 30s)
- [x] Deploy new HeroABLE contract: 0x79165277Cf56ce8Dd56E596cEA9921E9D6484353
- [x] Deploy arb + volume bots on VDS, VPS1, VPS2, VPS3 — ALL online
- [x] Build cross-chain price monitor (PulseChain HERO vs BASE HERO)
- [x] Push all bot code to GitHub (jratdish1/apex-agent)
- [x] Funded BASE wallet: 0.04 WETH + 547K HERO + 0.025 ETH gas
- [x] Funded PulseChain wallet: 200K WPLS + 8,835 HERO + 73 VETS
- [x] Fix Kraken bot syntax error — running 19h+ fine
- [x] Build permanent Polymarket auto-redemption (claim resolved positions via CLOB API)
- [x] Build auto-withdrawal from CLOB back to wallet
- [x] Fix Polymarket STATE_FILE path, position sync, $10 balance floor
- [x] Recover $401.85 from unredeemed positions
- [x] Deploy permanent auto-redeem cron (every 30 min)
- [x] Fix RPC rotation in live_trader.py balance refresh
- [x] **MIGRATE Polymarket CLOB bot to Hetzner EU** — LIVE, 40 positions, $237.70 value, P&L +$7.90
  - Stopped geo-blocked VDS instance (was wasting resources with 403 errors)
  - Hetzner EU (91.107.196.191) is the active Polymarket bot via SOCKS5 proxy
- [x] AT Foam DNS migration to VPS2 — COMPLETE, Grok AI chatbot verified working
- [x] AT Foam nginx hardening — rate limiting, security headers, attack path blocking
- [x] VPS2 is BACK ONLINE — all services running (atfoam-api, regen-valor, valor-peptides, hero bots)

## PENDING — FUNDING NEEDED (User Action)
- [ ] VPS1: Hero-ABLE-Base needs ETH on BASE for gas (only 0.0001 ETH)
- [ ] VDS: hero-arb-bot needs WETH funding before restart

## PRIORITY 1 — Trading Bot Tasks
- [x] Configure MLB bets — MLB already in tradeable_keywords, bot actively trading MLB markets (e.g. mlb-tor-laa totals)
- [x] Research MLB and high-probability bets — Polymarket handles sports (MLB/NBA/NFL), Kalshi handles financial/economic/weather
- [x] Expand Polymarket positions from 20→40 — DONE, bot at 40/40 positions, $237.70 value
- [x] Evaluate CoinGecko API pricing + integrate across all bots
- [x] Lock in CoinGecko API KEY across all servers — DONE (VDS, VPS1, VPS2, VPS3, Hetzner EU)
- [x] Design hybrid Polymarket/Kalshi diversification strategy — DONE
  - Polymarket: Sports (MLB/NBA/NFL), Geopolitics (0% fee), Crypto, Politics
  - Kalshi: Financial markets, economic events, weather, policy (no sports)
  - APEX Blueprint: 4-bot fleet (SENTINEL/ORACLE/ATLAS/SCOUT) documented
- [ ] Fix USDC.e auto-refill: Switch to Uniswap V3 SwapRouter02 + 5% slippage
- [ ] Send USDC.e via Kraken API (Polygon network) to Polymarket wallet
- [x] Add green/yellow/red traffic light indicators to Telegram notifications — ALREADY DONE
  - daily_trading_report.py has full 🟢🟡🔴 traffic lights for all bots
  - Runs every 4 hours via cron, sends to Telegram
  - Portfolio total: $1,902.60 across Kraken/Kalshi/Polymarket
- [x] Deploy P&L tracking cron for VDS PulseChain farm bot — ALREADY DONE
  - hero_farm_pnl.py runs daily at 23:00 UTC via cron
  - daily_arb_summary.py runs daily at 23:00 UTC
  - daily_trading_report.py runs every 4h (Kraken+Kalshi+Polymarket)
- [ ] Set up P&L tracking for BASE HABFF bots

## PRIORITY 2 — HERO Farm & HABFF
- [ ] Build HABFF contract for BASE chain (Aerodrome + Uniswap)
- [ ] Deploy HABFF contract from VDS wallet on BASE
- [ ] Configure HABFF bot for all HERO BASE pairs
- [ ] Get HABFF contract address fee-exempted on BASE
- [ ] Add DeFi yield strategies image to basehero.io farm page
- [ ] Mirror VDS/VPS3 configs to VPS2 (belt & suspenders backup)
- [ ] Set up automated sync cron to VPS2

## PRIORITY 3 — Herobase.io Website Fixes
- [ ] Re-label "DApp Farm" → "Boot Camp"
- [ ] Add TRU Farm section with link to https://double.trudefi.io/
- [ ] Add EMIT Farm section on mobile display
- [ ] Remove "Made with Manus" link from all sites
- [ ] Fix Switch Aggregator widget on swap page
- [ ] Fix text overlapping live feed numbers on mobile
- [ ] Fix/redo bouncing logo video

## PRIORITY 4 — VicFoundation.com
- [ ] Update VETS logo to actual VETS IN CRYPTO logo (star/camo design)

## FUTURE / LOW PRIORITY
- [ ] Evaluate LarryBrain for marketing automation
- [ ] Build HERO/VETS promotional videos

## ACTIVE BOT STATUS (as of 2026-04-22 20:06 UTC)

| Server | Bot | Status | Uptime | P&L / Balance |
|--------|-----|--------|--------|---------------|
| VDS | kraken-bot-v2 | 🟢 ONLINE | 19h | Equity: $1,510.55 |
| VDS | kalshi-bot-v4 | 🟢 ONLINE | 19h | Balance: $381.10, 360 trades |
| VDS | hero-vets-pulse | 🟢 ONLINE | 25h | Scan #9,256, 96 restarts |
| VDS | base-hero-vol | 🟢 ONLINE | 38h | Scan #12,250, 352 vol trades |
| VDS | cross-chain-monitor | 🟢 ONLINE | 37h | Price tracker |
| VDS | polymarket-bot | 🔴 STOPPED | — | Geo-blocked, replaced by Hetzner |
| Hetzner EU | polymarket-bot | 🟢 ONLINE | 91m | Balance: $10.80, 40 pos, Value: $237.70, P&L: +$7.90 |
| VPS1 | hero-dapp | 🟢 ONLINE | 15h | herobase.io |
| VPS1 | Hero-ABLE + Base | 🟢 ONLINE | 14h | ABLE bots |
| VPS1 | hero-vets-pulse | 🟢 ONLINE | 19h | Backup |
| VPS1 | base-hero-vol | 🟢 ONLINE | 19h | Backup |
| VPS2 | atfoam-api | 🟢 ONLINE | 70m | at-foam.com chatbot |
| VPS2 | hero-vets-pulse | 🟢 ONLINE | 19h | Backup |
| VPS2 | base-hero-vol | 🟢 ONLINE | 19h | Backup |
| VPS3 | Hero-ABLE + Base | 🟢 ONLINE | 19h | Primary ABLE bots |
| VPS3 | hero-vets-pulse | 🟢 ONLINE | 19h | Backup |
| VPS3 | base-hero-vol | 🟢 ONLINE | 19h | Backup |
| VPS3 | trade-logger-pls/base | 🟢 ONLINE | 19h | Trade logging |

## NOTES
- Polymarket active on Hetzner EU only (VDS instance stopped — was geo-blocked)
- Kraken bot live without 24hr paper trading per user directive
- HERO is fee-on-transfer token — use swapExactTokensForTokensSupportingFeeOnTransferTokens
- Only HERO/VETS are fee-exempt for our wallet — focus arb on these tokens only
- PulseChain gas: always use 2M gwei custom gas
- BASE gas: auto (standard)
- Aerodrome getAmountsOut broken for fee-on-transfer tokens — use direct reserve reads
- VPS1 reachable via 62.146.175.67 (Tailscale was flaky, public IP works)
- VPS3 reachable via SSH config on VDS (195.26.253.100)
- Cloudflare API works from VDS only (IP-restricted) — back door for DNS changes
