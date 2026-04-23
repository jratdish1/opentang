# VETS IN CRYPTO — Master Todo
## Updated: 2026-04-23 (Session 2)

---

## COMPLETED

### Infrastructure & Security
- [x] VDS hardened — SSH key-only, no root passwords, UFW active
- [x] VPS1 hardened — SSH key-only, Cloudflare + VDS + Tailscale only
- [x] VPS2 hardened — SSH key-only, Tailscale only, honeypot on 3306
- [x] VPS2 Postfix bound to localhost (was 0.0.0.0)
- [x] Hetzner EU hardened — SSH key-only, UFW active
- [x] All servers use key access via VDS jump host (no direct root passwords)
- [x] Security audit passed — no backdoors, no exposed secrets, no open ports
- [x] Wallet sweeper check — all wallets CLEAN, no unauthorized activity
- [x] Wallet registry created in GitHub KB (knowledge-base/wallet-registry.md)
- [x] Old compromised VPS1 ABLE wallet (0x5F1D...Dba) marked DEPRECATED

### HABFF Bot (BASE)
- [x] HABFF contract deployed on BASE (0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55)
- [x] Fee-exempt HABFF contract on HERO BASE
- [x] Fee-exempt bot wallet on HERO BASE (0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6)
- [x] HABFF bot tuned — min spread 0.5%, arb size 2000 HERO, Flashbots RPC added
- [x] Spread monitoring enabled in HABFF bot

### herobase.io
- [x] Live Activity Feed — real-time buy/sell trades from PulseChain + BASE (/live-feed)
- [x] Token Rankings Dashboard — 6 ecosystem tokens with sparklines (/rankings)
- [x] Holder Distribution — military rank tiers, server-side API proxy (/holders)
- [x] Security headers added to all new pages
- [x] Price formatting fixed (smart decimal display)
- [x] Server-side API proxy for RPC calls (CORS fix)

### Polymarket
- [x] polymarket-cli v0.1.4 installed on Hetzner EU (patched Rust compile bug)
- [x] Goldsky subgraph integration LIVE — deep wallet profiling in whale scanner
- [x] VDS polymarket-bot STOPPED (id 27) — Hetzner EU is active instance
- [x] maskache2 analyzed — weather prediction shotgun strategy, $37K+ profit

### Trading Intel
- [x] Tier 1 repos cloned to VDS (lightweight-charts, goose, rtk, fredapi, rest-clients-demo)
- [x] Tier 2 Polymarket repos cloned (polybot, polyrec, prediction-market-backtesting)
- [x] kepochnik repos cloned (TradingAgents, last30days-skill, polymarket-assistant-tool, collectmarkets2, mlmodelpoly)
- [x] polyrec dashboard set up with dependencies on VDS

### RegenValor.com
- [x] Apify scraper built and deployed to VDS (/root/regenvalor-scraper/)
- [x] Daily cron at 6 AM PST — price scraping, availability checking, competitor monitoring
- [x] Apify API token verified working (user: exotic_fly)

### Knowledge Base
- [x] PreReason API key found in KB — ACTIVE
- [x] Apify API token found in KB — verified working
- [x] Aerodrome HERO/WETH pool verified on-chain (0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20)
- [x] All duplicate todo items removed after KB verification
- [x] GitHub pushed — opentang + apex-agent repos updated

---

## REMAINING TODO

### HIGH PRIORITY — Needs User Action
- [ ] Fund VPS3 ABLE Bot with ETH gas on BASE -> Send to: 0xf293e2eA96449d7c18dE331b2aE2bb34e9B4E261
- [ ] Fund VDS HABFF/ARB Bot with WETH on BASE -> Send to: 0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6

### MEDIUM PRIORITY — Next Session
- [ ] herobase.io multilingual language dropdown (KB requirement)
- [ ] herobase.io live ticker improvements
- [ ] HERO/VETS promo videos
- [ ] VicFoundation VETS logo update
- [ ] DeFi yield strategies image for basehero.io
- [x] Set up P&L tracking for BASE HABFF bots (running every 4h)
- [x] Mirror VDS/VPS3 configs to VPS2 (backup)
- [x] Automated sync cron to VPS2 (weekly cron)


### herobase.io — New Features (from squirrels.pro analysis)
- [ ] Ecosystem Directory — PulseChain + BASE project listings with categories, search, favorites
- [ ] Live Chain Stats Widget — real-time gas, TVL, volume, block height for PulseChain + BASE
- [ ] Transaction Cost Calculator — current gas costs for swaps, approvals, transfers
- [ ] Approval Manager — view/revoke token approvals (security feature)
- [ ] DEX Pool/Volume Analytics — HERO/VETS pool stats across DEXs
- [ ] Buy & Burn Tracker — HERO burn stats with charts (if applicable)
- [ ] RNG FLOW Integration — provably fair giveaways/raffles for HERO community (T1 free tier)

### Weather Bot
- [x] Weather prediction bot v2 deployed on VDS (26 signals, 10 cities)
- [x] Weather bot switched to LIVE mode (was DRY RUN) — cron every 6h with --live flag
### LOW PRIORITY — Backlog
- [ ] Evaluate Kreo copy trading bot (requires Telegram interaction)
- [ ] DarkWire Intel (paywalled)
- [x] Build Black-Scholes Polymarket bot (polymarket-cli v0.1.4 on Hetzner EU)
- [x] Paper trade scanner strategy (running on VDS)
- [x] Stripe checkout DNS fix for regenvalor.com (CNAME added in Cloudflare)

---

## WALLET STATUS

| Wallet | Server | Address | Chain | Balance | Status |
|--------|--------|---------|-------|---------|--------|
| VPS3 ABLE Bot (NEW) | VPS3 | 0xf293e2eA96449d7c18dE331b2aE2bb34e9B4E261 | BASE+PLS | 0.017 ETH, 22.4M PLS | NEEDS ETH GAS |
| VDS HABFF/ARB | VDS | 0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6 | BASE+PLS | 0.019 ETH, 272K PLS | NEEDS WETH |
| HABFF Contract | VDS | 0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55 | BASE | Fee Exempt | ACTIVE |
| Polymarket Bot | Hetzner | 0xB6841Ca4442CEF39863F413f84AeEc027077343c | Polygon | — | ACTIVE |
| VPS1 ABLE (OLD) | VPS1 | 0x5F1D1af1EbA90FD4A29e194275c6DfA42f4E7Dba | BASE+PLS | 0.0001 ETH | COMPROMISED |

## ACTIVE BOT FLEET: 15 bots across 5 servers — all green
