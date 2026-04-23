# HERO NFT — BASE Chain Architectural Blueprint v2.0
## Updated to Match herobase.io Claims (April 2026)

---

## 1. COLLECTION OVERVIEW

| Parameter | Value |
|-----------|-------|
| **Chain** | BASE (Coinbase L2) |
| **Standard** | ERC-721 (Immutable, No Admin) |
| **Total Collection** | 555 unique steampunk-military trading cards |
| **Split** | ~185 PulseChain Primary, ~185 BASE Primary, ~185 Shared |
| **Categories** | 10 (International Forces, First Responders, Historical Warriors, Special/Community, US Army, US Marines, US Navy, US Air Force, US Coast Guard, US Space Force) |
| **Theme** | Steampunk-Military Trading Cards |
| **Animated NFTs** | 4 video NFTs (UK, South Korea, US Marine, Mexico) |
| **Mint Revenue Split** | 85% Treasury (Charity), 15% Operations |

---

## 2. DUAL RARITY + RANK SYSTEM

### 2a. Card Rarity (Visual — Immutable at Mint)

| Rarity | Style | % of Collection |
|--------|-------|-----------------|
| Common | Bronze Metallic | 20% |
| Uncommon | Silver Metallic | 20% |
| Rare | Gold Metallic | 30% |
| Ultra Rare | Purple Diamond | 20% |
| Legendary | Holographic Rainbow | 10% |

Card rarity is PERMANENT — set at mint via RNG, never changes.

**Utility Access by Rarity:**
- **Core Utility** (All rarities): Fee reduction, diamond hands, exclusive airdrops
- **Enhanced Utility** (Rare, Ultra Rare, Legendary): Governance boost, staking APY boost
- **Premium Utility** (Legendary only): Custom animated NFT, maximum governance multiplier, priority access to new features

> **Note:** Ultra Rare holders receive Enhanced Utility (same as Rare+). Only Legendary holders receive Premium Utility.

### 2b. Rank System (Utility — Dynamic Based on HERO Holdings)

| Rank | HERO Required | Fee Reduction | Governance Mult | Staking Boost |
|------|--------------|---------------|-----------------|---------------|
| Private (E-1) | 1,000+ | 1% | 1x | +5% APY |
| Corporal (E-4) | 10,000+ | 2% | 1.5x | +10% APY |
| Sergeant (E-5) | 50,000+ | 3% | 2x | +15% APY |
| Lieutenant (O-2) | 250,000+ | 4% | 3x | +25% APY |
| Colonel (O-6) | 1,000,000+ | 5% | 4x | +40% APY |
| General (O-10) | 5,000,000+ | 7% (zero-fee) | 5x | +60% APY |

Rank is DYNAMIC — automatically upgrades/downgrades as HERO balance changes.

---

## 3. SMART CONTRACT — HeroNFT.sol (Immutable)

Key functions:
- `mint()` — Mint with 85/15 treasury/ops split, set card rarity + IPFS URI
- `getRank(wallet)` — Returns dynamic rank based on HERO token balance
- `getFeeReduction(wallet)` — Returns tiered fee reduction (100-700 basis points)
- `hasValidHolding(wallet)` — Flash loan protection (1-block hold minimum)
- `getGovernanceMultiplier(wallet)` — Returns voting power multiplier (10-50, scaled by 10)
- `getDiamondHandsMultiplier(wallet)` — Time-weighted staking multiplier (1.0x-3.0x, +0.1x per 30 days)
- `getStakingBoost(wallet)` — Returns APY boost in basis points (500-6000)
- `isAirdropEligible(wallet)` — Checks NFT ownership + valid holding for exclusive airdrops

Security: NO owner, NO pause, NO proxy, NO upgrade, NO withdraw, NO setBaseURI. ReentrancyGuard on all state-changing functions. Immutable constructor addresses.

---

## 4. HERO TOKEN INTEGRATION

HERO token contract calls `HeroNFT.getFeeReduction(wallet)` during every transfer. Best reduction between sender and receiver applies. Flash loan protection via `hasValidHolding()`.

---

## 5. DEPLOYMENT

1. Deploy to BASE Sepolia testnet first
2. Deploy HeroNFT.sol to BASE mainnet
3. Upload 555 artworks to IPFS via Pinata
4. Generate metadata JSON per token
5. Update HERO token to call getFeeReduction()
6. Verify on BaseScan
7. Configure Chainlink VRF v2.5 for trait randomness
