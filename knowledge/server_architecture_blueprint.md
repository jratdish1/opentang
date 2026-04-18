# VetsInCrypto Server Architecture Blueprint

**Author**: Manus AI  
**Date**: April 17, 2026  
**Version**: 1.0  
**Classification**: CONFIDENTIAL

---

## Architecture Overview

The VetsInCrypto infrastructure operates across three dedicated servers connected via Tailscale mesh VPN, with Cloudflare providing the public-facing CDN, SSL termination, and DDoS protection layer. The VDS serves as the command center and SSH jump host, VPS1 hosts all web applications and crypto bots, and VPS2 functions as the domain hub and backup node. Two Windows machines (BTC1 mining rig and VIC desktop) connect through the Tailscale mesh for remote management.

![Architecture Diagram](server_architecture.png)

---

## Server Inventory

| Server | Role | Public IP | Tailscale IP | RAM | Disk | Disk Used | OS |
|--------|------|-----------|-------------|-----|------|-----------|-----|
| **VDS** | Command Center | 147.93.183.207 | 100.122.125.32 | 32 GB | 232 GB | 54% (123 GB) | Ubuntu 22.04 |
| **VPS1** | Web Apps & Bots | 62.146.175.67 | 100.83.14.115 | 8 GB | 145 GB | 17% (24 GB) | Ubuntu 22.04 |
| **VPS2** | Domain Hub & Backup | 85.239.239.206 | N/A | 8 GB | 145 GB | 11% (16 GB) | Ubuntu 22.04 |
| **BTC1** | Mining Rig | N/A | 100.72.21.58 | — | — | — | Windows |
| **VIC** | Desktop | N/A | 100.100.18.16 | — | — | — | Windows |

---

## VDS — Command Center (147.93.183.207)

The VDS is the nerve center of the entire operation. It runs all trading bots, the Apex monitoring stack, the Watchtower NDR platform, and serves as the SSH jump host to reach VPS1 and VPS2. With 32 GB RAM and only 7% memory utilization, it has significant headroom for additional workloads.

### PM2 Processes

| Process | Port | Status | Memory | Uptime | Purpose |
|---------|------|--------|--------|--------|---------|
| gitnexus-server | — | online | 113 MB | 7h | GitNexus code management |
| fincept-api | 4500 | online | 129 MB | 7h | Financial data API |
| polymarket-bot | — | online | 221 MB | 3h | Polymarket trading bot |
| kalshi-bot | — | online | 43 MB | 56m | Kalshi prediction market bot |
| kraken-bot | — | online | 35 MB | 44m | Kraken exchange trading bot |

### Docker Containers

| Container | Port | Status | Purpose |
|-----------|------|--------|---------|
| n8n | 5678 | Up 19h | Workflow automation platform |
| apex-redis | 6379 (localhost) | Up 19h (healthy) | Redis cache for Apex stack |
| hero-arb-bot | — | **Restarting** | HERO arbitrage bot — needs investigation |

### Systemd Services

| Service | Port | Purpose |
|---------|------|---------|
| apex-dashboard | 3080 | Apex Agent Ops Dashboard (Nginx reverse proxy) |
| apex-telegram | — | Telegram notification bot |
| apex-overwatch | — | Last line of defense monitor |
| apex-trading-safety | — | Kill switch + circuit breaker + P&L tracking |
| apex-supervisor (v2) | — | Bot supervisor |
| watchdog-supervisor | — | Watchdog for all PM2 processes |
| watchtower | — | Sovereign NDR (Network Detection & Response) |
| mining-pool-switcher | — | Auto-switches mining pools for profitability |
| mining-telemetry | — | Real-time miner data proxy API |
| btc1-auto-recovery | — | BTC1 mining rig auto-recovery |
| prereason-proxy | 1080 (localhost) | SOCKS5 proxy via VPS2 for PreReason API |
| ollama | 11434 (localhost) | Local LLM inference server |
| nginx | 80/443 | Reverse proxy for all VDS services |

### Nginx Sites (VDS)

The VDS Nginx configuration proxies to the following virtual hosts: `apex-dashboard`, `apex.herobase.io`, `cryptoqueens.io`, `mining-api`, `open-webui-tailscale`, and `ops.vetsincrypto.com`.

---

## VPS1 — Web Applications & Crypto Bots (62.146.175.67)

VPS1 is the primary web application server. It hosts the HERO Dapp (herobase.io), the RegenValor e-commerce platform, Valor Peptides, and the HERO ABLE trading bots. It runs MariaDB for database needs and PHP 8.3-FPM for WordPress sites. Memory utilization is at 20% (1.6 GB of 8 GB), leaving comfortable headroom.

### PM2 Processes

| Process | Port | Status | Memory | Restarts | Purpose |
|---------|------|--------|--------|----------|---------|
| hero-dapp | 3000 | online | 127 MB | 6 | herobase.io — HERO Dapp SPA |
| Hero-ABLE | — | online | 81 MB | 53 | HERO ABLE arbitrage bot (PulseChain) |
| Hero-ABLE-Base | — | online | 80 MB | 52 | HERO ABLE arbitrage bot (BASE) |
| hero-terminal | 3100 | online | 73 MB | 2 | HERO Terminal (PulseChain) |
| hero-terminal-base | 3101 | online | 72 MB | 4 | HERO Terminal (BASE) |
| regen-valor | 3200 | online | 112 MB | 10 | RegenValor.com e-commerce |
| regen-admin | — | online | 82 MB | 0 | RegenValor admin panel |
| valor-peptides | — | online | 127 MB | 0 | ValorPeptides.net |

### Infrastructure Services

| Service | Purpose |
|---------|---------|
| Nginx | Reverse proxy for 11 domains (herobase.io, vicfoundation.com, regenvalor.com, etc.) |
| MariaDB 10.11.14 | Database server (localhost:3306) |
| PHP 8.3-FPM | FastCGI for WordPress sites |
| Apex Sentinel v2 | Unified smart monitor |
| Watchtower Edge | Edge sensor for NDR platform |
| Tailscale | Mesh VPN node |
| Docker | Container runtime (no active containers) |
| Fail2Ban | Intrusion prevention |

### Nginx Virtual Hosts (VPS1)

| Domain | Backend |
|--------|---------|
| herobase.io | hero-dapp :3000 |
| api-hero.f0xy.dev | hero-terminal :3100 |
| api-hero-base.f0xy.dev | hero-terminal-base :3101 |
| regenvalor.com | regen-valor :3200 |
| regenvalor.pro | regen-valor :3200 |
| valorpeptides.net | valor-peptides |
| vicfoundation.com | Static/WordPress |
| dapp.vicfoundation.com | hero-dapp :3000 |
| hero501c3.io | Redirect/static |
| hero501c3.org | Redirect/static |

---

## VPS2 — Domain Hub & Backup (85.239.239.206)

VPS2 serves as the domain routing hub, handling 40+ domains through Nginx virtual hosts. It also runs backup instances of RegenValor and Valor Peptides, plus the AT FOAM API. Memory utilization is minimal at 13% (1 GB of 8 GB), and disk usage is only 11%. This server also runs Postfix for outbound email.

### PM2 Processes

| Process | Port | Status | Memory | Uptime | Purpose |
|---------|------|--------|--------|--------|---------|
| atfoam-api | 3001 | online | 97 MB | 42h | AT FOAM insulation API |
| regen-valor | 3100 | online | 108 MB | 19h | RegenValor backup instance |
| valor-peptides | 3101 | online | 117 MB | 8D | Valor Peptides backup instance |

### Infrastructure Services

| Service | Purpose |
|---------|---------|
| Nginx | Reverse proxy for 40+ domains |
| Postfix | SMTP mail server (:25) |
| Apex Sentinel v2 | Unified smart monitor |
| Watchtower Edge | Edge sensor for NDR platform |
| Docker | Container runtime |
| Fail2Ban | Intrusion prevention |

### Domain Portfolio (VPS2 — 40 domains)

The following domains are configured as Nginx virtual hosts on VPS2, organized by business category:

**HERO / Crypto**: hero501c3.com, basesonic.io, herosonic.io, cryptoqueens.io, cryptokingqueen.com, kindcrypto.io, kingbase.io, queenbase.io, queensonic.com, queensonic.io, kingpooie.com, queenpooie.com, kingqueenpooie.com, vetsincrypto.ai, vetsincrypto.com

**VIC Foundation**: vicfoundation.ai, vicfoundation.info, vicfoundation.net, vicfoundation.org, vicfoundation.shop, vicfoundation.store

**RegenValor**: regenvalor.com, regenvalor.info, regenvalor.io, regenvalor.net, regenvalor.org, regenvalor.shop, regenvalor.store, valorbiowellness.com, valorpeptides.net

**AT FOAM**: at-foam.ai, at-foam.com, atfoam.ai, atfoam.us, atfoaminsulation.com, sprayfoam-seattle.com

**Vets on Tour**: vetsontour.org, vetsontours.org, vetstour.com

**Mining**: mining.vetsincrypto.com

---

## Network Topology

### Connectivity Matrix

| From | To | Method | Purpose |
|------|----|--------|---------|
| Internet | VDS | Cloudflare → Nginx :443 | Public web traffic |
| Internet | VPS1 | Cloudflare → Nginx :443 | Public web traffic |
| Internet | VPS2 | Cloudflare → Nginx :443 | Public web traffic |
| VDS | VPS1 | SSH (direct) | Management, deployments |
| VDS | VPS2 | SSH (direct) | Management, deployments |
| VDS | BTC1 | Tailscale (100.72.21.58) | Mining rig management |
| VDS | VIC | Tailscale (100.100.18.16) | Desktop management |
| VDS | VPS1 | Tailscale (100.83.14.115) | Secure internal comms |
| Manus | VDS | SSH | Automation entry point |

### Security Layers

All three servers share a common security baseline consisting of Cloudflare CDN with SSL termination and DDoS protection at the edge, Fail2Ban for SSH brute-force prevention, the Watchtower NDR platform (sovereign on VDS, edge sensors on VPS1/VPS2), and Apex Sentinel v2 for unified monitoring. The VDS additionally runs Apex Overwatch as the "last line of defense" and the Trading Safety system with kill switches and circuit breakers for all trading bots.

### Port Exposure Summary

| Server | Public Ports | Internal-Only Ports |
|--------|-------------|-------------------|
| VDS | 22, 80, 443, 3080, 5678 | 1080 (SOCKS), 6379 (Redis), 11434 (Ollama), 4500, 8079, 8080, 8090 |
| VPS1 | 22, 80, 443 | 3000, 3100, 3101, 3200, 3306 (MariaDB), 8448, 8449 |
| VPS2 | 22, 25, 80, 443 | 3001, 3100, 3101, 3306 |

---

## Monitoring & Self-Healing Stack

The Apex monitoring ecosystem provides multi-layered observability and automated recovery across all servers.

| Component | Location | Role |
|-----------|----------|------|
| Apex Dashboard | VDS :3080 | Centralized ops dashboard |
| Apex Overwatch | VDS | Last line of defense — monitors everything |
| Apex Supervisor v2 | VDS | Bot lifecycle management |
| Apex Trading Safety | VDS | Kill switch, circuit breaker, P&L tracking |
| Apex Telegram Bot | VDS | Alert notifications to Telegram |
| Watchdog Supervisor | VDS | PM2 process watchdog |
| Watchtower NDR | VDS | Network detection & response (sovereign) |
| Watchtower Edge | VPS1, VPS2 | Edge sensors reporting to VDS |
| Apex Sentinel v2 | VPS1, VPS2 | Unified smart monitor on each node |
| BTC1 Auto-Recovery | VDS | Mining rig crash recovery |
| Mining Pool Switcher | VDS | Auto-switches pools for max profitability |

---

## Known Issues & Action Items

| Issue | Severity | Server | Action Required |
|-------|----------|--------|-----------------|
| hero-arb-bot constantly restarting | HIGH | VDS | Investigate Docker container crash loop |
| Hero-ABLE has 53 restarts | MEDIUM | VPS1 | Check logs, may need gas/wallet funding |
| Hero-ABLE-Base has 52 restarts | MEDIUM | VPS1 | Needs ETH on BASE for gas |
| regen-valor has 10 restarts | LOW | VPS1 | Check for memory leaks or errors |
| VDS disk at 54% | INFO | VDS | Monitor, clean old Docker images if needed |
| VPS2 has no Tailscale | INFO | VPS2 | Consider adding to mesh for secure management |

---

*This blueprint should be updated whenever infrastructure changes are made. Store in the knowledge base for future Manus instances.*
