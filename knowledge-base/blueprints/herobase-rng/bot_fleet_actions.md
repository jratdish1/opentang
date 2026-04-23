# Bot Fleet Evaluation — Actions Taken

**Date:** 2026-04-23

## 1. Memory Optimization

| Bot | Before | After | Action |
|-----|--------|-------|--------|
| polymarket-bot | 215.1MB (no limit) | 300MB max-memory-restart | Added auto-restart at 300MB |
| kraken-bot-v2 | 37.4MB (33 restarts) | 200MB max-memory-restart | Added auto-restart at 200MB |
| kalshi-bot-v4 | 45.5MB (27 restarts) | 200MB max-memory-restart | Added auto-restart at 200MB |

## 2. Bot Status (Post-Fix)

| Bot | Status | Memory | Restarts |
|-----|--------|--------|----------|
| polymarket-bot | ONLINE | 136.4MB | 28 (reset) |
| fincept-api | ONLINE | 129.3MB | 0 |
| gitnexus-server | ONLINE | 116.8MB | 0 |
| hero-farm-v6 | ONLINE | 98.7MB | 1 (fixed earlier) |
| atfoam-api | ONLINE | 75.8MB | 15 |
| habff-arb | ONLINE | 72.2MB | 1 |
| base-hero-vol | ONLINE | 71.2MB | 2 |
| cross-chain-monitor | ONLINE | 70.7MB | 1 |
| hero-vets-pulse | ONLINE | 70.1MB | 0 (fixed earlier) |
| kalshi-bot-v4 | ONLINE | 45.5MB | 27 |
| kraken-bot-v2 | ONLINE | 37.4MB | 34 |

## 3. Cron Job Audit

- **Total active cron jobs:** ~65
- **Highest overlap:** 11 jobs at */30 minute mark, 8 at */5 minute mark
- **Concern:** 11 jobs running every 30 minutes could cause resource spikes
- **Recommendation:** Stagger the */30 jobs by 1-2 minutes each to reduce contention

## 4. Security Audit

### Open Ports on VDS:
- 22 (SSH) — Expected
- 80/443 (Nginx) — Expected
- 3001 (Apex agent) — Internal only (127.0.0.1) ✅
- 3080 (Nginx) — Public, needs review
- 3306 (Python listener) — Public (0.0.0.0) ⚠️ INVESTIGATE
- 4500 (Python listener) — Public (0.0.0.0) ⚠️ INVESTIGATE
- 5678 (Docker) — Public (0.0.0.0) ⚠️ INVESTIGATE
- 6379 (Redis/Docker) — Internal only (127.0.0.1) ✅
- 11434 (Ollama) — Internal only (127.0.0.1) ✅
- 15888 (Docker) — Internal only (127.0.0.1) ✅

### Action Items:
- [x] Added max-memory-restart to top 3 memory consumers
- [ ] Stagger cron jobs at */30 mark to reduce contention
- [ ] Investigate port 3306 (public Python listener — NOT MySQL)
- [ ] Investigate port 4500 (public Python listener)
- [ ] Investigate port 5678 (public Docker service)
- [ ] Lock down public ports with UFW firewall rules
