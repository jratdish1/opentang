# PLAN 2: 1775 Valor API/MCP

**Date:** 2026-07-14
**Status:** DRAFT — SECURITY AND LIVE VERIFICATION REQUIRED
**Server:** VPS2 (`85.239.239.206`)
**Target:** `api.1775valor.com`

## Required Corrections Implemented
- **Node 24 LTS:** Specified Node 24.
- **Framework & DB:** Fastify and PostgreSQL.
- **Repository:** Exact repo path `jratdish1/1775valor-api`.
- **Installation:** Deterministic `npm ci`.
- **MCP Tool Schemas:** Formalized.
- **Authentication:** Scoped API keys.
- **Systemd:** Bounded systemd service instead of PM2.

## Implementation Plan

### 1. Node 24 & PostgreSQL Setup
```bash
# Install Node 24 LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib

# Setup DB
sudo -u postgres psql -c "CREATE DATABASE valor_api;"
sudo -u postgres psql -c "CREATE USER valor_user WITH PASSWORD '[SECRET]';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE valor_api TO valor_user;"
```

### 2. Repository & Deterministic Install
```bash
sudo useradd -m -s /bin/bash valorapi
sudo su - valorapi
git clone https://github.com/jratdish1/1775valor-api.git /home/valorapi/app
cd /home/valorapi/app
npm ci --omit=dev
```

### 3. Bounded systemd Service
Create `/etc/systemd/system/valor-api.service`:
```ini
[Unit]
Description=1775 Valor API
After=network.target postgresql.service

[Service]
Type=simple
User=valorapi
Group=valorapi
WorkingDirectory=/home/valorapi/app
ExecStart=/usr/bin/node src/server.js
EnvironmentFile=/home/valorapi/app/.env
Restart=on-failure
MemoryMax=512M
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

### 4. Scoped Authentication & Health Checks
- **Health Check:** `GET /health` returns `200 OK` (monitored by Uptime Kuma).
- **Auth:** `X-API-Key` header required. Keys stored in PostgreSQL `api_keys` table with strict scoping (e.g., `scope: ['mcp:read', 'mcp:write']`).

### 5. Formal MCP Tool Schemas
Example schema implementation in Fastify:
```javascript
fastify.route({
  method: 'POST',
  url: '/mcp/execute',
  schema: {
    body: {
      type: 'object',
      required: ['tool', 'parameters'],
      properties: {
        tool: { type: 'string', enum: ['get_products', 'update_inventory'] },
        parameters: { type: 'object' }
      }
    }
  },
  handler: mcpHandler
});
```

### 6. Rollback Design
- `systemctl stop valor-api && systemctl disable valor-api`
- `rm /etc/systemd/system/valor-api.service`
- `userdel -r valorapi`
- Drop PostgreSQL database and user.
- Revert Nginx proxy configuration.
