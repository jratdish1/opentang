# HERO NFT Collection — Artist Onboarding Guide

## Overview

Welcome to the HERO NFT project! This guide explains exactly what artwork you need to deliver, the technical requirements, and how your art gets turned into unique NFTs.

## How It Works

Your artwork is organized into **layers**. Each NFT is created by stacking layers on top of each other — like a sandwich. Our RNG (Random Number Generator) engine picks one option from each layer category to create a unique combination.

**Layer Order (bottom to top):**
1. **Background** — The base canvas (opaque, no transparency)
2. **Outfit** — Character clothing/armor (transparent PNG)
3. **Weapon** — Held item (transparent PNG)
4. **Rank** — Military rank insignia (transparent PNG)
5. **Badge** — Medal/award overlay (transparent PNG)
6. **Special** — Extra flair item (transparent PNG)

## What You Need to Deliver

### File Requirements

| Requirement | Value |
|-------------|-------|
| Format | PNG |
| Canvas Size | 2000 x 2000 pixels |
| Color Space | sRGB |
| Bit Depth | 8-bit (24-bit color + 8-bit alpha) |
| Background Layer | Opaque (no transparency) |
| All Other Layers | Transparent background (alpha channel) |

### Directory Structure

Organize your files exactly like this:

```
artwork/
├── Background/
│   ├── desert_storm.png
│   ├── urban_camo.png
│   ├── forest_green.png
│   ├── ocean_blue.png
│   ├── sunset_gold.png
│   ├── arctic_white.png
│   ├── neon_pulse.png
│   ├── holographic.png
│   ├── blockchain_matrix.png
│   └── american_flag_animated.png
├── Outfit/
│   ├── bdu_woodland.png
│   ├── bdu_desert.png
│   ├── pt_gear.png
│   ├── dress_blues.png
│   ├── flight_suit.png
│   ├── ghillie_suit.png
│   ├── tactical_black_ops.png
│   ├── space_force_suit.png
│   ├── gold_plated_armor.png
│   └── mjolnir_power_armor.png
├── Weapon/
│   ├── m16a4.png
│   ├── m4_carbine.png
│   ├── ka_bar_knife.png
│   ├── m249_saw.png
│   ├── m40_sniper.png
│   ├── tomahawk.png
│   ├── minigun.png
│   ├── plasma_rifle.png
│   ├── crayon_launcher.png
│   └── infinity_gauntlet.png
├── Rank/
│   ├── private_e_1.png
│   ├── lance_corporal_e_3.png
│   ├── corporal_e_4.png
│   ├── sergeant_e_5.png
│   ├── staff_sergeant_e_6.png
│   ├── gunnery_sergeant_e_7.png
│   ├── master_sergeant_e_8.png
│   ├── sergeant_major_e_9.png
│   ├── lieutenant_o_1.png
│   └── general_o_10.png
├── Badge/
│   ├── marksman.png
│   ├── sharpshooter.png
│   ├── expert_rifleman.png
│   ├── combat_action_ribbon.png
│   ├── bronze_star.png
│   ├── silver_star.png
│   ├── navy_cross.png
│   ├── purple_heart.png
│   └── medal_of_honor.png
└── Special/
    ├── none.png              ← Fully transparent 2000x2000
    ├── dog_tags.png
    ├── cigar.png
    ├── aviator_sunglasses.png
    ├── war_paint.png
    ├── crypto_tattoo.png
    ├── holographic_shield.png
    ├── eagle_companion.png
    └── pulsechain_aura.png
```

### File Naming Convention

Convert the trait name to lowercase, replace spaces with underscores, remove special characters:
- "Desert Storm" → `desert_storm.png`
- "Private (E-1)" → `private_e_1.png`
- "Ka-Bar Knife" → `ka_bar_knife.png`

### Total Files Needed

| Category | Files | Notes |
|----------|-------|-------|
| Background | 10 | Opaque, full canvas |
| Outfit | 10 | Transparent PNG |
| Weapon | 10 | Transparent PNG |
| Rank | 10 | Transparent PNG |
| Badge | 9 | Transparent PNG |
| Special | 9 | Including one fully transparent "none.png" |
| **TOTAL** | **58** | |

## Rarity Tiers

Each trait has a rarity that determines how often it appears:

| Rarity | Chance | Color Code | Examples |
|--------|--------|------------|----------|
| Common | 50% | Gray | Desert Storm, BDU Woodland, M16A4 |
| Uncommon | 25% | Green | Ocean Blue, Dress Blues, M249 SAW |
| Rare | 15% | Blue | Arctic White, Ghillie Suit, Tomahawk |
| Epic | 7% | Purple | Holographic, Space Force Suit, Plasma Rifle |
| Legendary | 3% | Gold | American Flag Animated, Mjolnir Power Armor, Infinity Gauntlet |

**Tip for the artist:** Legendary items should look SIGNIFICANTLY more impressive than Common ones. The rarity should be visually obvious.

## Design Guidelines

1. **Consistency**: All layers must align perfectly when stacked. Use the same character pose/position across all Outfit, Weapon, Rank, Badge, and Special layers.

2. **Positioning**: Create a template with guide lines showing where each layer type sits:
   - Outfit: Full body coverage
   - Weapon: Right hand / hip area
   - Rank: Left chest area
   - Badge: Right chest area
   - Special: Varies (head, shoulders, aura)

3. **Quality**: Legendary items should have more detail, glow effects, or animation-ready elements. Common items should be clean but simpler.

4. **Theme**: Military veteran + crypto culture. Think: Marine Corps meets cyberpunk meets blockchain.

5. **"None" Special**: The `none.png` in Special category must be a fully transparent 2000x2000 PNG (50% of NFTs will have no special item).

## Delivery Process

1. **Deliver artwork** as a ZIP file with the directory structure above
2. **We run validation** — our pipeline checks dimensions, transparency, naming
3. **Review session** — We composite a few test NFTs for your approval
4. **Finalize** — Lock the artwork manifest (SHA-256 hashes recorded)
5. **Mint** — RNG engine generates traits, compositor layers your art, uploaded to IPFS

## Questions?

Contact: VETSCrypto@pm.me

---

*Built for Veterans, by Veterans. Semper Fi.*
