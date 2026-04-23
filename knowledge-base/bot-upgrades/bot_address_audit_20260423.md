# Bot Address Audit — April 23, 2026

## CORRECT Addresses (from user):
- **PulseChain HERO Token:** `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27`
- **PulseChain Buy & Burn:** `0x9016a0DAA30bD29A51a1a2905352877947f904E9`
- **BASE HERO Token:** `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` (confirmed correct)
- **BASE Buy & Burn:** `0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670` (confirmed correct)
- **HABFF Contract (BASE):** `0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55` (confirmed correct)

## Issues Found:

### 1. hero_farm_arb.py (pm2: hero-farm-v6)
- **HERO_PULSECHAIN = `0x0000...0000` — PLACEHOLDER! WRONG!** → Should be `0x35a51Dfc...`
- **HERO_BASE = `0x00Fa69ED3b9B6E6e1c2e7D2a3D0A0b5D8f7C9E1A`** — WRONG! Missing correct checksum
  - Correct: `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8`
- **VETS_PULSECHAIN = `0x0000...0001` — PLACEHOLDER! WRONG!** → Should be `0x4013abBf94A745EfA7cc848989Ee83424A770060`

### 2. habff_arb_bot.py (pm2: habff-arb) — BASE ONLY
- HERO = `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` ✅ CORRECT
- HABFF = `0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55` ✅ CORRECT
- This bot is BASE-only, no PulseChain config needed

### 3. pulsechain_arb_v3.py (pm2: hero-vets-pulse? or not running)
- HERO = `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` ✅ CORRECT
- VETS = `0x4013abBf94A745EfA7cc848989Ee83424A770060` ✅ CORRECT

### 4. pulsechain_hero_vets_bot.py (pm2: hero-vets-pulse)
- HERO = `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` ✅ CORRECT
- VETS = `0x4013abBf94A745EfA7cc848989Ee83424A770060` ✅ CORRECT

### 5. Hero-ABLE/ArbBot.js (PulseChain)
- HERO = `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` ✅ CORRECT

### 6. Hero-ABLE-Base/ArbBot.js (BASE)
- HERO = `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` ✅ CORRECT

## ROOT CAUSE:
**hero_farm_arb.py has PLACEHOLDER addresses for PulseChain!** This is why PulseChain arb isn't working.
The BASE HERO address in hero_farm_arb.py is also WRONG (different from the real one).

## Fix Required:
1. Update hero_farm_arb.py lines 46-48 with correct addresses
2. Restart hero-farm-v6 via pm2
3. Verify transactions flow on PulseChain
