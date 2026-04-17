# RegenValor AFFILIATE_MAP — Update SOP

**Last Updated:** 2026-04-16
**Status:** ACTIVE — Auto-detection scanner running daily at 06:00 UTC

---

## What Is the AFFILIATE_MAP?

The `AFFILIATE_MAP` is a JSON object in `/var/www/regen-valor/dist-server/index.js` on both VPS1 and VPS2. It maps product slugs to vendor names and affiliate URLs. When a customer clicks "Proceed to Payment," the checkout system groups cart items by vendor and redirects to the correct affiliate link.

**Current location (both servers):**
```
/var/www/regen-valor/dist-server/index.js
```

**Current entry count:** 19 products across 6 vendors

---

## When to Update

1. **New product added to RegenValor** — The daily auto-scanner will detect unmapped products and attempt to auto-map them based on vendor patterns (aires, lifewave, blockbluelight, etc.)
2. **New vendor partnership** — Must manually add the vendor pattern to `rv_product_scanner.py` on VDS (`/opt/apex-agent/rv_product_scanner.py`) AND the patcher on both VPS servers
3. **Affiliate link changes** — If a vendor changes their referral URL format, update the AFFILIATE_MAP entries on both VPS1 and VPS2

---

## How to Update Manually

### Option A: Use the Node.js Patcher (Recommended)

The patcher is deployed at `/var/www/regen-valor/rv_map_patcher.js` on both VPS servers.

```bash
# From VDS:
ssh vps1 'node /var/www/regen-valor/rv_map_patcher.js "{\"new-product-slug\":{\"vendor\":\"Vendor Name\",\"url\":\"https://vendor.com/?ref=regenvalor\"}}"'

# Do the same for VPS2:
ssh vps2 'node /var/www/regen-valor/rv_map_patcher.js "{\"new-product-slug\":{\"vendor\":\"Vendor Name\",\"url\":\"https://vendor.com/?ref=regenvalor\"}}"'

# Restart PM2 on both:
ssh vps1 'pm2 restart regen-valor'
ssh vps2 'pm2 restart regen-valor'
```

### Option B: Edit the File Directly

```bash
# On VPS1:
nano /var/www/regen-valor/dist-server/index.js
# Find "const AFFILIATE_MAP = {" and add your entry in the JSON object
# Then restart: pm2 restart regen-valor

# Repeat on VPS2
```

---

## Auto-Detection System

**Scanner:** `/opt/apex-agent/rv_product_scanner.py` on VDS
**Patcher:** `/var/www/regen-valor/rv_map_patcher.js` on VPS1 + VPS2
**Schedule:** Daily at 06:00 UTC (via `daily_fleet_and_prices.sh`)

### What It Does:
1. Extracts all product slugs from the client JS bundle on VPS1
2. Compares against the current AFFILIATE_MAP entries
3. For unmapped products, attempts to auto-map based on vendor name patterns
4. If auto-mapped: patches both VPS1 and VPS2 using the Node.js patcher, restarts PM2
5. If unknown vendor: sends Telegram alert for manual mapping
6. Reports status in the daily fleet scan

### Vendor Patterns (auto-mapping):
| Pattern in Slug | Maps to Vendor | Affiliate URL |
|----------------|---------------|---------------|
| `aires` | Aires Tech | https://airestech.com/?ref=regenvalor |
| `lifewave`, `x39`, `x40` | LifeWave | https://www.lifewave.com/regenvalor |
| `blockbluelight` | BlockBlueLight | https://www.blockbluelight.com/?ref=regenvalor |
| `healthyline` | HealthyLine | https://www.healthyline.com/?ref=regenvalor |
| `higherdose` | HigherDOSE | https://www.higherdose.com/?ref=regenvalor |
| `lifepro` | LifePro | https://lifeprofitness.com/?ref=regenvalor |
| `slnt`, `faraday` | SLNT | https://slnt.com/?ref=regenvalor |
| `valor` | Valor Exclusive | https://regenvalor.com/shop/ |

### Adding a New Vendor Pattern:
Edit `/opt/apex-agent/rv_product_scanner.py` on VDS, find `VENDOR_PATTERNS` dict, add:
```python
"new-pattern": {"vendor": "New Vendor Name", "url": "https://newvendor.com/?ref=regenvalor"},
```

---

## Current Product Map (19 entries)

| Slug | Vendor | Affiliate URL |
|------|--------|--------------|
| x39-lifewave-patch | LifeWave | https://www.lifewave.com/regenvalor |
| x40-lifewave-patch | LifeWave | https://www.lifewave.com/regenvalor |
| stem-cell-activation-x39 | LifeWave | https://www.lifewave.com/regenvalor |
| aires-lifetune-pendant | Aires Tech | https://airestech.com/?ref=regenvalor |
| aires-lifetune-sticker | Aires Tech | https://airestech.com/?ref=regenvalor |
| airestech-emf-protection | Aires Tech | https://airestech.com/?ref=regenvalor |
| aires-max-bundle | Aires Tech | https://airestech.com/products/max-bundle |
| aires-lifetune-zone-max | Aires Tech | https://airestech.com/?ref=regenvalor |
| aires-freedom-bundle | Aires Tech | https://airestech.com/?ref=regenvalor |
| aires-zone | Aires Tech | https://airestech.com/?ref=regenvalor |
| aires-zone-max | Aires Tech | https://airestech.com/?ref=regenvalor |
| blockbluelight-nightfall-glasses | BlockBlueLight | https://www.blockbluelight.com/?ref=regenvalor |
| healthyline-pemf-infrared-mat | HealthyLine | https://www.healthyline.com/?ref=regenvalor |
| higherdose-infrared-sauna-blanket | HigherDOSE | https://www.higherdose.com/?ref=regenvalor |
| lifepro-waver-vibration-plate | LifePro | https://lifeprofitness.com/?ref=regenvalor |
| slnt-faraday-bag | SLNT | https://slnt.com/?ref=regenvalor |
| valor-red-light-panel | Valor Exclusive | https://regenvalor.com/shop/valor-red-light-panel |
| full-shield-kit | Aires Tech | https://airestech.com/?ref=regenvalor |
| patches | LifeWave | https://www.lifewave.com/regenvalor |

---

## Troubleshooting

**"Checkout is being configured" error:**
- The AFFILIATE_MAP is missing or the server JS was corrupted
- Check: `curl -s -X POST https://regenvalor.com/api/checkout -H "Content-Type: application/json" -d '{"items":[{"slug":"x39-lifewave-patch","name":"Test","price":99}]}'`
- Should return JSON with `"mode":"affiliate"` and vendor groupings

**Scanner finds 0 products:**
- SSH key issue — VDS can't reach VPS1
- Fix: Ensure `ssh vps1` works from VDS (uses `~/.ssh/contabo_vds` key)

**Cloudflare routes to VPS1, NOT VPS2:**
- The primary origin for regenvalor.com is VPS1 (62.146.175.67)
- VPS2 is the backup — always patch BOTH servers

---

## Files Reference

| File | Server | Purpose |
|------|--------|---------|
| `/var/www/regen-valor/dist-server/index.js` | VPS1, VPS2 | Server with AFFILIATE_MAP |
| `/var/www/regen-valor/rv_map_patcher.js` | VPS1, VPS2 | Node.js patcher for safe map updates |
| `/opt/apex-agent/rv_product_scanner.py` | VDS | Auto-detection scanner |
| `/opt/apex-agent/daily_fleet_and_prices.sh` | VDS | Combined daily cron wrapper |
