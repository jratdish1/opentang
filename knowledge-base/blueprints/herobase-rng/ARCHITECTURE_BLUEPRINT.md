# HEROBASE.IO — RNG MODULE ARCHITECTURE BLUEPRINT

**Version:** 2.0 (Post-Audit, VRF-Integrated)
**Date:** 2026-04-23
**Author:** Manus AI Agent
**Status:** DEPLOYED TO PRODUCTION

---

## System Overview

The HERO RNG System is a modular, multi-tier random number generation framework designed for the HERO ecosystem on PulseChain and BASE chains. It powers 5 consumer-facing applications (DAO governance, NFT minting, community giveaways, holder rewards, and daily engagement) through a shared RNG engine with 3 tiers of randomness quality.

```
┌─────────────────────────────────────────────────────────────┐
│                    HEROBASE.IO FRONTEND                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │DAO Props │ │NFT Mint  │ │Giveaways │ │Spin Wheel│       │
│  │  Page    │ │  Page    │ │  Page    │ │  Page    │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │             │             │             │             │
│  ┌────┴─────────────┴─────────────┴─────────────┴──────┐    │
│  │              tRPC API Layer (Express)                 │    │
│  └────┬─────────────┬─────────────┬─────────────┬──────┘    │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼───────────┐
│       ▼             ▼             ▼             ▼           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SHARED RNG ENGINE (rng-engine.ts)       │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐     │    │
│  │  │  T1     │  │  T2     │  │  T3              │     │    │
│  │  │Off-Chain│  │ Direct  │  │ Subscription     │     │    │
│  │  │ FREE    │  │ ~0.25   │  │ ~0.10 LINK/req   │     │    │
│  │  │ Block   │  │ LINK    │  │ Batch VRF        │     │    │
│  │  │ Hash +  │  │ VRF/    │  │ (BASE only)      │     │    │
│  │  │keccak256│  │Commit-  │  │                   │     │    │
│  │  │         │  │Reveal   │  │                   │     │    │
│  │  └─────────┘  └─────────┘  └─────────────────┘     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           VRF PROVIDER (vrf-provider.ts)             │    │
│  │  ┌──────────────────┐  ┌──────────────────────┐     │    │
│  │  │ Chainlink VRF    │  │ Commit-Reveal        │     │    │
│  │  │ v2.5 (BASE)      │  │ (PulseChain)         │     │    │
│  │  │ Coordinator:     │  │ Block hash +          │     │    │
│  │  │ 0x271682...      │  │ crypto.randomBytes    │     │    │
│  │  └──────────────────┘  └──────────────────────┘     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          EMAIL NOTIFICATION (email-notify.ts)        │    │
│  │  ProtonMail Bridge → VETSCrypto@pm.me               │    │
│  │  Rate limit: 10/hour | HTML sanitized               │    │
│  └─────────────────────────────────────────────────────┘    │
│                         SERVER (VPS1)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Module Inventory (12 Modules)

### Tier 1: Shared Infrastructure (3 modules)

| # | Module | File | Purpose | Dependencies |
|---|--------|------|---------|-------------|
| 1 | **RNG Engine** | `shared/rng-engine.ts` | Core random number generation with 3 tiers | ethers v6, keccak256 |
| 2 | **VRF Provider** | `shared/vrf-provider.ts` | Chainlink VRF v2.5 (BASE) + Commit-Reveal (PulseChain) | ethers v6, crypto |
| 3 | **Email Notifier** | `shared/email-notify.ts` | Transactional email via ProtonMail Bridge | nodemailer |

### Tier 2: Application Engines (5 modules)

| # | Module | File | Purpose | RNG Tier |
|---|--------|------|---------|----------|
| 4 | **DAO RNG Fallback** | `dao-fallback/dao-rng-fallback.ts` | Quarterly charity proposal voting + auto-fallback | T1 (voting) / T2 (fallback draw) |
| 5 | **NFT Trait Engine** | `nft-traits/nft-trait-engine.ts` | Provably fair trait generation for HERO NFTs | T1 (preview) / T2 (mint) |
| 6 | **Raffle Engine** | `giveaways/raffle-engine.ts` | Community giveaway/raffle management | T1 (free) / T2 (high-value) |
| 7 | **Rewards Engine** | `holder-rewards/rewards-engine.ts` | Weighted random holder selection for airdrops | T1 |
| 8 | **Spin Engine** | `spin-wheel/spin-engine.ts` | Daily engagement wheel with cooldowns | T1 |

### Tier 3: Frontend Pages (4 modules)

| # | Module | File | Purpose |
|---|--------|------|---------|
| 9 | **DAO Proposals Page** | `dao-fallback/DAOProposals.tsx` | Vote on charity proposals, view results |
| 10 | **NFT Mint Page** | `nft-traits/NFTMint.tsx` | Preview + mint HERO NFTs with random traits |
| 11 | **Giveaways Page** | `giveaways/Giveaways.tsx` | Enter raffles, view winners |
| 12 | **Spin Wheel Page** | `spin-wheel/SpinWheel.tsx` | Animated daily spin with CSPRNG |

### Supporting: Client-Safe Constants (1 module)

| # | Module | File | Purpose |
|---|--------|------|---------|
| — | **NFT Trait Constants** | `nft-trait-constants.ts` | Static trait data for client-side preview (no ethers dependency) |

---

## Module Deep Dives

### Module 1: RNG Engine (`rng-engine.ts`)

**Purpose:** Central randomness provider for all HERO ecosystem applications.

**Architecture:**
```
generateRandom(seed, min, max, options?)
  ├── T1: keccak256(blockHash + timestamp + seed) → BigInt → modulo
  ├── T2: VRFProvider.requestDirect() → on-chain verifiable
  └── T3: VRFProvider.requestSubscription() → batch on-chain

deterministicRandom(seed, min, max)
  └── Pure keccak256 hash → same seed = same output (for previews)
```

**Key Design Decisions:**
- BigInt precision guard: `max` must be < `Number.MAX_SAFE_INTEGER`
- T1 uses block hash + keccak256 for off-chain randomness (free, 250 draws/day)
- T2/T3 delegate to VRF Provider for on-chain verifiable randomness
- `deterministicRandom()` is pure — same input always produces same output

**Security Properties:**
- T1: Unpredictable to external observers (block hash not known in advance)
- T2: Verifiable on-chain via Chainlink VRF proof
- T3: Same as T2 but batched for cost efficiency

---

### Module 2: VRF Provider (`vrf-provider.ts`)

**Purpose:** Bridge to Chainlink VRF v2.5 on BASE and commit-reveal on PulseChain.

**Architecture:**
```
VRFProvider
  ├── constructor(config) → validates coordinatorAddress, keyHash, subscriptionId
  ├── requestDirect(numWords) → Chainlink VRF v2.5 direct funding (BASE)
  │   └── Calls coordinator.requestRandomWords() → waits for fulfillment
  ├── requestSubscription(numWords) → Chainlink VRF v2.5 subscription (BASE)
  │   └── Calls coordinator.requestRandomWords() → batch fulfillment
  └── commitReveal(provider) → PulseChain fallback
      ├── Phase 1: Commit hash(crypto.randomBytes(32) + blockNumber)
      ├── Phase 2: Wait N blocks
      └── Phase 3: Reveal with future block hash → XOR with secret
```

**Chain Support:**
- **BASE:** Chainlink VRF v2.5 (coordinator: `0x271682DEB8C4E0901D1a1550aD2e64D568E69909`)
- **PulseChain:** Commit-reveal scheme (no native Chainlink VRF)

**Cost Model:**
- T2 Direct: ~0.25 LINK per request
- T3 Subscription: ~0.10 LINK per request (batch discount)
- Commit-Reveal: Gas only (no LINK required)

---

### Module 3: Email Notifier (`email-notify.ts`)

**Purpose:** Send transactional emails for DAO results, raffle winners, etc.

**Architecture:**
```
sendDAOWinnerEmail(winner, proposalTitle, isRNGFallback)
  ├── To: VETSCrypto@pm.me
  ├── Subject: "HERO DAO quarterly winner of the treasury"
  ├── Body: Winner details, vote counts, RNG proof (if fallback)
  └── Rate limit: 10 emails/hour (sliding window)

Shared Helpers:
  ├── escapeHtml(str) → prevents XSS in HTML emails
  ├── escapeText(str) → sanitizes plain text
  ├── formatNomineeListHtml(nominees) → DRY nominee table
  ├── formatNomineeListText(nominees) → DRY nominee text
  └── isRateLimited() → checks emailLog array (filter-based, O(n))
```

**Security:**
- HTML sanitization on all user-supplied data
- Rate limiting prevents email flooding
- TLS via ProtonMail Bridge (rejectUnauthorized=false for local bridge)
- Email validation on recipient address

---

### Module 4: DAO RNG Fallback (`dao-rng-fallback.ts`)

**Purpose:** Quarterly charity proposal system with automatic RNG fallback when quorum isn't met.

**Flow:**
```
1. createProposal(title, nominees[3], quorum=10%, deadline=90days)
2. castVote(proposalId, nomineeIndex, voterWallet, tokenBalance)
   └── Wallet validation (0x + 40 hex chars)
   └── Token-weighted voting (1 HERO = 1 vote)
3. At deadline:
   ├── IF quorum met → winner = highest votes
   └── IF quorum NOT met → RNG fallback:
       ├── generateRandom(blockHash + proposalId) → pick from 3 nominees
       ├── sendDAOWinnerEmail(winner, "HERO DAO quarterly winner of the treasury", isRNG=true)
       └── Record RNG proof for transparency
```

**Quorum Logic:**
- Default: 10% of total HERO supply must vote
- If quorum not met by deadline, RNG picks automatically
- No human intervention needed — treasury keeps moving

---

### Module 5: NFT Trait Engine (`nft-trait-engine.ts`)

**Purpose:** Generate provably fair trait combinations for HERO NFTs.

**Architecture:**
```
HERO_TRAIT_CATEGORIES (7 categories, 9-10 options each):
  Background → Body → Headgear → Weapon → Rank → Medal → Special

generateTrait(tokenId, categoryIndex, blockHash, userSecret?)
  ├── salt = keccak256(tokenId + categoryIndex + blockHash + userSecret)
  ├── seed = deterministicRandom(salt, 0, totalWeight)
  └── Walk weighted options → return selected trait

generateNFTTraits(tokenId, blockHash, userSecret?)
  └── Promise.all(categories.map(generateTrait)) → full trait set
```

**Rarity Distribution:**
| Tier | Weight | Probability |
|------|--------|-------------|
| Common | 50 | ~40.3% |
| Uncommon | 25 | ~20.2% |
| Rare | 15 | ~12.1% |
| Epic | 7 | ~5.6% |
| Legendary | 3 | ~2.4% |

**Preview vs Mint:**
- **Preview:** Uses `deterministicRandom()` client-side (no ethers, no gas)
- **Mint:** Uses `generateTrait()` server-side with blockHash + userSecret (anti-frontrunning)

---

### Module 6: Raffle Engine (`raffle-engine.ts`)

**Purpose:** Manage community giveaways with provably fair winner selection.

**Architecture:**
```
createRaffle(title, prize, maxEntries, deadline, holdersOnly?)
  └── Returns raffleId

enterRaffle(raffleId, walletAddress)
  └── Validates wallet format, checks eligibility, prevents duplicates

drawWinner(raffleId)
  ├── entries = getEntries(raffleId)
  ├── seed = keccak256(blockHash + raffleId + entryCount)
  ├── winnerIndex = generateRandom(seed, 0, entries.length)
  └── Returns winner wallet + RNG proof

processExpiredRaffles()
  └── Promise.all(expired.map(drawWinner)) → parallel processing
```

---

### Module 7: Rewards Engine (`holder-rewards/rewards-engine.ts`)

**Purpose:** Weighted random selection of HERO holders for bonus airdrops.

**Architecture:**
```
createRewardRound(title, prizePool, numWinners, snapshotBlock)
  └── Validates: numWinners > 0, prizePool > 0

processSnapshot(roundId, holders[{wallet, balance}], exclusions?)
  ├── Filter excluded wallets (validated format)
  ├── Weight by balance (more HERO = higher chance)
  ├── For each winner slot:
  │   ├── seed = keccak256(blockHash + roundId + slotIndex)
  │   ├── generateRandom(seed, 0, totalWeight)
  │   └── Walk weighted list → select winner (remove from pool)
  └── Returns winners[] with amounts

Distribution: prizePool / numWinners (equal split)
```

---

### Module 8: Spin Engine (`spin-wheel/spin-engine.ts`)

**Purpose:** Daily engagement wheel with configurable segments and cooldowns.

**Architecture:**
```
Wheel Configuration:
  segments: [{label, weight, prize, rarity}]
  cooldownMs: 86400000 (24 hours)

spin(walletAddress)
  ├── Validate wallet format (0x + 40 hex)
  ├── Check cooldown (lastSpin + cooldownMs < now)
  ├── Validate segment weights (all > 0, totalWeight > 0)
  ├── seed = keccak256(blockHash + wallet + timestamp)
  ├── value = generateRandom(seed, 0, totalWeight)
  ├── Walk weighted segments → select winner
  └── Record spin + return result with proof

Default Segments:
  50 HERO (Common, 40%) | 100 HERO (Uncommon, 25%) | 250 HERO (Rare, 15%)
  500 HERO (Epic, 10%) | 1000 HERO (Legendary, 5%) | Try Again (5%)
```

---

### Module 9-12: Frontend Pages

**Shared Patterns:**
- All pages use React 18+ with TypeScript
- Wallet connection via `window.ethereum` (MetaMask/WalletConnect)
- Chain detection for PulseChain (369) and BASE (8453)
- Responsive design with Tailwind CSS
- Loading states, error handling, and empty states

**NFTMint.tsx Specifics:**
- Imports from `nft-trait-constants.ts` (client-safe, no ethers)
- Preview uses `crypto.getRandomValues()` (CSPRNG, not Math.random)
- "PREVIEW ONLY" badge clearly distinguishes from actual mint
- Rarity color coding: Common(gray) → Legendary(yellow)

**SpinWheel.tsx Specifics:**
- Canvas-based animated wheel with CSS transitions
- Uses `crypto.getRandomValues()` for client-side spin animation
- Actual prize determination via server-side RNG engine
- Weighted slice angles match configured segment weights
- setTimeout cleanup ref for component unmount

---

## Security Architecture

### Input Validation (All Modules)
- Wallet format: `/^0x[a-fA-F0-9]{40}$/`
- BigInt precision: `max < Number.MAX_SAFE_INTEGER`
- Segment weights: `weight > 0`, `totalWeight > 0`
- Email validation: Basic format check
- numWords validation (VRF): 1-500 range

### Anti-Gaming Measures
- NFT mint uses server-side blockHash (not predictable by user)
- Optional `userSecret` parameter adds user-specific entropy
- Spin cooldown prevents rapid re-spinning
- Raffle prevents duplicate entries per wallet
- DAO voting is token-weighted (can't create fake votes without tokens)

### Cryptographic Properties
- T1: keccak256 (SHA-3 family) — collision-resistant, one-way
- T2: Chainlink VRF — verifiable, tamper-proof, on-chain proof
- T3: Same as T2, batch mode
- Client-side: `crypto.getRandomValues()` — CSPRNG (replaced Math.random)

---

## Deployment Architecture

```
Production (VPS1 - 62.146.175.67):
  /root/hero-dapp/
    ├── client/src/
    │   ├── pages/
    │   │   ├── DAOProposals.tsx
    │   │   ├── NFTMint.tsx
    │   │   ├── Giveaways.tsx
    │   │   ├── HolderRewards.tsx
    │   │   └── SpinWheel.tsx
    │   └── lib/
    │       └── nft-trait-constants.ts
    └── server/
        ├── rng-engine.ts (NOT in client — ethers dependency)
        ├── vrf-provider.ts
        ├── email-notify.ts
        ├── dao-rng-fallback.ts
        ├── raffle-engine.ts
        ├── rewards-engine.ts
        ├── spin-engine.ts
        └── nft-trait-engine.ts

  /var/www/hero-dapp/dist/ (production build)
    └── Served by PM2 (hero-dapp, port 3001) behind Nginx

Development (Manus Sandbox):
  /home/ubuntu/herobase-rng/
    ├── shared/          (rng-engine, vrf-provider, email-notify)
    ├── dao-fallback/    (engine + page)
    ├── nft-traits/      (engine + page + constants)
    ├── giveaways/       (engine + page)
    ├── holder-rewards/  (engine + page)
    ├── spin-wheel/      (engine + page)
    ├── tests/           (21 tests, all passing)
    └── audit/           (Codex reports, Grok eval)
```

---

## Audit History

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2026-04-23 v1 | GPT-4.1-mini | 0C, 3H, 3M, 7L, 5I | All fixed |
| 2026-04-23 v2 | GPT-4.1-mini | 1C, 2H, 3M, 2L | All fixed |

### Critical Fix Applied:
- SpinWheel.tsx: Replaced `Math.random()` with `crypto.getRandomValues()` (CSPRNG)

### High Fixes Applied:
- vrf-provider.ts: Replaced `Date.now()` with `crypto.randomBytes(32)` for commit secret
- nft-trait-engine.ts: Added `userSecret` parameter to prevent front-running

---

## Cost Model

| Tier | Cost | Use Case | Draws/Day |
|------|------|----------|-----------|
| T1 (Off-Chain) | FREE | Daily spins, previews, low-stakes raffles | 250 |
| T2 (Direct VRF) | ~0.25 LINK | NFT mints, DAO fallback, high-value raffles | On-demand |
| T3 (Subscription) | ~0.10 LINK | Batch operations, holder rewards | On-demand |
| Feed Publication | 25 eDAI (one-time) | Required to publish RNG feed on-chain | N/A |

---

## Future Roadmap

1. **VRF Feed Publication** — Publish HERO RNG feed on-chain (25 eDAI)
2. **On-chain Governance Monitor Bot** — Real-time DAO proposal tracking
3. **RNG Integration Bot** — Automated monitoring of all RNG operations
4. **NFT Marketplace Integration** — List HERO NFTs on OpenSea/Blur
5. **Cross-chain RNG** — Unified RNG across PulseChain + BASE via bridge

---

**End of Blueprint**
*This document is the single source of truth for the HERO RNG system architecture.*
*Maintained in GitHub: jratdish1/knowledge-base*
