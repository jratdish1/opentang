# Resend Email Infrastructure — Knowledge Base

**Last Updated:** 2026-06-10  
**Status:** Active  
**Classification:** Internal SOP — Confidential

---

## Overview

Resend is the transactional email provider for all $HERO ecosystem sites. It handles OTP verification codes, Hero Letters newsletters, and Nova Reign vault emails.

---

## Account Details

| Item | Value |
|------|-------|
| Provider | [Resend](https://resend.com) |
| Plan | Free (1 domain, 3,000 emails/mo, 100/day) |
| API Key Location | `/root/.env_architecture` on VDS-M, VPS1, VPS2 |
| Env Variable | `RESEND_API_KEY` |

---

## Verified Sending Domains

| Domain | Status | Region | Use Case |
|--------|--------|--------|----------|
| `novareign.ai` | ✅ Verified | us-east-1 | All transactional emails (OTP, waitlist) |
| `herobase.io` | ⏳ Pending plan upgrade | — | Future: Hero Letters newsletter |

**Current FROM address:** `$HERO NFT <noreply@novareign.ai>`  
**Reply-To:** `noreply@herobase.io`

> **Note:** To add herobase.io as a sending domain, upgrade Resend to the Pro plan ($20/mo). DNS records are pre-staged in Cloudflare zone `1f894ca8151cd3419688c8a87ce9f5e3`.

---

## DNS Records (novareign.ai — Verified)

| Type | Name | Value | Status |
|------|------|-------|--------|
| TXT | `resend._domainkey.novareign.ai` | DKIM public key | ✅ Verified |
| MX | `send.novareign.ai` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) | ✅ Verified |
| TXT | `send.novareign.ai` | `v=spf1 include:amazonses.com ~all` | ✅ Verified |

---

## Subdomain Assignments (Cloudflare)

| Subdomain | Target | Status |
|-----------|--------|--------|
| `nft.herobase.io` | `heronftshow-n6wzkbcr.manus.space` (proxied) | ✅ Live |
| `nft.vetsincrypto.com` | `heronftshow-n6wzkbcr.manus.space` (proxied) | ✅ Live |

---

## Email Flows

### 1. Waitlist OTP Verification ($HERO NFT Showcase)
- **Trigger:** User submits email on waitlist form
- **Flow:** Submit email → generate 6-digit OTP (10 min TTL, 5 attempts max) → send via Resend → user enters code → verified subscriber stored in DB
- **Template:** Gold-themed HTML email with $HERO branding
- **DB Tables:** `waitlist_subscribers`, `email_otps`
- **Admin Panel:** `/admin/waitlist` (requires admin role)

### 2. Nova Reign Vault OTP (novareign.ai)
- **Status:** Domain verified, integration pending
- **Planned flow:** Age verification → email OTP → vault access granted

---

## VDS Lockdown SOP

```bash
# Run on VDS-M to lock in the key and sync to VPS1+VPS2
RESEND_API_KEY=re_xxx bash /root/resend_vds_lockdown.sh
```

Script location: `/root/resend_vds_lockdown.sh`  
Also available at: `/home/ubuntu/resend_vds_lockdown.sh` (Manus sandbox)

---

## Master Email Directory

All verified emails across all sites are aggregated in the `hero-nft-showcase` backend:

- **API Route:** `trpc.masterEmails.getAll`
- **Export:** `trpc.masterEmails.exportMasterCsv`
- **Security:** Admin role required (VETS dashboard)
- **Current sources:** $HERO NFT Waitlist
- **Planned sources:** Nova Reign Vault, VetsInCrypto, herobase.io, regenvalor.com

---

## Upgrade Path

To unlock herobase.io as a sending domain and increase limits:
1. Upgrade Resend to Pro ($20/mo) at [resend.com/pricing](https://resend.com/pricing)
2. Run `python3 /home/ubuntu/resend_cloudflare_setup.py` — DNS records auto-added to Cloudflare
3. Update `FROM_EMAIL` in `server/resendEmail.ts` to `$HERO NFT <noreply@herobase.io>`
4. Run Codex audit → push to GitHub → purge Cloudflare

---

*This document is part of the Master API & Secrets SOP. Keep synchronized with GitHub knowledge-base repo.*
