# MANUS MASTER KNOWLEDGE BASE

> **Single Source of Truth** — This file is the canonical reference for all prompts, SOPs, scripts, API keys, and operational procedures. Updated automatically by Manus. Last updated: 2026-05-28.

---

## 1. MASTER PROMPT LIST

### Prompt #1 — Expert Mode (Always Active)
Always run in expert mode. Double-check sources and facts. Female voice, light-hearted, some humor, always give it straight. Dumb complicated things down. Marine veteran audience — uses crayons. Make money. Automate tasks. Save time. 100% confidential.

### Prompt #12 — Sandbox Reset Recovery
1. Check all ENV files for stored credentials and direction (primary trigger)
2. Recover VDS key from environment variables
3. Use VDS key to regain access to primary system
4. Jump into all servers: Polygon, EU Helsinki VDS, VPS3
5. Re-authenticate GitHub (single source of truth)
6. Load `MANUS_MASTER_KNOWLEDGE.md` from GitHub and apply all SOPs
7. Verify all systems reconnected and knowledge loaded

### Prompt #13 — Knowledge Persistence & SOP Storage
- GitHub (`MANUS_MASTER_KNOWLEDGE.md`) is the permanent master fallback
- Create/update this file with all prompts, SOPs, recovery procedures
- Tie into Sandbox Reset Recovery process
- Package core SOPs into reusable modules when possible
- Update automatically when prompts or SOPs change

### Prompt #16 — Content Quality Gate
1. Review against SOP and Bible for technical quality, accuracy, standards
2. Check for anomalies, errors, inconsistencies, off-brand elements
3. Verify visual/audio consistency (character, branding, style, lighting, framing, voice, tone)
4. Detect hallucinations, artifacts, off-brand elements
5. Correct/regenerate until 100% compliant
6. Only approve with zero anomalies and full persona alignment

### API Key Persistence & Recovery Protocol
Priority order: ENV files → GitHub → Internal session knowledge → Ask user ONCE
- Never repeatedly ask for API keys
- Securely load all discovered keys into session
- Never hardcode keys in code or output in logs

### Script Lock-in & GitHub Knowledge Recall
- Every new script immediately locked into GitHub under `/scripts/`
- Update `MANUS_MASTER_KNOWLEDGE.md` with script name, purpose, path, usage, dependencies
- When stuck: check ENV → pull from GitHub → load script → proceed
- Never leave scripts only in local/session memory

### Browser Login Protocol
- Use VDS-M residential proxy with non-detectable AI fingerprint
- Enable nuclear option, use CapMonster 2 for captcha
- If AI detected: switch browsers, change web sockets/fingerprints, purge Cloudflare
- Do not stop until successful authenticated login

### Trading Bot Performance Review
- Review all bots over 7 and 30 days
- Calculate: win rate, profit factor, Sharpe ratio, max drawdown, ROI, risk-adjusted returns
- Identify underperforming bots, risk violations, concerning patterns
- Provide recommendations and overall risk assessment

### Weekly Architecture Blueprint
- Generate complete weekly blueprint of entire server ecosystem (5 servers)
- Document full layout, services, connections, current state
- Cron schedule for weekly automated execution

### Affiliate Product Management
- Use all APIs + scraping (including Alfie) to fetch latest product info
- Compare against all affiliate websites
- Validate before updating
- Harden safety measures, rate limiting, proxy rotation, anti-detection

---

## 2. SERVER ARCHITECTURE

| Server | IP | Role | SSH Access |
|--------|-----|------|-----------|
| VDS-M (Main Hub) | 147.93.183.207 | Trading bots, Goose agents, Ollama, Telegram alerts | Direct SSH from sandbox |
| VPS1 | 62.146.175.67 | herobase.io, web hosting, backups | Via VDS jump |
| VPS2 | 85.239.239.206 | at-foam.com, regen-valor, valor-peptides | Via VDS jump |
| VPS3 | (Tailscale: vps3) | Primary ABLE bots, trade logging | Via VDS: `ssh vps3` |
| Hetzner EU | (Tailscale: polymarket-eu) | Polymarket bot (geo-unblocked) | Via VDS: `ssh polymarket-eu` |

### SSH SOP
- Always go through VDS as jump host
- VDS has Tailscale aliases: vps1, vps2, vps3, polymarket-eu
- Direct IP works for VPS1/VPS2 via `-J root@147.93.183.207`
- PasswordAuthentication: no (all servers)
- PermitRootLogin: prohibit-password

---

## 3. ENV ARCHITECTURE

All API keys stored in `/root/.env_architecture` on every server.
```
source /root/.env_architecture
```

### Key Management SOP
1. Test key against API endpoint before deploying
2. Update `/root/.env_architecture` on VDS
3. Sync to VPS1 + VPS2 + VPS3 + Hetzner via SSH
4. Push to GitHub (opentang repo, REDACTED version)
5. Restart dependent services (`pm2 restart all`)

### Active API Keys (Reference — actual values on VDS)
- **XAI/Grok:** Stored in env_architecture (verified, all servers)
- **CoinGecko:** Active (locked in all 5 servers)
- **Telegram Bot:** Stored in env_architecture
- **Kalshi:** Active
- **Kraken:** Stored in env_architecture
- **Cloudflare:** Stored in env_architecture (API calls MUST go through VDS — IP restricted)
- **GitHub PAT:** Stored on VDS, repo scope
- **GoDaddy:** Active (Key + Secret)
- **Resend:** Full-access key (verified, at-foam.com domain)
- **2Captcha:** Client key active (fleet-wide)

---

## 4. NOVA REIGN — VIDEO VAULT

### Project: novareign (Manus WebDev)
- **Live URL:** novareign-nygxewfm.manus.space
- **Stack:** React 19 + Tailwind 4 + Express + tRPC 11 + Drizzle ORM
- **Email:** Resend API via at-foam.com (verified domain)
- **Features:** Age gate → Email verification (OTP) → Vault access

### Email Verification Flow
1. User enters email on age-gated landing page
2. Backend generates 6-digit code, stores in `verification_codes` table
3. Code sent to user's email via Resend (from: noreply@at-foam.com)
4. User enters code → verified → stored in `subscribers` table
5. Rate limit: 60s between requests per email
6. Code expiry: 10 minutes

### Domain Status
- **at-foam.com:** VERIFIED in Resend (sending works to any email)
- **novareign.ai:** Cloudflare zone PENDING (NS not yet pointed to CF)
  - Required: Update NS at registrar to `amy.ns.cloudflare.com` / `corey.ns.cloudflare.com`
  - Once NS updated, Resend DNS records will propagate and domain will verify

---

## 5. SCRIPTS REGISTRY

| Script | Location | Purpose | Dependencies |
|--------|----------|---------|-------------|
| emailService.ts | novareign/server/emailService.ts | Sends verification codes via Resend | RESEND_API_KEY env var |
| emailRouter.ts | novareign/server/emailRouter.ts | tRPC procedures for subscribe/verify | Database, emailService |
| auto_blog_agent.py | TBD | WordPress auto-publisher for vicfoundation.com | WP Application Password |

---

## 6. WEBSITES

| Domain | Server | Stack | Status |
|--------|--------|-------|--------|
| herobase.io | VPS1 | React app | Active |
| vicfoundation.com | VPS1 | WordPress (GoDaddy origin) | Active, behind Cloudflare |
| at-foam.com | VPS2 | Express + Grok AI chatbot | Active |
| regenvalor.com | VPS2 | React app | Active |
| novareign.ai | Manus WebDev | React + tRPC | Active (manus.space) |

---

## 7. TOKENS & WALLETS

### HERO Token
- PulseChain: 0x...
- BASE: 0x...

### VETS Token
- PulseChain: 0x...

*(Full wallet registry in knowledge-base/wallet-registry.md on GitHub)*

---

## 8. RECOVERY CHECKLIST (Post-Reset)

- [ ] Check ENV for VDS SSH key
- [ ] SSH to VDS (147.93.183.207)
- [ ] Source `/root/.env_architecture`
- [ ] Pull this file from GitHub
- [ ] Verify GitHub PAT works
- [ ] Verify Cloudflare API works (from VDS only)
- [ ] Verify Resend API works
- [ ] Check all trading bots status
- [ ] Confirm knowledge loaded

---

*This file is maintained by Manus and committed to GitHub as the permanent knowledge store.*
