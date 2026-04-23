# VETS IN CRYPTO — Master Todo
**Last Updated**: 2026-04-23 (Session 2 continuation)

---

## VIC FOUNDATION — Full Rebuild (React)
- [ ] Complete frontend pages (Home, About, Programs, Donate, Blog, Contact, HERO SWAP)
- [ ] Backend: CMS, blog, donation flows, email drip, AI chatbot (Grok)
- [ ] Integrate NOWPayments crypto donation widget
- [ ] SEO optimization, DNS cutover, SSL, Cloudflare configuration
- [ ] Security hardening (WAF, CSP, CORS, rate limiting, 2FA admin)
- [ ] Deploy to VPS, point DNS from GoDaddy to VPS
- [ ] Keep floating social links, back-to-top arrow, existing content/tabs
- [ ] Admin dashboard behind Cloudflare with 2FA
- [ ] **VETS IN CRYPTO logo update** (replace HERO logo — low priority, user will do later)

## VICFOUNDATION.COM — WordPress (Interim)
- [ ] Upload BB Themer (1.2MB) and BB Theme (1.1MB) to WP admin
- [ ] BB Plugin (11MB) blocked by GoDaddy nginx upload limit — need workaround

---

## HEROBASE.IO — Multilingual
- [ ] **Language Dropdown**: Add multilingual language selector dropdown — same language set as vicfoundation.com. Must work with chain toggle (PLS/BASE)

## HEROBASE.IO — Live Tickers
- [ ] PulseChain ticker: Add EMIT (LP: 0x1d05cc449b643633b013cbfb939e70cc0d37f2a3), RHINO (LP: 0x8e030e42fb8d7e1f21e827cea2fb91325f3f6b00), TruFarm (LP: 0x086524a37deba61e08dc948ff677327de4a5150d)
- [ ] BASE ticker: Add HERO (0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8), WETH (0x4200000000000000000000000000000000000006), BRETT, AERO (0x940181a94A35A4569E4529A3CDfB74e38FD98631), jesse (0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59)

## HEROBASE.IO — Features
- [ ] Intro video overlay (homepage modal, cookie-based, one-time) → skip → beta disclaimer → accept → enter site
- [ ] Community Hub: Add https://double.trudefi.io/ link with TruFarm logo between Media Hub title and upload button
- [ ] Media Hub: Upload provided photos into appropriate categories
- [ ] Dashboard chain toggle: ALL stats/tokens/prices switch natively per chain (PLS/BASE)
- [ ] NFT Carousels: Wire Military Rank + First Responder collections, pause on hover
- [ ] Tokenomics: Replace rotating circle with IMG_7109.png
- [ ] Purge Cloudflare cache after all changes

---

## MINING DASHBOARD
- [x] Clock fix: Intl.DateTimeFormat America/Los_Angeles, 24hr military time
- [x] Schedule times in military format (1700, 2000, 0700, 1000)
- [x] Full Autonomy Checklist (14 items all checked)
- [ ] Verify scheduled tasks are firing per schedule dashboard configuration
- [ ] Confirm clock fix displays correctly after login

---

## INFRASTRUCTURE
- [ ] Regain SSH access to VPS1 (62.146.175.67) — fail2ban blocking sandbox IP
- [ ] Regain SSH access to VPS2 (85.239.239.206) — fail2ban blocking sandbox IP
- [ ] Try Tailscale VPN tunnel as SSH bypass
- [ ] Try Contabo VNC console as fallback

---

## TRADING BOTS & INFRASTRUCTURE

### Polymarket Bot (Hetzner EU)
- [x] polymarket-cli v0.1.4 installed on Hetzner EU (patched Rust compile error, binary at /root/.cargo/bin/polymarket)
- [x] Goldsky subgraph integration LIVE — deep wallet profiling, smart money flow, confidence scoring
- [x] Whale scanner FIXED: /v1/leaderboard URL + proxyWallet field
- [x] Multi-agent consensus filter (quant + whale + microstructure)
- [x] Early exit / profit-taking / trailing stop
- [x] Market microstructure scoring
- [x] $1,000/day spend cap with autoscale (60% balance, min $100, max $1K)
- [x] USDC.e auto-refill wired (Uniswap V3 SwapRouter02)
- [x] Daily trading report to Telegram every 4h with 🟢🟡🔴 traffic lights
- [x] Stopped geo-blocked bot on VDS (Hetzner EU is active)
- [ ] **PreReason API**: Sign up for fresh free API key at https://www.prereason.com/signup (trial key expired)
- [ ] **Paper trade scanner strategy**: Validate "mispriced contracts >6%" Goldman quant strategy
- [ ] **Evaluate Kreo copy trading bot**: http://t.me/KreoPolyBot
- [ ] **Analyze @maskache2 on Polymarket**: polymarket.com/@maskache2

### HABFF Contract (BASE mainnet)
- [x] Contract DEPLOYED: 0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55
- [x] Dual-router (Uniswap V2 + Aerodrome), atomic cross-DEX arb
- [x] 5,000 HERO loaded, all 4 approvals on-chain
- [x] Arb bot LIVE on VDS (volume trades via wallet, cross-DEX arb via contract, fires at >1.5% spread)
- [x] P&L tracker deployed (cron every 4h → Telegram)
- [ ] **FEE EXEMPTION NEEDED** (USER ACTION): Add 0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55 to HERO token's exempt list on BASE

### Other Bots
- [x] CoinGecko API key locked in across all 5 servers
- [x] VPS2 mirror deployed (cron every 6h syncing bot configs from VDS)
- [x] LarryBrain evaluated: VERDICT = SKIP IT ($29.99/month not worth it)
- [x] Portfolio: ~$1,902.60 (Kraken $1,510.70 + Kalshi $381.10 + Polymarket)

---

## TRADING INTEL STACK — POLYMARKET + MACRO
- [ ] **Clone Tier 1 repos to VDS**: tradingview/lightweight-charts, block/goose, rtk-ai/rtk, mortada/fredapi
- [ ] **Clone Tier 2 Polymarket repos to VDS**: ent0n29/polybot, evan-kolberg/prediction-market-backtesting, txbabaxyz/polyrec, dylanpersonguy/Polymarket-Trading-Bot
- [ ] **Set up polyrec dashboard on VDS**: Terminal UI with Chainlink oracle, Binance feed, 70+ indicators
- [ ] **DarkWire Intel**: SKIP for now (paywalled). Revisit when profitable
- [ ] **Additional repos from @kepochnik**: TauricResearch/TradingAgents, mvanhorn/last30days-skill, FiatFiorino/polymarket-assistant-tool, txbabaxyz/collectmarkets2, txbabaxyz/mlmodelpoly
- [ ] **PreReason MCP server**: Install `npx -y @prereason/mcp` on VDS once API key is active

---

## PROMOTIONAL CONTENT
- [ ] **HERO/VETS promotional videos** — build short promo content for HERO token and VETS IN CRYPTO brand
- [ ] Deploy promo content to herobase.io and vicfoundation.com

---

## OTHER
- [ ] Fix Stripe checkout.regenvalor.com DNS error
- [ ] Deployer addresses / private keys — clarify with user

---

## COMPLETED (This Session — Apr 22-23, 2026)
- [x] AT Foam DNS migration to VPS2 verified, Grok AI chatbot tested end-to-end
- [x] VPS2 nginx hardened (rate limiting, security headers, attack path blocking)
- [x] CoinGecko API key locked in across all 5 servers
- [x] Stopped geo-blocked Polymarket bot on VDS (Hetzner EU is active)
- [x] Daily trading report verified sending to Telegram every 4h
- [x] Portfolio confirmed: ~$1,902.60
- [x] herobase.io: all 7 fixes verified (Boot Camp, TRU Farm, EMIT Farm, Manus removed, Switch Aggregator, LiveTicker mobile, bouncing logo)
- [x] GitHub set as master fallback KB (apex-agent + opentang repos)
- [x] USDC.e funded: $51.47 USDC via Kraken mobile → Polygon wallet
- [x] $1,000/day spend cap confirmed with autoscale
- [x] Polymarket bot upgraded: whale tracking, multi-agent consensus, early exit, microstructure scoring
- [x] Polymarket whale scanner FIXED: URL /v1/leaderboard + proxyWallet field
- [x] HABFF Contract DEPLOYED on BASE with dual-router arb
- [x] HABFF Arb Bot LIVE on VDS
- [x] HABFF P&L tracker deployed (cron every 4h → Telegram)
- [x] VPS2 mirror deployed (cron every 6h)
- [x] LarryBrain evaluated: SKIP IT
- [x] All items pushed to GitHub (apex-agent + opentang repos)
- [x] **polymarket-cli v0.1.4 installed on Hetzner EU** (patched Option<NaiveDate> compile error)
- [x] **Goldsky subgraph integration LIVE** — deep wallet profiling + smart money flow + consensus boost
- [x] **Goldsky module deployed to Hetzner EU + VDS** (goldsky_whale_analysis.py)
- [x] **poly_upgrades.py patched** with Goldsky import, enhanced whale scan, consensus boost, status check

## COMPLETED (Previous Sessions)
- [x] Fix BASE chain getMarketOverview bug (deployed to VPS1)
- [x] Upload intro video to VPS1 (52MB)
- [x] Upload 175 photos to VPS1 media-gallery
- [x] MARPAT camo theme injected on vicfoundation.com via Cloudflare Worker
- [x] SquirrelSwap widget fixed on herobase.io/swap (Cloudflare CSP rule)
- [x] at-foam.com email verified and test sent to jake@at-foam.com
- [x] Beaver Builder Starter license purchased ($89/yr)
- [x] VIC Foundation design brief completed
- [x] Mining dashboard clock fix deployed (checkpoint v59245110)
- [x] DEX Screener contract addresses compiled for all LP tickers
- [x] herobase.io code changes document prepped
