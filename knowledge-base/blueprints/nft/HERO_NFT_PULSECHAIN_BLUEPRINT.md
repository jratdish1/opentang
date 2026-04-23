# HERO NFT — PulseChain Blueprint (v2.0)
## Updated to Match Immutable Ownership Spec v2.0 (April 2026)

---

## 1. COLLECTION OVERVIEW

| Parameter | Value |
|-----------|-------|
| **Chain** | PulseChain (Chain ID 369) |
| **Standard** | ERC-721 (Immutable, ERC-2981 Royalties) |
| **Collection Size** | 1,000 NFTs (independent PulseChain collection) |
| **Total Across Both Chains** | 2,000 (1,000 BASE + 1,000 PulseChain) |
| **Trait Categories** | 6 (Background, Outfit, Weapon, Rank, Badge, Special) |
| **Options per Category** | 9–10 |
| **Total Possible Combinations** | 810,000+ |
| **Theme** | Steampunk-Military Trading Cards |
| **Animated NFTs** | 4 video NFTs (UK, South Korea, US Marine, Mexico) |
| **Max Per Wallet** | 5 |
| **Mint Price** | 100,000 PLS |
| **Mint Revenue Split** | 85% Treasury (Charity), 15% Operations |
| **RNG Method** | Commit-Reveal (2-tx, no Chainlink VRF on PulseChain) |
| **Cross-Chain** | NO — Independent collection, no bridge dependency |

---

## 2. TRAIT RARITY SYSTEM

Each individual trait has a rarity that determines how often it appears during minting:

| Rarity | Chance | Color Code | Example Traits |
|--------|--------|------------|----------------|
| Common | 50% | Gray | Desert Storm, BDU Woodland, M16A4 |
| Uncommon | 25% | Green | Ocean Blue, Dress Blues, M249 SAW |
| Rare | 15% | Blue | Arctic White, Ghillie Suit, Tomahawk |
| Epic | 7% | Purple | Holographic, Space Force Suit, Plasma Rifle |
| Legendary | 3% | Gold | American Flag Animated, Mjolnir Power Armor, Infinity Gauntlet |

Trait rarity is PERMANENT — set at mint via Commit-Reveal RNG, never changes.

---

## 3. NFT UTILITY — FLAT 2% FEE DISCOUNT

All HERO NFT holders on PulseChain receive a **flat 2% fee reduction** on all $HERO transfers. This is the primary utility and is enforced entirely on-chain.

| Scenario | Sender NFT | Receiver NFT | Fee | Savings |
|----------|-----------|-------------|-----|--------|
| Normal transfer | NO | NO | 5.00% | $0 |
| Sender holds NFT | YES | NO | 3.00% | 2.00% |
| Receiver holds NFT | NO | YES | 3.00% | 2.00% |
| Both hold NFTs | YES | YES | 3.00% | 2.00% |
| DEX router (excluded) | N/A | N/A | 0.00% | N/A |

**Flash Loan Protection:** NFT must be held for at least 1 block before discount activates.

**Gas Cost:** ~5,200 gas (~$0.0001) — Essentially free.

### Additional Utilities

| Utility | Description | Implementation |
|---------|-------------|---------------|
| **2% Fee Discount** | Reduced fee on all $HERO transfers | On-chain `balanceOf` check |
| **DAO Voting** | Weighted voting power in HERO DAO | `balanceOf` check in DAO contract |
| **Holder Rewards** | Eligible for quarterly airdrop rewards | Snapshot of NFT holders |
| **Spin Wheel Bonus** | Extra daily spins for NFT holders | `balanceOf` check in spin engine |
| **Giveaway Priority** | Priority entry in community raffles | `balanceOf` check in raffle engine |

---

## 4. SMART CONTRACT — HeroNFT v2.0 (Immutable)

Identical contract to BASE chain with PulseChain-specific parameters:

| Parameter | BASE | PulseChain |
|-----------|------|------------|
| Mint Price | 0.001 ETH | 100,000 PLS |
| RNG | Chainlink VRF v2.5 | Commit-Reveal (2-tx) |
| Block Time | ~2s | ~10s |
| DEX Exclusions | Uniswap, Aerodrome | PulseX, 9mm, 9inch |
| Fee Discount | 2% on BASE only | 2% on PulseChain only |

- Solidity ^0.8.20, OpenZeppelin v5
- ERC721, ERC721Enumerable, ERC721Burnable, ERC2981
- `MAX_SUPPLY = 1000` — hardcoded constant
- `MINTER` — immutable address set in constructor

Key functions:
- `mint(to, tokenId)` — Only callable by MINTER, enforces MAX_SUPPLY
- `balanceOf(wallet)` — Used by HERO token contract for 2% fee discount verification
- `hasValidHolding(wallet)` — Flash loan protection (1-block hold minimum)
- `burn(tokenId)` — Owner only, permanently destroys token
- `totalMinted()` — Returns current supply
- `remainingSupply()` — Returns MAX_SUPPLY - totalSupply()

### Commit-Reveal RNG (PulseChain-specific)

Since PulseChain has no Chainlink VRF:
1. **Commit**: User submits hash(secret + tokenId) + pays mint price (100,000 PLS)
2. **Wait**: 5+ blocks pass (~50 seconds, anti-manipulation)
3. **Reveal**: User reveals secret — contract verifies hash, generates traits from future block hash + secret
4. **Result**: Provably fair — neither user nor miner could predict the outcome

---

## 5. SECURITY GUARANTEES

- **NO owner()** — no admin can change anything
- **NO pause()** — contract cannot be stopped
- **NO proxy** — no upgrade path, code is final
- **NO setBaseURI()** — metadata URIs set at mint, immutable
- **NO blacklist/whitelist** — anyone can buy, sell, or transfer
- **Immutable MINTER** — minter address set in constructor and locked forever
- **ERC-2981 Royalties** — optional, set in constructor
- **Flash loan protection** — 1-block hold minimum before fee discount applies
- **True ownership** — lose your keys, lose your NFT forever. No recovery, no duplication.

---

## 6. DEPLOYMENT CHECKLIST

### Pre-Deployment:
1. Artist delivers all layer PNGs (58 files across 6 categories)
2. Run artist-pipeline.ts to generate 1,000 composite images
3. Generate 1,000 metadata JSON files (PulseChain-specific fields)
4. Upload images + metadata to IPFS via Pinata
5. Verify IPFS CIDs are pinned on Pinata + nft.storage (redundancy)
6. Compile contracts with Solidity 0.8.20+ (OpenZeppelin v5)

### Deployment Order:
1. Deploy HeroMinter (get address)
2. Deploy HeroNFT with minter address, IPFS CID, royalty config
3. Set NFT address in minter (one-time, then locked)
4. Deploy/update HeroToken with NFT contract address
5. Verify on PulseScan
6. Configure Commit-Reveal for trait randomness
7. Test full mint flow on PulseChain testnet (v4)
8. Go live on PulseChain mainnet

### Post-Deployment:
- **NOTHING TO DO** — contracts are immutable
- No admin keys to secure
- No multisig to manage
- No proxy to worry about

---

## 7. GAS ESTIMATES (PulseChain)

| Operation | Gas | Cost |
|-----------|-----|------|
| Mint (commit) | ~45,000 | ~$0.0002 |
| Mint (reveal) | ~180,000 | ~$0.0006 |
| Transfer | ~65,000 | ~$0.0003 |
| balanceOf() | ~5,200 (view, free) | $0 |
| hasValidHolding() | ~5,500 (view, free) | $0 |

---

## 8. COLLECTION CAPACITY

| Metric | Value |
|--------|-------|
| Max Supply | 1,000 |
| Trait Categories | 6 |
| Options per Category | 9–10 |
| Total Possible Combinations | 810,000+ |
| Duplicate Probability | < 0.12% at 1,000 mints |
| Max Per Wallet | 5 |
| Gas per Mint | ~$0.001 |

---

## 9. BURN MECHANICS

- Only the token OWNER can burn their NFT
- `burn(tokenId)` permanently destroys the token
- Token ID is never reused
- Total supply decreases permanently
- **Burning removes the 2% fee discount** (if that was the holder's only NFT)
- **There is no undo** — burned = gone forever

---

*Built for Veterans, by Veterans. No admin. No kill switch. True ownership. Semper Fi.*
