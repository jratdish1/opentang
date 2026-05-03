# MASTER TO-DO LIST — VetsInCrypto Operations
## Updated: May 3, 2026

---

## SESSION 1: YouTube Upload Automation (DEDICATED BUILD)

**Goal**: Activate the existing YT-Shorts-Engine on VDS-S and build full pipeline

**Current State**: Engine EXISTS at `/opt/yt-shorts-engine/` on VDS-S with OAuth creds, scheduler, content generator, and 5 videos already generated (3 in queue). Just needs activation + migration to VDS-M.

- [ ] Audit existing `/opt/yt-shorts-engine/` code via Codex before activation
- [ ] Migrate YT-Shorts-Engine from VDS-S to VDS-M (VDS-S = wallet only)
- [ ] Verify OAuth token is still valid (token.json in credentials/)
- [ ] Process 3 queued uploads sitting in `/opt/yt-shorts-engine/queue/`
- [ ] Deploy `yt_scheduler.py` as PM2 process (2-3 shorts/day at 7AM, 12PM, 5PM PST)
- [ ] Build video generation pipeline (Suno AI audio + image overlay + ffmpeg)
- [ ] Set up content topic rotation (crypto education, HERO updates, market commentary)
- [ ] Wire Telegram notifications for upload success/failure
- [ ] Test full cycle: generate → queue → upload → verify on YouTube
- [ ] Add to watchdog/autoheal monitoring
- [ ] Build Spotify music automation agent (separate from YT — use blueprint)

---

## SESSION 2: HERO Wallet App (DEDICATED BUILD)

**Goal**: Resume building the HERO wallet mobile + web app

**Current State**: 
- VDS-S has `hero-wallet-railgun` with mobile screens (Wallet, Send, Receive, Swap, Staking, Privacy, Lock, Settings)
- Browser extension exists: `hero-extension-v1.1` + `hero-extension-prod`
- `hero-wallet-web` running on VDS-S (PM2, 4h uptime, 16 restarts)
- Account abstraction module started (`ambire-bridge.ts`)
- Staking foundry contracts exist

- [ ] Audit all wallet code via Codex/ChatGPT 5.4 (MANDATORY before any changes)
- [ ] Fix `hero-wallet-web` stability (16 restarts in 4h = crash loop)
- [ ] Complete mobile app screens (React Native)
- [ ] Integrate Railgun privacy layer (shielded transactions)
- [ ] Finish account abstraction (gasless transactions via bundler)
- [ ] Connect to PulseChain + BASE chain RPCs
- [ ] Implement HERO/VETS token swap functionality
- [ ] Build staking interface (connect to on-chain staking contracts)
- [ ] Apple Small Business Program application (saves 15% on revenue!)
- [ ] Set up App Store Connect banking/tax BEFORE submission
- [ ] Test all purchase flows in sandbox mode
- [ ] Use in-app subscriptions (Apple's preferred model)
- [ ] TestFlight beta deployment
- [ ] App Store submission

---

## SESSION 3: Browser Extension (DEDICATED BUILD)

**Goal**: Polish and deploy HERO browser extension

**Current State**: Extension exists at `/opt/hero-wallet/hero-extension-v1.1/` and `hero-extension-prod/` on VDS-S

- [ ] Audit extension code via Codex (MANDATORY)
- [ ] Test extension in Chrome/Brave/Firefox
- [ ] Verify wallet connect functionality
- [ ] Add HERO/VETS token detection
- [ ] Implement transaction signing
- [ ] Chrome Web Store submission
- [ ] Firefox Add-ons submission

---

## SESSION 4: Herobase.io Cleanup & Improvements

**Goal**: Polish the live dApp, fix remaining issues, add features

**Current State**:
- LIVE at herobase.io (Cloudflare, SSL, VPS1 port 3001)
- Full-stack: React 19 + Express + MySQL (drizzle-orm)
- Features: Swap, wallet connect (wagmi), charts (lightweight-charts), user auth
- Has RNG modules, tokenomics video, explainer video
- SEO audit complete, CDN migrated

**Pending from existing todo.md:**
- [ ] Update VETS logo to actual VETS IN CRYPTO logo (star/camo design)
- [ ] Multilingual language option (ON HOLD but planned)
- [ ] Integrate poly_data Goldsky subgraph for deeper wallet analysis
- [ ] VRF integration for on-chain T2/T3 tiers
- [ ] RNG FLOW feed publication on PulseChain

**New improvements:**
- [ ] Performance audit (139.8mb memory usage — optimize)
- [ ] Mobile responsiveness check and fix
- [ ] Add live price feeds for HERO/VETS
- [ ] Improve swap UI/UX
- [ ] Add portfolio tracking dashboard
- [ ] Integrate holder rankings page (exists in knowledge-base)
- [ ] Deploy live-feed page (exists in knowledge-base)
- [ ] Security hardening (rate limiting, input validation)
- [ ] Build HERO/VETS promotional videos
- [ ] Evaluate LarryBrain for marketing automation

---

## SESSION 5: Hermes Integration & Autonomous Agent Fleet

**Goal**: Study Hermes architecture and integrate with our systems

**Current State**: All 10 repos cloned to VDS-M, VPS1, VPS2, VPS3, Hetzner-EU

- [ ] Study Hermes Agent core for memory/skill architecture patterns
- [ ] Deploy Control Interface on VPS1 or VPS2 for fleet monitoring
- [ ] Integrate Skill Factory with our brain-memory system
- [ ] Use Maestro for multi-agent coordination across our bots
- [ ] Study hermes-agent-camel for production safety patterns
- [ ] Build custom skills for our trading bots using Skill Factory
- [ ] Deploy hermes-hud (monitoring TUI) on VDS-M
- [ ] Evaluate hermes-alpha for cloud deployment patterns
- [ ] Document architecture blueprint for autonomous agent fleet
- [ ] THIS IS the architecture blueprint for our autonomous agent fleet

---

## SESSION 6: Trading Infrastructure Upgrades

**Goal**: Deploy new trading frameworks and tools

- [ ] Deploy TradingAgents framework (TauricResearch) — evaluate for multi-agent trading
- [ ] Deploy n8n for news feed automation (trading signals)
- [ ] Deploy Pydantic AI for production bot framework
- [ ] Enable Claude prompt caching on API key (cost savings)
- [ ] Deploy Polymarket manipulation fade bot using poly_data + py-clob-client
- [ ] Build Black-Scholes Polymarket bot (priority from knowledge base)
- [ ] Install polymarket-cli (Rust) on Hetzner for fast market scanning
- [ ] Get HABFF contract address fee-exempted on BASE
- [ ] VDS: hero-arb-bot needs WETH funding before restart
- [ ] Investigate hero-farm-v6 long-term stability
- [ ] Stagger */30 cron jobs to reduce server load
- [ ] Build VDS/VPS monitoring dashboard (green/yellow/red)
- [ ] Verify Volt-Kraken API key (nonce issues with current key)

---

## SESSION 7: NFT Launch Pipeline

**Goal**: Complete the HERO NFT collection launch

- [ ] Artist delivers layer PNGs
- [ ] Generate 1,000 composite images per chain
- [ ] Upload to IPFS (Pinata + nft.storage)
- [ ] Deploy contracts on BASE Sepolia testnet
- [ ] Deploy contracts on PulseChain testnet v4
- [ ] Test full mint + fee discount flow end-to-end
- [ ] Go live on BASE mainnet
- [ ] Go live on PulseChain mainnet
- [ ] Publish RNG feed on-chain (25 eDAI for RNG FLOW)

---

## SESSION 8: Infrastructure & Security

**Goal**: Harden fleet, deploy monitoring, ensure failsafes

- [ ] SOP: ALL code through Codex review before deployment (ENFORCE)
- [ ] Deploy automated daily website health check agent
- [ ] Build self-replenishing scripts for ALL trading wallets
- [ ] Fix Xynth email forwarder (verify iCloud IMAP working)
- [ ] Configure Xynth alerts #3-5 on platform
- [ ] Deploy Watchtower-Protocol from GitHub for server protection
- [ ] Consolidate low-value GitHub repos (quarterly review)
- [ ] Claude-Obsidian knowledge base upgrade
- [ ] Set up failsafe/fallback access to ALL servers
- [ ] Implement daily PNL summary Telegram notification (not per-trade)
- [ ] Auto-detect and fix SSL cert issues proactively
- [ ] Implement ChatGPT 5.4 code audit SOP after each build

---

## SESSION 9: Spotify AI Music Automation

**Goal**: Deploy autonomous Spotify income agent

**Blueprint**: Ready at `/home/ubuntu/spotify_automation_blueprint.md`

- [ ] Set up Suno AI account ($10/mo Pro plan)
- [ ] Set up DistroKid account ($22.99/yr)
- [ ] Build music generation pipeline (10-20 tracks/week)
- [ ] Create multiple artist profiles (different niches)
- [ ] Target niches: sleep, meditation, lo-fi, focus, ambient
- [ ] Deploy autonomous agent on server (PM2 process)
- [ ] Track analytics and optimize (kill underperformers, double down on winners)
- [ ] Connect Spotify for Artists API for analytics
- [ ] Build playlist submission automation
- [ ] Scale to 100+ tracks across 5+ artist profiles

---

## SESSION 10: Content & Marketing Automation

**Goal**: Automate content creation across all platforms

- [ ] Build YouTube Shorts pipeline (separate from Session 1 long-form)
- [ ] Deploy email campaign automation (weekly drips)
- [ ] Build abandoned cart email system for any e-commerce
- [ ] Evaluate LarryBrain for marketing automation
- [ ] Set up automated social media posting (X, Instagram)
- [ ] Build HERO/VETS promotional video pipeline
- [ ] Deploy content calendar automation

---

## GLOBAL SOPs (Apply to ALL Sessions)

1. **ALL code through Codex/ChatGPT 5.4 audit before deployment**
2. **VDS-S = Wallet ONLY — nothing else without audit**
3. **Brain memory updated after every session**
4. **GitHub push after every session**
5. **Telegram alerts for all critical failures**
6. **Self-healing + watchdog on all PM2 processes**
7. **DRY + KISS principles in all code**
8. **24h paper test before any live trading deployment**
9. **Max budget limits on all autonomous agents**
10. **Daily PNL summary (not per-trade spam)**

---

## PRIORITY ORDER (Recommended)

| Priority | Session | Why |
|----------|---------|-----|
| 1 | Session 6: Trading Upgrades | Money NOW — expand what's already profitable |
| 2 | Session 1: YouTube Automation | Engine EXISTS, just needs activation |
| 3 | Session 5: Hermes Integration | Force multiplier for everything else |
| 4 | Session 4: Herobase.io | Public-facing, builds credibility |
| 5 | Session 2: Wallet App | Revenue generator (iOS subscriptions) |
| 6 | Session 8: Infrastructure | Prevents losses, ensures uptime |
| 7 | Session 9: Spotify | Passive income, 3-6 month horizon |
| 8 | Session 3: Browser Extension | Ecosystem expansion |
| 9 | Session 7: NFT Launch | Waiting on artist assets |
| 10 | Session 10: Content/Marketing | Long-term growth |

---

*Master list maintained in brain-memory + GitHub (jratdish1/brain-memory)*
*Last updated: May 3, 2026 — Session complete*

---

## SESSION 11: OnlyFans AI Persona (Autonomous Income Stream)
**Server**: VPS2 (ISOLATED — no connection to VETS/HERO branding)
**Priority**: MEDIUM (high revenue potential, platform risk)
**Timeline**: 4-6 weeks to first revenue
**Expected ROI**: $10K-$40K/month net

### Tasks:
- [ ] Create persona.md (biography, voice rules, forbidden topics)
- [ ] Train Flux LoRA on consistent face (47 reference shots, 3 lighting setups)
- [ ] Clone voice in ElevenLabs from 90-sec Fiverr audio ($40)
- [ ] Build brain.md subscriber memory system (JSON per user)
- [ ] Set up Claude API polling cron (every 30 seconds)
- [ ] Create OnlyFans account under separate identity
- [ ] Deploy to VPS2 with PM2 process management
- [ ] Test for 1 week before going public
- [ ] Scale to 3-5 personas if first validates

### Risks:
- OnlyFans TOS gray area (AI content not explicitly banned yet)
- Ethical concerns (subscribers think persona is real)
- Platform risk (OF controls account, takes 20%)
- Competition (6.9M views on this strategy = everyone trying it)

---

## SESSION 12: The Agency Deployment (144 AI Specialists)
**Server**: VDS-M (primary), distribute fleet-wide
**Priority**: HIGH (immediate force multiplier)
**Timeline**: 1 session to deploy, ongoing optimization
**Repo**: /opt/apex-agent/repos/agency-agents/

### Tasks:
- [ ] Run install script: ./scripts/install.sh --tool claude-code
- [ ] Deploy key agents for our use cases:
  - Growth Hacker → HERO/VETS social media growth
  - Content Creator → YouTube + blog automation
  - Twitter Engager → X account engagement
  - Reddit Community Builder → crypto community
  - Financial Analyst → trading intelligence
  - Marketing specialists → token promotion
- [ ] Integrate with Hermes ecosystem (Skill Factory + Maestro)
- [ ] Connect to n8n for agent orchestration
- [ ] Test agents in sandbox before production deployment
- [ ] Distribute relevant agents to VPS1/VPS2/VPS3

### Architecture:
- Hermes = autonomous agent FRAMEWORK (memory, skills, coordination)
- The Agency = specialized agent PERSONALITIES (expertise, workflows)
- n8n = orchestration LAYER (triggers, scheduling, data flow)
- Combined = fully autonomous AI company


---

## SESSION 13: Herobase.io & Wallet Cleanup (CRITICAL)
**Server**: VPS1 (herobase.io) + VDS-S (wallet.herobase.io)
**Priority**: HIGH (broken user-facing features)
**Timeline**: 1-2 sessions

### Critical Issue: tRPC Backend Broken
wallet.herobase.io tRPC backend is NOT running — ALL data pages show zeros/loading:
- Dashboard
- Treasury
- Buy & Burn
- DEX Analytics
- Media Hub
- Community Hub
- DAO

### What Needs to Happen:
- [ ] Get the tRPC server running on VDS-S
- [ ] Set up the database (likely PostgreSQL/SQLite)
- [ ] Configure environment variables
- [ ] Start the server process via PM2
- [ ] Verify all data endpoints return real data

### dashboard.vicfoundation.com Integration:
- Returns Next.js RSC payload, not a REST API
- Shows "HERO Token Dashboard" title
- Could potentially scrape data from it as fallback

### Issues Found:
- [ ] FIX: tRPC backend broken on wallet.herobase.io — ALL data pages show zeros/loading
- [ ] FIX: Multiple dist backups (dist.bak.20260424, 29, 30) — cleanup needed
- [ ] FIX: hero-wallet-web on VDS-S has 16 restarts — stability issue
- [ ] FIX: No visible live price feeds on homepage — priceFeed.ts exists but not displayed
- [ ] VERIFY: Boot Camp nav item — functional or placeholder?

### Priority Fixes (in order):
1. Get tRPC server running (fixes Dashboard, Treasury, Buy&Burn, DEX Analytics, Media, Community, DAO)
2. Clean up old dist backups on VPS1
3. Verify all nav links work end-to-end
4. Add live price ticker for HERO/VETS on homepage
5. Mobile responsiveness check
6. Performance audit (page load time)

### Key Token Addresses (from priceFeed.ts):
- HERO (PulseChain): 0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27
- VETS (PulseChain): 0x4013abBf94A745EfA7cc848989Ee83424a770060
- HERO (Base): 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8

