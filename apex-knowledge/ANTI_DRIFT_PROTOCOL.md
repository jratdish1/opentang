# ANTI-DRIFT PROTOCOL - INFRASTRUCTURE QUICK REFERENCE
## Last Updated: 2026-04-06
## Classification: MISSION CRITICAL - DO NOT LOSE

---

## SERVER INFRASTRUCTURE LAYOUT (FINAL - LOCKED)

| Server | Display Name | IP Address | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **VPS 1** | VPS 473 | 62.146.175.67 | `K7M9XsWncMcqqQdd8p` | Hero Ecosystem + vicfoundation.com |
| **VPS 2** | VPS 501 | 85.239.239.206 | `3Kn8Gg662GLVheYFNx` | Web Hosting: regenvalor.com, valorpeptides.net |
| **VDS** | VDS | 147.93.183.207 | `2Mj6B6Jtz8NNGH4QsN` | AI Command Center: Claude Agents, Goose, Trading, Telegram, Email, Dashboard |

### Contabo VMI References
- VPS 1: vmi2941473, 62.146.175.67, Display Name: 473
- VPS 2: vmi3188501, 85.239.239.206, Display Name: 501

### SSH Access Commands
```bash
# VPS 1 (Hero Ecosystem)
sshpass -p 'K7M9XsWncMcqqQdd8p' ssh -o StrictHostKeyChecking=no root@62.146.175.67

# VPS 2 (Web Hosting)
sshpass -p '3Kn8Gg662GLVheYFNx' ssh -o StrictHostKeyChecking=no root@85.239.239.206

# VDS (AI Command Center)
sshpass -p '2Mj6B6Jtz8NNGH4QsN' ssh -o StrictHostKeyChecking=no root@147.93.183.207
```

### VDS SSH Key (for inter-server access)
- Location on VDS: `/root/.ssh/contabo_vds`
- Also saved locally: `/home/ubuntu/.ssh/contabo_vds`

---

## WHAT LIVES WHERE

### VPS 1 (62.146.175.67) - Hero Ecosystem
- **Hero-ABLE** (PulseChain): `/root/Hero-ABLE/` - ArbBot.js + terminal.js (port 8448)
- **Hero-ABLE-Base** (BASE): `/root/Hero-ABLE-Base/` - ArbBot.js + terminal.js (port 8449)
- **vicfoundation.com**: MIGRATION TARGET (from GoDaddy)
- **Hero dApp/Farm/DAO**: DEPLOYMENT TARGET (merge into one site)
- Nginx configs: `/etc/nginx/sites-enabled/`
  - `api-hero.f0xy.dev` -> localhost:8448
  - `api-hero-base.f0xy.dev` -> localhost:8449
- SSL: Let's Encrypt via Certbot

### VPS 2 (85.239.239.206) - Web Hosting
- **regenvalor.com**: `/var/www/regenvalor.com/html/`
- **valorpeptides.net**: `/var/www/valorpeptides.net/html/`
- Nginx configs: `/etc/nginx/sites-enabled/`

### VDS (147.93.183.207) - AI Command Center
- **Docker**: apex-redis (port 6379)
- **Apex Dashboard**: Nginx proxy -> localhost:8080
- **Goose**: AI agent framework (TO BE DEPLOYED)
- **Claude Headless Agents**: Autonomous trading (TO BE DEPLOYED)
- **Telegram Bot**: Notifications (TO BE DEPLOYED)
- **Email Notifications**: vetscrypto@pm.me (TO BE DEPLOYED)
- **Monitoring Dashboard**: KISS method (green/yellow/red) (TO BE DEPLOYED)
- User: apex (`/home/apex/`)

---

## CLOUDFLARE CONFIGURATION

### Account
- Email: Sharer.buns-0f@icloud.com
- Account ID: f5ee65549b211b028fbd1c015c1afdcd

### Domains Behind Cloudflare (Proxied)
| Domain | Points To | Server |
| :--- | :--- | :--- |
| regenvalor.com | 85.239.239.206 | VPS 2 |
| valorpeptides.net | 85.239.239.206 | VPS 2 |
| vicfoundation.com | 85.239.239.206 (NEEDS CORRECTION -> 62.146.175.67) | VPS 1 |

### Nameservers
- amy.ns.cloudflare.com
- corey.ns.cloudflare.com

---

## CONTABO LOGIN
- Portal: https://new.contabo.com/
- Auth: https://auth.contabo.com/
- Email: 69.humidor-subways@icloud.com

---

## NOTIFICATION TARGETS
- **Telegram**: Bot configured on VDS
- **Email**: vetscrypto@pm.me (alerts, dashboard links)
- **Email**: vetscrypto@gmail.com (secondary)

---

## CRITICAL RULES (DO NOT VIOLATE)
1. VDS is DEDICATED to AI trading agents, monitoring, and notifications ONLY. No websites.
2. VPS 1 and VPS 2 provide support, redundancy, backups, and failovers for VDS.
3. All websites MUST be behind Cloudflare.
4. Hero dApp/Farm/DAO should be merged into ONE site on VPS 1.
5. Dashboard uses KISS method: Green/Yellow/Red severity indicators.
6. Agents operate 24/7/365 continuously.
7. Always check for malicious code before execution.
8. Two is one, one is none (redundancy principle).
9. Guardian monitoring alerts every hour until acknowledged.
10. All knowledge shared with local Ollama desktop.

---

## CURRENT DNS STATUS (vicfoundation.com)
- A record 1: vicfoundation.com -> 85.239.239.206 (NEEDS UPDATE to 62.146.175.67)
- A record 2: vicfoundation.com -> 147.93.183.207 (NEEDS DELETION - wrong server)
- A record 3: vicfoundation.com -> 184.168.131.241 (GoDaddy origin - temporary)
- CNAME: dashboard -> a54950c59002a30d.vercel-
- CNAME: www -> vicfoundation.com

---

## TODO PRIORITY
1. [ ] Fix vicfoundation.com DNS -> point to VPS 1 (62.146.175.67)
2. [ ] Extract vicfoundation.com files from GoDaddy
3. [ ] Deploy vicfoundation.com on VPS 1
4. [ ] Deploy Hero dApp/Farm/DAO merged site on VPS 1
5. [ ] Add Hero ecosystem domains to Cloudflare ($20/mo Pro)
6. [ ] Verify VPS 2 websites + SSL
7. [ ] Deploy Guardian monitoring on VDS
8. [ ] Configure Telegram + Email (vetscrypto@pm.me) notifications
9. [ ] Deploy monitoring dashboard on VDS
10. [ ] Harden all 3 servers (UFW, Fail2ban, Overwatch)
11. [ ] Digital green refresh for vicfoundation.com
12. [ ] X (Twitter) feed integration for vicfoundation.com
