# 1775 Valor Node/API/MCP Plan

**Date:** 2026-07-14
**Status:** APPROVED (VETS GO)
**Server:** VPS2 (`85.239.239.206`) / VPS1 (Fallback)
**Target:** `1775valor.com`

## Objective
Establish a secure, performant Node.js API layer for 1775valor.com to enable seamless MCP integration and headless CMS operations, while maintaining the global peptide background requirement.

## Architecture
- **Runtime:** Node.js 20 LTS
- **Process Manager:** PM2
- **Web Server:** Nginx (Reverse Proxy)
- **Framework:** Express.js / Fastify
- **Database:** SQLite / PostgreSQL (depending on data needs)
- **Domain:** `api.1775valor.com` (or routed via `/api` on main domain)

## Implementation Steps

### 1. Repository Setup
- Create a new directory in the `opentang` repo for the 1775valor API backend.
- Initialize `package.json` and install core dependencies (`express`, `cors`, `helmet`, `dotenv`).

### 2. VPS Environment Prep
```bash
# SSH to VPS2 (or VPS1) via VDS-M
ssh vps2

# Ensure Node.js and PM2 are installed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 3. Application Deployment
```bash
mkdir -p /opt/1775valor-api
# Clone repo or copy files
cd /opt/1775valor-api
npm install
```

### 4. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: '1775valor-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```
Start service:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 5. Nginx Configuration
Update `/etc/nginx/sites-available/1775valor.com` to proxy API requests:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Reload Nginx:
```bash
nginx -t && systemctl reload nginx
```

### 6. MCP Integration & Security
- Implement API key authentication for all MCP endpoints.
- Store API keys in `.env` (managed securely, not in GitHub).
- Use `helmet` for HTTP header security.
- Implement rate limiting to prevent abuse.

### 7. Global Background Requirement
- Ensure the frontend application (React/Vue/Static) is configured to apply the mandatory peptide image as a global CSS background across all views, as per the knowledge base directive.

## Rollback
- `pm2 delete 1775valor-api`
- Revert Nginx config and reload.
- `rm -rf /opt/1775valor-api`
