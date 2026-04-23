# HERO NFT — PulseChain Architectural Blueprint v2.0
## Updated to Match herobase.io Claims (April 2026)

---

## 1. COLLECTION OVERVIEW

| Parameter | Value |
|-----------|-------|
| **Chain** | PulseChain (Chain ID 369) |
| **Standard** | ERC-721 (Immutable, No Admin) |
| **Total Collection** | 555 unique steampunk-military trading cards |
| **Split** | ~185 PulseChain Primary, ~185 BASE Primary, ~185 Shared |
| **Categories** | 10 (International Forces, First Responders, Historical Warriors, Special/Community, US Army, US Marines, US Navy, US Air Force, US Coast Guard, US Space Force) |
| **Theme** | Steampunk-Military Trading Cards |
| **Animated NFTs** | 4 video NFTs (UK, South Korea, US Marine, Mexico) |
| **Mint Revenue Split** | 85% Treasury (Charity), 15% Operations |
| **RNG Method** | Commit-Reveal (2-tx, no Chainlink VRF on PulseChain) |

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

Card rarity is PERMANENT — set at mint via Commit-Reveal RNG, never changes.

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

Identical contract to BASE chain with PulseChain-specific parameters:

| Parameter | BASE | PulseChain |
|-----------|------|------------|
| Mint Price | 0.001 ETH | 100,000 PLS |
| RNG | Chainlink VRF v2.5 | Commit-Reveal (2-tx) |
| Block Time | ~2s | ~10s |
| Diamond Hands calc | 216,000 blocks/30d | 259,200 blocks/30d |
| DEX Exclusions | Uniswap, Aerodrome | PulseX, 9mm, 9inch |

Key functions (same as BASE):
- `mint()` — 85/15 treasury/ops split
- `getRank(wallet)` — Dynamic rank based on HERO balance
- `getFeeReduction(wallet)` — Tiered 1-7% reduction (100-700 basis points)
- `hasValidHolding(wallet)` — Flash loan protection (1-block minimum hold)
- `getGovernanceMultiplier(wallet)` — 1x-5x voting power
- `getDiamondHandsMultiplier(wallet)` — 1.0x-3.0x time-weighted (+0.1x per 30 days, cap 3.0x)
- `getStakingBoost(wallet)` — +5% to +60% APY based on rank
- `isAirdropEligible(wallet)` — NFT ownership + valid holding check

### Commit-Reveal RNG (PulseChain-specific)

Since PulseChain has no Chainlink VRF:
1. **Commit**: User submits hash(secret + tokenId) + pays mint price
2. **Wait**: 5+ blocks pass (~50 seconds, anti-manipulation)
3. **Reveal**: User reveals secret — contract verifies hash, generates traits from future block hash + secret
4. **Result**: Provably fair — neither user nor miner could predict the outcome

---

## 4. ALL 10 UTILITIES (Matching herobase.io)

### Phase 1 — Core Utility (Every NFT Holder)
1. **Fee Reduction** — Tiered 1-7% based on rank (on-chain, automatic)
2. **Diamond Hands Rewards** — Time-weighted staking multiplier (1.0x-3.0x, +0.1x per 30 days held)

### Phase 2 — Enhanced Utility (All Holders)
3. **Governance Power** — Boosted DAO voting (Officers 2x, Generals 5x)
4. **Exclusive Airdrops** — Periodic HERO, VETS, partner token airdrops to holders only

### Phase 3 — Premium Utility (Rank-Dependent)
5. **Staking APY Boost** — +5% to +60% based on rank
6. **Rank Promotion** — NFT rank auto-upgrades as HERO balance grows

### Phase 3+ — Advanced Features
7. **Cross-Chain Bridging** — Lock-and-mint bridge between PulseChain and BASE
8. **Community Marketplace** — P2P trading on herobase.io
9. **Custom Animated NFT** — Legendary holders get custom animated NFT of their military branch/unit

### Utility Tiers:
- **Core**: Every NFT holder (Phase 1) — fee reduction, diamond hands, airdrops
- **Enhanced**: Rare, Ultra Rare, and Legendary card rarities unlock Enhanced Utility — governance boost, staking APY boost
- **Premium**: Legendary card rarity gets Premium Utility including custom animated NFT, maximum governance multiplier, and priority access to new features

> **Note:** Ultra Rare holders receive Enhanced Utility (same as Rare+). Only Legendary holders receive Premium Utility.

---

## 5. CROSS-CHAIN BRIDGING (Phase 3)

PulseChain NFTs can be bridged to BASE and vice versa:
- Lock NFT on source chain → Mint mirror on destination chain
- Bridge back → Burn mirror → Unlock original
- Metadata and rank travel with the NFT
- Only one instance exists at any time (no duplication)
- Fee discount applies on whichever chain the NFT currently resides

---

## 6. SECURITY GUARANTEES

- **NO owner()** — no admin can change anything
- **NO pause()** — contract cannot be stopped
- **NO proxy** — no upgrade path, code is final
- **NO setBaseURI()** — metadata URIs set at mint, immutable
- **NO withdraw()** — funds go directly to treasury/ops at mint time
- **Flash loan protection** — 1-block hold minimum before fee discount applies
- **ReentrancyGuard** — on all state-changing functions
- **Immutable addresses** — treasury, operations, HERO token set in constructor
- **True ownership** — lose your keys, lose your NFT forever. No recovery, no duplication.

---

## 7. DEPLOYMENT CHECKLIST

| Step | Action | Status |
|------|--------|--------|
| 1 | Deploy to PulseChain testnet (v4) | PENDING |
| 2 | Deploy HeroNFT.sol to PulseChain mainnet | PENDING |
| 3 | Upload 555 artworks to IPFS via Pinata (shared with BASE) | PENDING (waiting on artist) |
| 4 | Generate metadata JSON per token | PENDING |
| 5 | Update HERO token (PulseChain) to call getFeeReduction() | PENDING |
| 6 | Verify on PulseScan | PENDING |
| 7 | Configure Commit-Reveal for trait randomness | PENDING |
| 8 | Test mint on testnet with full utility verification | PENDING |

---

## 8. GAS ESTIMATES (PulseChain)

| Operation | Gas | Cost |
|-----------|-----|------|
| Mint (commit) | ~45,000 | ~$0.0002 |
| Mint (reveal) | ~180,000 | ~$0.0006 |
| Transfer | ~65,000 | ~$0.0003 |
| getRank() | ~30,000 (view, free) | $0 |
| getFeeReduction() | ~35,000 (view, free) | $0 |
| getDiamondHandsMultiplier() | ~25,000 (view, free) | $0 |
