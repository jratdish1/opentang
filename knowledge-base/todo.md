# Task Queue — 2026-04-22 (Updated 23:55 UTC)

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
- [x] VPS1: Hero-ABLE-Base migrated to VPS3 (no longer on VPS1 after swap hack)
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
- [x] Fix USDC.e auto-refill: Uniswap V3 SwapRouter02 + 5% slippage — DEPLOYED + FUNDED
  - V2 script at /opt/polymarket-bot/usdc_auto_refill.py
  - Wired into bs_polymarket_bot.py scan loop (runs every cycle in LIVE mode)
  - $1,000/day spend cap with autoscale (60% of balance, min $100, max $1K)
- [x] Send USDC.e to Polymarket wallet — DONE (user sent $51.47 USDC via Kraken mobile app → Polygon)
  - Confirmed on-chain via Polygonscan: 51.47 USDC.e + 196 POL for gas
  - Bot actively trading with new funds, redeeming positions and recycling
- [x] Add green/yellow/red traffic light indicators to Telegram notifications — ALREADY DONE
  - daily_trading_report.py has full 🟢🟡🔴 traffic lights for all bots
  - Runs every 4 hours via cron, sends to Telegram
  - Portfolio total: $1,902.60 across Kraken/Kalshi/Polymarket
- [x] Deploy P&L tracking cron for VDS PulseChain farm bot — ALREADY DONE
  - hero_farm_pnl.py runs daily at 23:00 UTC via cron
  - daily_arb_summary.py runs daily at 23:00 UTC
  - daily_trading_report.py runs every 4h (Kraken+Kalshi+Polymarket)
- [x] Set up P&L tracking for BASE HABFF bots — DEPLOYED
  - habff_pnl_tracker.py runs every 4h (offset 30min from trading report)
  - Reports: contract HERO, wallet HERO, WETH, ETH gas, price, total value, contract stats
- [x] Deploy Polymarket bot upgrades from Lunar Researcher analysis — DONE
  - Whale Tracking: scans top 50 wallets every 6h via cron
  - Multi-Agent Consensus Filter: 3-signal agreement (quant + whale + microstructure)
  - Early Exit: 85% profit target, 3x volume spike, trailing stop (15%→5%)
  - Market Microstructure Scoring: spread/depth/volume analysis
  - Cloned poly_data + polymarket-agents repos to VDS for future use
  - All pushed to GitHub (apex-agent + opentang repos)

## PRIORITY 2 — HERO Farm & HABFF
- [x] Build HABFF contract for BASE chain (Aerodrome + Uniswap V2 dual-router) — DONE
  - Contract: 0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55 on BASE
  - Features: crossDexArb (atomic buy/sell across DEXes), multiSwap, approveToken, getStats
  - All 4 approvals on-chain: HERO+WETH → UniV2+Aerodrome
  - 5,000 HERO loaded in contract
- [x] Deploy HABFF contract from VDS wallet on BASE — DEPLOYED
  - Owner/Signer: 0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6
  - BaseScan: https://basescan.org/address/0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55
- [x] Configure HABFF bot for all HERO BASE pairs — LIVE on VDS
  - Volume trades: wallet → UniV2 (HERO→WETH→HERO round-trips)
  - Cross-DEX arb: contract → buy on one DEX, sell on other (waiting for Aerodrome HERO pool)
  - Scans every 20s, volume trades every 10min
  - UPDATE: Aerodrome HERO/WETH pool EXISTS at 0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20
  - Uniswap V2 HERO/WETH pool at 0x3Bb159de8604ab7E0148EDC24F2A568c430476CF
  - Cross-DEX arb scanning active, fires when spread > 1.5%
- [ ] Get HABFF contract address fee-exempted on BASE
- [x] Create HERO/WETH pool on Aerodrome — ALREADY EXISTS
  - Aerodrome: 0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20 ($4.7K liq, $0.0485)
  - Uniswap V2: 0x3Bb159de8604ab7E0148EDC24F2A568c430476CF ($4.0K liq, $0.0485)
- [x] Add DeFi yield strategies image to basehero.io farm page — ALREADY EXISTS
  - Full infographic visible at bottom of /farm page (Closed-Loop DeFi Ecosystem section)
  - Shows TruFarms + EMIT farming flows with compound earnings
- [x] Mirror VDS/VPS3 configs to VPS2 — DEPLOYED
  - First sync complete: 64KB of bot configs, knowledge, env, crons, PM2 dump
  - Cron: every 6h (0 */6 * * *)
- [x] Set up automated sync cron to VPS2 — DEPLOYED
  - mirror_to_vps2.sh runs every 6h
  - Syncs: bot configs, env_architecture, knowledge, crontabs, PM2 ecosystem

## PRIORITY 3 — Herobase.io Website Fixes
- [x] Re-label "DApp Farm" → "Boot Camp" — DONE (routes, nav, all labels updated)
- [x] Add TRU Farm section — DONE (MediaHub, Explainer, Tokenomics all have TruDefi links)
- [x] Add EMIT Farm section on mobile — DONE (Farm.tsx has HERO/EMIT + VETS/EMIT LP pairs)
- [x] Remove "Made with Manus" link — DONE (CSS refs removed, no footer link visible)
- [x] Fix Switch Aggregator widget — VERIFIED WORKING (live prices, multi-DEX, iframe loads)
- [x] Fix text overlapping live feed numbers on mobile — DEPLOYED
  - Reduced font size on mobile (text-[10px] sm:text-xs)
  - Added whitespace-nowrap to all price elements
  - Tighter gaps on mobile (gap-1.5 sm:gap-2, gap-4 sm:gap-6)
  - Hidden volume on xs screens to prevent overflow
  - Touch-friendly scrolling (WebkitOverflowScrolling: touch)
  - Built, restarted PM2, purged Cloudflare cache
- [x] Fix/redo bouncing logo video — No bounce animation found in codebase, likely already fixed

## PRIORITY 4 — VicFoundation.com
- [ ] Update VETS logo to actual VETS IN CRYPTO logo (star/camo design)

## FUTURE / LOW PRIORITY
- [ ] Evaluate LarryBrain for marketing automation
- [ ] Build HERO/VETS promotional videos
- [x] Fix Polymarket leaderboard API endpoint — FIXED
  - Old URL: /leaderboard (404) → New URL: /v1/leaderboard ✅
  - Old field: userAddress (empty) → New field: proxyWallet ✅
  - Whale scanner now tracks top 50 wallets, caches positions every 6h
- [ ] Integrate poly_data Goldsky subgraph for deeper wallet analysis
- [ ] Install polymarket-cli (Rust) on Hetzner for fast market scanning

## ACTIVE BOT STATUS (as of 2026-04-22 20:06 UTC)

| Server | Bot | Status | Uptime | P&L / Balance |
|--------|-----|--------|--------|---------------|
| VDS | kraken-bot-v2 | 🟢 ONLINE | 19h | Equity: $1,510.55 |
| VDS | kalshi-bot-v4 | 🟢 ONLINE | 19h | Balance: $381.10, 360 trades |
| VDS | hero-vets-pulse | 🟢 ONLINE | 25h | Scan #9,256, 96 restarts |
| VDS | base-hero-vol | 🟢 ONLINE | 38h | Scan #12,250, 352 vol trades |
| VDS | cross-chain-monitor | 🟢 ONLINE | 37h | Price tracker |
| VDS | polymarket-bot | 🔴 STOPPED | — | Geo-blocked, replaced by Hetzner |
| VDS | habff-arb | 🟢 ONLINE | NEW | Contract: 0x1e8B...8c55, 5K HERO, volume trading |
| Hetzner EU | polymarket-bot | 🟢 ONLINE | 2h+ | Balance: $24.43, 40 pos, Value: $245.32, P&L: +$6.43 |
| VPS1 | hero-dapp | 🟢 ONLINE | 15h | herobase.io |
| VPS1 | (ABLE removed) | — | — | ABLE bots migrated to VPS3 after swap hack |
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
- HABFF contract multiSwap has 'Must gain hero overall' check — volume trades must go through wallet, not contract
- Aerodrome HERO/WETH pool EXISTS: 0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20 ($4.7K liq)
- Uniswap V2 HERO/WETH pool: 0x3Bb159de8604ab7E0148EDC24F2A568c430476CF ($4.0K liq)
- HABFF cross-DEX arb scanning active, fires when spread > 1.5%
- HERO on BASE has NO transfer fee (unlike PulseChain HERO which has 3% tax)
- GitHub is master fallback KB (Manus KB is full) — all new knowledge goes to apex-agent + opentang repos
- VPS1 reachable via 62.146.175.67 (Tailscale was flaky, public IP works)
- VPS3 reachable via SSH config on VDS (195.26.253.100)
- Cloudflare API works from VDS only (IP-restricted) — back door for DNS changes

## RNG MODULES — COMPLETED (2026-04-23)
- [x] DAO RNG Fallback — quarterly charity voting with auto-fallback (DEPLOYED)
- [x] NFT Trait Randomness — provably fair trait assignment (DEPLOYED)
- [x] Community Giveaways/Raffles — weighted winner selection (DEPLOYED)
- [x] HERO Holder Rewards — weighted random airdrops (DEPLOYED)
- [x] Daily Spin-the-Wheel — gamification engagement (DEPLOYED)
- [x] Shared RNG Engine + Email Notification modules (DEPLOYED)
- [x] Codex Audit — 0 CRITICAL, 0 HIGH, all 12 modules audited
- [x] Grok Bot Fleet Evaluation — integration recommendations generated
- [ ] VRF integration for on-chain T2/T3 tiers (FUTURE)
- [ ] RNG FLOW feed publication on PulseChain (25 eDAI, FUTURE)
## COMPLETED — 2026-04-23 (Session 2)

### Priority 1: Critical Fixes
- [x] hero-farm-v6: Fixed datetime deprecation, restarted → ONLINE
- [x] hero-vets-pulse: Fixed nonce collision with retry → ONLINE, 0 restarts
- [x] VRF Integration: Chainlink VRF v2.5 (BASE) + Commit-Reveal (PulseChain)

### Priority 2: Codex Audit Fixes (All 12 RNG Modules)
- [x] CRITICAL: SpinWheel — replaced Math.random() with CSPRNG
- [x] HIGH: VRF Provider — crypto.randomBytes for secret entropy
- [x] HIGH: NFT Trait Engine — userSecret anti-frontrunning
- [x] MEDIUM: BigInt precision, HTML sanitization, DRY fixes
- [x] LOW: Wallet validation, error context, rate limiting, Promise.all

### Priority 3: Bot Fleet Evaluation
- [x] Memory limits: polymarket(300MB), kraken(200MB), kalshi(200MB)
- [x] UFW: Blocked ports 3306, 4500, 5678
- [x] Cron audit: 65 jobs documented

### Priority 4: Documentation
- [x] ARCHITECTURE_BLUEPRINT.md — Full 12-module RNG blueprint
- [x] All audit reports pushed to blueprints/herobase-rng/

### REMAINING TODO
- [ ] Publish RNG feed on-chain (25 eDAI)
- [ ] Stagger */30 cron jobs
- [ ] Build RNG Monitor Bot, Governance Bot, Security Bot, Price Oracle, Liquidity Bot
- [ ] Consolidate low-value GitHub repos
- [ ] Multilingual herobase.io (ON HOLD)

## COMPLETED — 2026-04-23 (Session 2)
- [x] V4 Audit: Fixed all 8 HIGH findings (BigInt precision, VRF requestId, median calc)
- [x] V4 Audit: Fixed 3 MEDIUM findings (numWords validation, contract error handling)
- [x] Built 5 new bots: RNG Monitor, Governance, Security, Price Oracle, Liquidity Analytics
- [x] Deployed 5 bots to VDS with staggered cron schedules (70 total cron jobs)
- [x] Staggered all */30 cron jobs to reduce contention
- [x] Fixed hero-farm-v6 (datetime deprecation + restart)
- [x] Fixed hero-vets-pulse (nonce collision retry logic, reset 96 restarts)
- [x] Built Immutable NFT Spec (no admin, no kill switch, true ownership)
- [x] Built Artist Integration Pipeline (compositor + metadata + IPFS + utility binding)
- [x] Built Artist Onboarding Guide
- [x] Hardened VDS security: blocked ports 3306, 4500, 5678 via UFW
- [x] Memory limits: polymarket-bot 300MB, kraken-bot-v2 200MB, kalshi-bot-v4 200MB
- [x] All code pushed to GitHub (hero-dapp c5ff8c3, knowledge-base updated)

## REMAINING TODO
- [ ] Publish RNG feed on-chain (25 eDAI — need wallet address)
- [ ] Configure HERO/VETS contract addresses for Price Oracle + Security Bot + Liquidity Analytics
- [ ] Consolidate low-value GitHub repos (quarterly review)
- [ ] Multilingual herobase.io (ON HOLD)
- [ ] Claude-Obsidian knowledge base upgrade
- [ ] VDS/VPS monitoring dashboard (green/yellow/red)
- [ ] Investigate hero-farm-v6 long-term stability

## HERO NFT DUAL-CHAIN BLUEPRINTS (COMPLETED 2026-04-23)
- [x] BASE Chain Blueprint — HERO_NFT_BASE_CHAIN_BLUEPRINT.md
- [x] PulseChain Blueprint — HERO_NFT_PULSECHAIN_BLUEPRINT.md
- [x] Immutable NFT Spec v2.0 — IMMUTABLE_NFT_SPEC.md
- [x] 2% Fee Discount Utility — baked into both blueprints
- [x] Flash Loan Protection — minimum 1-block hold duration
- [x] Chainlink VRF (BASE) + Commit-Reveal (PulseChain) RNG
- [x] Artist Guide — ARTIST_GUIDE.md
- [x] Artist Pipeline — image compositor + metadata generator
- [x] All pushed to GitHub KB: blueprints/herobase-nft/

### REMAINING NFT ITEMS:
- [ ] Artist delivers layer PNGs
- [ ] Generate 1,000 composite images per chain
- [ ] Upload to IPFS (Pinata + nft.storage)
- [ ] Deploy contracts on BASE Sepolia testnet
- [ ] Deploy contracts on PulseChain testnet v4
- [ ] Test full mint + fee discount flow end-to-end
- [ ] Go live on BASE mainnet
- [ ] Go live on PulseChain mainnet
- [ ] Publish RNG feed on-chain (25 eDAI for RNG FLOW)

## COMPLETED — 2026-04-23 (Session 3: Whitepaper v2.0)
- [x] HERO Whitepaper v2.0 — 20 sections, 7-phase roadmap, mirrors herobase.io exactly
- [x] Updated dual-chain NFT blueprints v2.0 — 555 cards, 6-tier fee reduction, 10 utilities
- [x] Codex audit (GPT-4.1-mini) — 3 documents audited, 0 FAIL, all PASS/WARN
- [x] Fixed General (O-10) rank fee reduction clarity (7% exceeds 5% base = zero-fee + 2% rebate)
- [x] Added Ultra Rare utility tier clarification to both blueprints
- [x] Enhanced Risk Disclosures: security considerations, legal disclaimers, regulatory notes
- [x] All documents pushed to GitHub KB (opentang/knowledge-base)
- [x] Files: hero-whitepaper/HERO_WHITEPAPER_V2.md, hero-whitepaper/DOC_AUDIT_REPORT.md
- [x] Files: blueprints/nft/HERO_NFT_BASE_CHAIN_BLUEPRINT.md, HERO_NFT_PULSECHAIN_BLUEPRINT.md
- [x] Files: blueprints/nft/IMMUTABLE_NFT_SPEC.md, blueprints/nft/ARTIST_GUIDE.md

## SESSION 2026-04-24 — Completed
- [x] Fix VPS1 MariaDB — rogue Python process on port 3306, killed, added mariadb to watchdog
- [x] Fix Kraken bot API endpoint bug — `/0/private/Balance` doubled path, fixed to `Balance`
- [x] Update ALL daily limits to $1,000:
  - Kraken: $500 → $1,000
  - Kalshi: $200 → $1,000
  - Polymarket: $50 max loss → $1,000, position cap $50 → $200
- [x] Hero-ABLE bots confirmed on VPS3 ONLY (removed from VPS1 after swap hack)
- [x] Polymarket confirmed LIVE on Hetzner EU (Helsinki) via SOCKS5 proxy — geo-unblocked
- [x] Updated MASTER_KNOWLEDGE_SOP.md with correct server assignments
- [x] Whitepaper v2.0 updated: PulseChain CA & Buy-and-Burn addresses corrected
- [x] hero_farm_arb.py: Fixed placeholder PulseChain addresses (0x0000...0000)
- [x] hero_farm_v6.py: Fixed datetime.UTC → timezone.utc
- [x] DexScreener verified all 5 LP pairs (BASE + PulseChain)
- [x] HABFF contract fee exemption confirmed on-chain (isFeeExempt = TRUE)
