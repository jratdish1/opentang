# Dapp Deployment Pattern — CNAME + Cloudflare + VPS

**Document:** DAPP-DEPLOYMENT-PATTERN.md  
**Last Updated:** 2026-04-08  
**Status:** Canonical reference for all future Dapp deployments  

---

## Overview

This document defines the standard pattern for deploying Dapps (decentralized applications) under custom subdomains using Cloudflare DNS and VPS hosting. It applies to all HERO ecosystem Dapps and any future projects.

---

## Architecture

```
User Browser
     │
     ▼
Cloudflare DNS (proxy: DNS-only / gray cloud)
     │  CNAME: dapp.domain.com → <manus-or-vps-domain>
     ▼
VPS 1 (62.146.175.67) or VPS 2 (85.239.239.206)
     │  Nginx reverse proxy
     ▼
Dapp Application (Node/React/Vite on port 3000 or 5173)
```

---

## Step-by-Step Deployment

### Step 1 — Build the Dapp

```bash
cd /var/www/<dapp-name>
git pull origin main
npm install
npm run build
# Output: /var/www/<dapp-name>/dist/
```

### Step 2 — Configure Nginx

Create `/etc/nginx/sites-available/<subdomain>.conf`:

```nginx
server {
    listen 80;
    server_name dapp.domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name dapp.domain.com;

    ssl_certificate     /etc/letsencrypt/live/dapp.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dapp.domain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    root /var/www/<dapp-name>/dist;
    index index.html;

    # SPA routing — all paths serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://rpc.pulsechain.com https://mainnet.base.org wss://relay.walletconnect.com wss://relay.walletconnect.org *.walletconnect.com *.reown.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" always;
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/<subdomain>.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Step 3 — SSL Certificate (Let's Encrypt)

```bash
certbot --nginx -d dapp.domain.com --non-interactive --agree-tos -m admin@domain.com
```

> **Note:** DNS must be pointing at the VPS IP before running certbot. Cloudflare must be in **DNS-only mode (gray cloud)** — NOT proxied — for certbot to complete the ACME challenge.

### Step 4 — Cloudflare DNS Configuration

| Type | Name | Value | Proxy Status |
|------|------|-------|-------------|
| `CNAME` | `dapp` | `<vps-ip-or-hostname>` | **DNS Only (gray cloud)** |
| `A` | `@` | `<vps-ip>` | Proxied (orange cloud) |
| `A` | `www` | `<vps-ip>` | Proxied (orange cloud) |

> **Critical:** The subdomain used for the Dapp MUST be set to **DNS Only** so Manus/certbot can issue the SSL certificate. The main domain can remain proxied through Cloudflare.

### Step 5 — Verify Deployment

```bash
# Test SSL
curl -I https://dapp.domain.com

# Test SPA routing
curl -I https://dapp.domain.com/swap
curl -I https://dapp.domain.com/dao/proposals

# Check nginx logs
tail -f /var/log/nginx/access.log
```

---

## Live Deployments

| Dapp | Subdomain | Server | Status |
|------|-----------|--------|--------|
| HERO Dapp | herobase.io (root) | VPS 1 (62.146.175.67) | Pending migration (#31) |
| VIC Foundation Dapp | dapp.vicfoundation.com | VPS 1 | Pending DNS update |

---

## Hero Dapp Specific Notes

The HERO Dapp (`jratdish1/hero-dapp`) requires:

1. **Manus OAuth replacement** (#32) — Replace `@manus/auth` with Auth0 or JWT before VPS deployment
2. **MySQL database** (#34) — `hero-dapp-compose.yml` template exists in apex-agent
3. **Environment variables** — Copy `.env.example` to `.env` and fill in:
   - `VITE_WALLETCONNECT_PROJECT_ID` — Get from [cloud.reown.com](https://cloud.reown.com)
   - `DATABASE_URL` — MySQL connection string
   - `SESSION_SECRET` — Random 32-char string
4. **Remove vite-plugin-manus-runtime** (#33) — Already in progress

---

## Security Checklist

- [ ] Cloudflare DDoS protection enabled (orange cloud) on main domain
- [ ] SSL certificate issued via Let's Encrypt (not self-signed)
- [ ] Nginx security headers configured (CSP, X-Frame-Options, etc.)
- [ ] UFW firewall: only ports 22, 80, 443 open
- [ ] No private keys or `.env` files in web root
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` set (enables WalletConnect QR)
- [ ] `reconnectOnMount: false` in wagmi config (prevents auto-connect)

---

*"Two is one and one is none." — Always have a backup deployment ready.*
