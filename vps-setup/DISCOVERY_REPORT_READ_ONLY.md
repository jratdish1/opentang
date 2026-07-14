# Fleet Discovery Report (Read-Only)

**Date:** 2026-07-14
**Status:** DRAFT — SECURITY AND LIVE VERIFICATION REQUIRED
**Data Source:** `jratdish1/knowledge-base` (fleet-audits, fleet-access, DEPLOYMENT_STATUS.md)

## 1. Current Infrastructure & Packages

### VDS-M (Primary Jump / Compute)
- **IP:** 147.93.183.207
- **Role:** Primary AI/trading compute, Jarvis, Docker, Nginx, Cloudflare Tunnel
- **Access:** Direct SSH `vds_key`

### VDS-S (Hero Wallet Stack)
- **IP:** 147.93.183.188
- **OS:** Ubuntu 24.04.4 LTS
- **Disk:** 174 GB total, 38 GB used (22%), 137 GB free
- **Memory:** 23 GiB total, 22 GiB available
- **Docker:** 29.1.3 + Compose 2.40.3
- **Services:** `hero-wallet-secure` (Docker), `openalice-edge-discovery`, `openalice-trading`
- **Access:** Manus → VDS-M → `vds-s` alias (key `contabo_vds`)

### VPS1 (Hero DApp / VIC Foundation)
- **IP:** 62.146.175.67
- **Role:** Web hosting (vicfoundation.com, herobase.io), PM2 apps
- **Nginx Sites:** `herobase.io` (commit 335833b)
- **SSL/Certs:** `certbot.service` previously flagged FAILED (certs expire 2026-07-02, superseded by VPS3 cert routing)

### VPS2 (1775 Valor / Support)
- **IP:** 85.239.239.206
- **Role:** Web hosting (at-foam.com, regenvalor.com, 1775valor.com)
- **Services:** PM2 processes, Node.js (valor-peptides, port 3101)

## 2. Nginx & Certificates
- **1775valor.com (VPS2):** Nginx reverse proxy to port 3101. SSL valid until 2036-06-03 (custom 10-year cert). Cloudflare real IP configured.
- **vicfoundation.com (VPS1):** Currently proxied via GoDaddy Managed WordPress.

## 3. Database & PHP
- No explicit PHP-FPM sockets or MariaDB versions are confirmed installed on VPS1 for VIC Foundation in the audit logs. The previous staging plan assumed installation was required.

## 4. PM2 & systemd
- **VPS1:** `hero-dapp` (ONLINE)
- **VPS2:** `valor-peptides` (port 3101)
- **VPS3:** `hero-vets-pulse` (previously flagged for 118% CPU)
- **VDS-M:** `hero-nft-showcase` (previously flagged for 46 restarts), `hero-farm-arb`

## 5. GitHub Repositories
- `jratdish1/knowledge-base` (main)
- `jratdish1/opentang` (main)
- `jratdish1/apex-agent`
- `jratdish1/hero-dapp` (commit 335833b deployed to VPS1)

## 6. DNS Records
- Managed via Cloudflare API across 45 zones (vicfoundation.com, 1775valor.com, novareign.ai, etc.). No changes made.

## 7. Backup & Restore Status
- **VDS-M:** Backups verified (r2-fleet-general-crypt:vds-m/daily)
- **VPS1:** Backups verified (r2-fleet-general-crypt:vps1/daily)
- **VPS2:** Backups PENDING (Phase 2I-B extension required)
- **VDS-S:** Local daily backups under `/opt/backups/`

## 8. Proposed Architecture & Paths
- **VIC Foundation:** `/var/www/staging.vicfoundation.com` (VPS1)
- **1775 Valor:** `/opt/1775valor-api` (VPS2)
- **Nova Payments:** `/opt/nova_payments` (VDS-S)

## 9. Conflict Analysis
- **VDS-S:** Target port 8420 (or 5000) is FREE. No conflict with wallet container (ports 3001, 3002, 8082).
- **VPS1:** Needs dedicated PHP/Nginx user to isolate WordPress from Node.js DApps.
- **VPS2:** Port 4000 proposed for API; must not conflict with 3101.

## 10. Risk Classification
- **VIC Foundation (VPS1):** MEDIUM. PHP/WP execution alongside Node DApps requires strict user/group isolation.
- **1775 Valor (VPS2):** LOW. Standard Node/PM2 addition.
- **Nova Payments (VDS-S):** HIGH. VDS-S is the secure wallet host. Running public webhook endpoints on the same bare metal as the wallet container violates the isolation doctrine without explicit architecture gates.

## 11. Rollback Design
- **VIC Foundation:** Drop DB, remove `/var/www/staging`, remove Nginx symlink, reload.
- **1775 Valor:** `pm2 delete`, remove `/opt`, revert Nginx.
- **Nova Payments:** `systemctl disable --now`, `rm -rf /opt/nova_payments`, revoke Telegram webhook.
