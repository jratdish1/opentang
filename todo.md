# VETS IN CRYPTO - Master TODO
## Last Updated: Apr 23, 2026

---

## COMPLETED ✅

- [x] Deploy HABFF contract on BASE (HABFF.sol)
- [x] Fee-exempt HABFF contract on HERO BASE (`0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55`)
- [x] Fee-exempt bot wallet on HERO BASE (`0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6`)
- [x] HABFF arb bot tuned (spread 0.5%, size 2000, Flashbots RPC)
- [x] herobase.io Live Activity Feed (`/live-feed`)
- [x] herobase.io Token Rankings Dashboard (`/rankings`)
- [x] herobase.io Holder Distribution with military ranks (`/holders`)
- [x] herobase.io security audit + hardening (CSP headers, XSS sanitization)
- [x] herobase.io updated pages deployed to VPS1
- [x] Goldsky subgraph integration for Polymarket whale scanner
- [x] polymarket-cli v0.1.4 installed on Hetzner EU (patched Rust compile bug)
- [x] Clone Tier 1 repos to VDS (lightweight-charts, goose, rtk, fredapi, rest-clients-demo)
- [x] Clone Tier 2 Polymarket repos to VDS (polybot, polyrec, prediction-market-backtesting)
- [x] Clone @kepochnik repos to VDS (TradingAgents, last30days-skill, polymarket-assistant-tool, collectmarkets2, mlmodelpoly)
- [x] Set up polyrec dashboard on VDS
- [x] Analyze @maskache2 on Polymarket ($37K profit, weather prediction strategy)
- [x] PreReason API key found in knowledge base (active: pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_)
- [x] VDS polymarket-bot stopped (Hetzner EU is active instance)
- [x] Full security audit across all servers
- [x] VDS PermitRootLogin hardened to prohibit-password
- [x] Hetzner EU PermitRootLogin hardened to prohibit-password
- [x] Wallet sweeper check — no unauthorized activity detected
- [x] All changes pushed to GitHub (apex-agent + opentang)

---

## IN PROGRESS 🔄

- [ ] HABFF bot monitoring — volume trades executing, 0 arb opportunities found yet (spread too tight on BASE)
- [ ] Polymarket bot running on Hetzner EU (7h uptime, 225MB)

---

## REMAINING TODO 📋

### HIGH PRIORITY
- [ ] VPS1 Hero-ABLE-Base needs ETH gas funding on BASE
- [ ] VDS hero-arb-bot needs WETH funding
- [ ] Create HERO/WETH pool on Aerodrome (enables cross-DEX arb for HABFF)
- [ ] Set up P&L tracking for BASE HABFF bots

### MEDIUM PRIORITY
- [ ] herobase.io multilingual support + live tickers
- [ ] Mirror VDS/VPS3 configs to VPS2 (backup)
- [ ] Automated sync cron VDS → VPS2
- [ ] DeFi yield strategies image for basehero.io
- [ ] VicFoundation VETS logo update
- [ ] HERO/VETS promo videos

### LOW PRIORITY / FUTURE
- [ ] Evaluate Kreo copy trading bot (requires Telegram interaction)
- [ ] Paper trade scanner strategy (PreReason API ready)
- [ ] Black-Scholes Polymarket bot
- [ ] Claude-Obsidian knowledge base upgrade
- [ ] DarkWire Intel (paywalled — skip for now)

### BLOCKED / NEEDS USER ACTION
- [ ] VPS1/VPS2 SSH from sandbox — fail2ban blocks sandbox IP (use VDS jump host)
- [ ] Stripe checkout DNS fix — needs Stripe dashboard access

---

## FLEET STATUS (Apr 23, 2026)

| Server | Bots | Status |
|--------|------|--------|
| VDS (147.93.183.207) | kraken-bot-v2, kalshi-bot-v4, hero-vets-pulse, base-hero-vol, cross-chain-monitor, habff-arb, atfoam-api, fincept-api, gitnexus-server | ALL GREEN |
| VPS1 (62.146.175.67) | hero-dapp, Hero-ABLE, Hero-ABLE-Base, hero-terminal, hero-terminal-base, base-hero-vol, hero-vets-pulse, regen-valor, valor-peptides, regen-admin | ALL GREEN |
| VPS2 (85.239.239.206) | regen-valor, valor-peptides | GREEN |
| Hetzner EU (91.107.196.191) | polymarket-bot | GREEN |

## SECURITY STATUS

| Server | SSH | Firewall | Fail2Ban | PermitRootLogin |
|--------|-----|----------|----------|-----------------|
| VDS | Key only | UFW active | Active (690 blocked) | prohibit-password |
| VPS1 | Key only | UFW (Tailscale+VDS+Cloudflare) | Active | prohibit-password |
| VPS2 | Key only | UFW (Tailscale) | Active | prohibit-password |
| Hetzner EU | Key only | UFW (SSH only) | N/A | prohibit-password |

## WALLET STATUS

| Wallet | Chain | Balance | Sweeper Check |
|--------|-------|---------|---------------|
| HABFF Bot (0xeb2C...4e6) | BASE | 0.0189 ETH, 5000 HERO | CLEAN |
| HABFF Contract (0x1e8B...c55) | BASE | Fee Exempt | CLEAN |
