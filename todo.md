# Active Todo List — Updated 2026-04-09 1800 PT

---

## VICFOUNDATION.COM — SEO & AI Visibility (HIGH PRIORITY)
- [ ] **Yoast LLM.txt Setup**: Update Yoast plugin to enable llms.txt — allows AI/LLM crawlers to understand site content. Read full guides first: https://yoast.com/how-to-optimize-content-for-llms/ and https://yoast.com/help/enable-llmstxt/
- [ ] **100% SEO Audit Score**: Target 100% on next vicfoundation.com SEO audit. Current AIVI = 24/100, only 1/5 queries found. Fix: decentralized fundraising content, purpose-driven token content, fiat fundraising content, community-driven token content
- [ ] **AI Visibility Improvement**: Citations = 9 (down 6). Positive sentiment 88%. Create content targeting the 4 unfound AIVI queries
- [ ] **Schema Markup**: Add structured data (Organization, NonProfit, Article, FAQ) for all pages
- [ ] **Sitemap & robots.txt**: Generate and submit XML sitemap, configure robots.txt
- [ ] **Core Web Vitals**: Optimize LCP, FID, CLS for all pages
- [ ] **Meta Tags**: Complete OG tags, Twitter cards, canonical URLs for all pages
- [ ] AIVI Analysis scheduled for April 16 at 0940 — will email when ready

## VICFOUNDATION.COM — Multilingual
- [ ] **Language Dropdown**: Add multilingual language selector dropdown — English, Spanish, French, German, Japanese, Korean, Chinese (Simplified), Arabic, Portuguese, Russian minimum. Use i18n framework

## VICFOUNDATION.COM — Full Rebuild (In Progress)
- [ ] Complete frontend pages (Home, About, Programs, Donate, Blog, Contact, HERO SWAP)
- [ ] Backend: CMS, blog, donation flows, email drip, AI chatbot (Grok)
- [ ] Integrate NOWPayments crypto donation widget
- [ ] SEO optimization, DNS cutover, SSL, Cloudflare configuration
- [ ] Security hardening (WAF, CSP, CORS, rate limiting, 2FA admin)
- [ ] Deploy to VPS, point DNS from GoDaddy to VPS
- [ ] Keep floating social links, back-to-top arrow, existing content/tabs
- [ ] Admin dashboard behind Cloudflare with 2FA

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

## TRADING INTEL STACK — POLYMARKET + MACRO (NEW)
- [ ] **PreReason API**: Sign up for fresh free API key at https://www.prereason.com/signup (trial key expired). Free tier = 6 briefings, 60 req/hr. Evaluate for 1 week, then decide on Basic ($19.99/mo)
- [ ] **Clone Tier 1 repos to VDS**: tradingview/lightweight-charts (14K stars), block/goose (40K stars), rtk-ai/rtk (21K stars), mortada/fredapi (1.2K stars)
- [ ] **Clone Tier 2 Polymarket repos to VDS**: ent0n29/polybot (330 stars), evan-kolberg/prediction-market-backtesting (307 stars), txbabaxyz/polyrec (141 stars), dylanpersonguy/Polymarket-Trading-Bot (132 stars)
- [ ] **Paper trade scanner strategy**: Use polymarket-paper-trader to validate "mispriced contracts >6%" Goldman quant strategy before going live
- [ ] **Set up polyrec dashboard on VDS**: Terminal UI with Chainlink oracle, Binance feed, 70+ indicators
- [ ] **Evaluate Kreo copy trading bot**: http://t.me/KreoPolyBot — tracks top wallets, auto copies. Only after paper trading validates
- [ ] **Analyze @maskache2 on Polymarket**: polymarket.com/@maskache2 — check P&L, position sizes, market selection for copy trading
- [ ] **DarkWire Intel**: SKIP for now (paywalled). Revisit when Polymarket bot is profitable. Congressional trade cross-referencing could add alpha
- [ ] **Additional repos from @kepochnik**: TauricResearch/TradingAgents, mvanhorn/last30days-skill, FiatFiorino/polymarket-assistant-tool, txbabaxyz/collectmarkets2, txbabaxyz/mlmodelpoly
- [ ] **PreReason MCP server**: Install `npx -y @prereason/mcp` on VDS for native Claude/agent tool access once API key is active

---

## OTHER
- [ ] Fix Stripe checkout.regenvalor.com DNS error
- [ ] Deployer addresses / private keys — clarify with user

---

## COMPLETED
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
