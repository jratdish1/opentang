# HERO Token & NFT Collection — Whitepaper v2.0

**Version:** 2.0  
**Date:** April 23, 2026  
**Authors:** VetsInCrypto Foundation & Manus AI  
**Chains:** PulseChain (Chain ID 369) & BASE (Coinbase L2)  
**Status:** Live & Actively Developed

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Mission & Vision](#2-mission--vision)
3. [Token Overview](#3-token-overview)
4. [Tokenomics](#4-tokenomics)
5. [Fee System & Dynamics](#5-fee-system--dynamics)
6. [Buy & Burn Engine](#6-buy--burn-engine)
7. [Liquidity Architecture](#7-liquidity-architecture)
8. [NFT Collection — HERO Cards](#8-nft-collection--hero-cards)
9. [NFT Utility System](#9-nft-utility-system)
10. [Rank System](#10-rank-system)
11. [DAO Governance](#11-dao-governance)
12. [RNG FLOW Integration](#12-rng-flow-integration)
13. [Ecosystem Tools & Platform](#13-ecosystem-tools--platform)
14. [Monitoring & Security Infrastructure](#14-monitoring--security-infrastructure)
15. [Cross-Chain Architecture](#15-cross-chain-architecture)
16. [Smart Contract Security](#16-smart-contract-security)
17. [Roadmap](#17-roadmap)
18. [Deployment Addresses](#18-deployment-addresses)
19. [Risk Disclosures](#19-risk-disclosures)
20. [References](#20-references)

---

## 1. Executive Summary

HERO is a community-first, purpose-driven token ecosystem built to reward holders, fuel organic growth, and give back to those who served. Every trade contributes to a self-sustaining flywheel of liquidity deepening, supply reduction, staking rewards, and charitable donations — all verifiable on-chain.

The ecosystem operates on two chains — PulseChain and BASE — with identical token contracts, shared infrastructure, and a unified community. The HERO NFT Collection of 2,000 unique steampunk-military trading cards (1,000 per chain as independent collections) provides real, on-chain utility including a flat 2% fee reduction for all NFT holders, DAO governance voting power, holder rewards, and exclusive community features.

Since the original whitepaper, the ecosystem has grown substantially. This v2.0 document incorporates all live features on herobase.io, the complete NFT utility system, DAO governance with RNG-powered fallback voting, five monitoring bots, and a comprehensive suite of ecosystem tools. The roadmap has been updated to reflect current progress and future milestones.

**Key Metrics:**
- 100,000,000 HERO initial supply (target: 21,000,000 circulating — the "21 Gun Salute")
- 2,000 unique NFT trading cards (1,000 per chain) across 6 trait categories
- 85% of NFT mint revenue directed to charity treasury
- Flat 2% fee reduction for all NFT holders (on-chain enforced, flash-loan protected)
- Independent dual-chain collections — no bridge dependency
- Live on PulseChain and BASE with identical contract addresses

---

## 2. Mission & Vision

The VetsInCrypto Foundation exists at the intersection of military service and decentralized finance. HERO was created to channel the discipline, camaraderie, and purpose of military culture into a token ecosystem that actually does something — it funds veteran-focused charities, rewards loyal holders, and builds tools that the crypto community needs.

The vision is straightforward: build a sustainable token economy where every transaction contributes to a greater mission. Not through promises, but through immutable smart contracts that route fees to liquidity, burns, staking rewards, and charitable donations — all publicly verifiable on-chain.

HERO is not a meme coin with a charity sticker. It is a system. Every transfer routes value into five destinations: burn, auto-liquidity, donations, buy-and-burn, and staking rewards. The math is on-chain. The allocations are transparent. The community governs the treasury through a DAO with provably fair fallback mechanisms.

---

## 3. Token Overview

HERO is an ERC-20 fee-on-transfer token deployed identically on PulseChain and BASE. Each transfer routes a configurable portion of value into key destinations that sustain and grow the ecosystem.

| Parameter | Value |
|-----------|-------|
| **Token Name** | HERO |
| **Ticker** | HERO |
| **Decimals** | 18 |
| **Initial Supply** | 100,000,000 HERO |
| **Treasury Allocation** | 10,000,000 HERO |
| **Liquidity Allocation** | 90,000,000 HERO |
| **Target Circulating Supply** | 21,000,000 HERO ("21 Gun Salute") |
| **Chains** | PulseChain (369) & BASE (8453) |
| **Contract Standard** | ERC-20 with fee-on-transfer |

The system routes transfer fees into five destinations, each serving a distinct purpose in the ecosystem flywheel:

1. **Burn** — Permanently removes HERO from circulation, reducing total supply
2. **Auto-Liquidity** — Deepens liquidity pools on DEXs, strengthening price support
3. **Donations** — Converts native coin to stablecoins (USDC on BASE, DAI on PulseChain) and forwards to verified charities
4. **Buy & Burn** — Accumulates native coin for scheduled buybacks that further reduce supply
5. **Staking Rewards** — Funds reward streams for stakers when enabled

All allocations are defined in basis points (bps) and must sum to 100%. The owner can update the split within that rule, and all changes emit on-chain events for transparency.

---

## 4. Tokenomics

### 4.1 Supply Distribution

| Allocation | Amount | Purpose |
|-----------|--------|---------|
| Liquidity Pairings | 90,000,000 HERO | Initial DEX liquidity on PulseChain and BASE |
| Treasury | 10,000,000 HERO | Operations, development, charity reserves |
| **Total** | **100,000,000 HERO** | |

The Buy & Burn engine will continue operating until circulating supply reaches 21,000,000 HERO — the "21 Gun Salute" target. This represents a 79% supply reduction from initial mint, creating sustained deflationary pressure.

### 4.2 On-Chain Tracking

All ecosystem metrics are tracked on-chain and displayed in real-time on the herobase.io dashboard:

- Total HERO Burned (cumulative)
- Total ETH/PLS Added to Liquidity (native coin + USD equivalent)
- Total ETH/PLS Donated (native coin + USD equivalent)
- Total ETH/PLS in Buy & Burn Queue
- Current Fee Allocation Split (bps)

On PulseChain, "ETH" references are PLS (the native coin). On BASE, they are ETH. The accounting logic is identical on both chains.

---

## 5. Fee System & Dynamics

### 5.1 Base Fee Structure

The default transfer fee is **5%**, split across the five destinations described in Section 3. This fee applies to all non-excluded transfers (buys, sells, and wallet-to-wallet transfers).

### 5.2 NFT Holder Fee Reduction

HERO NFT holders receive a **flat 2% fee reduction** on all $HERO transfers. This is the primary utility of the NFT collection and is enforced entirely on-chain via `balanceOf` checks. If either the sender or receiver holds a HERO NFT, the transfer fee drops from 5% to 3%.

| Scenario | Sender NFT | Receiver NFT | Fee | Savings |
|----------|-----------|-------------|-----|--------|
| Normal transfer | NO | NO | 5.00% | $0 |
| Sender holds NFT | YES | NO | 3.00% | 2.00% |
| Receiver holds NFT | NO | YES | 3.00% | 2.00% |
| Both hold NFTs | YES | YES | 3.00% | 2.00% |
| DEX router (excluded) | N/A | N/A | 0.00% | N/A |

The fee check is calculated in real-time during each transfer. The HERO token contract calls `HeroNFT.balanceOf(wallet)` to verify NFT holdings. If either the sender or receiver holds an NFT, the 2% discount applies automatically.

**Flash Loan Protection:** NFTs must be held for at least 1 block before the fee discount activates. This prevents flash loan attacks where an attacker borrows an NFT, executes a discounted trade, and returns the NFT in the same transaction. The gas cost of the NFT check is approximately 5,200 gas (~$0.001 on BASE, ~$0.0001 on PulseChain) — negligible.

### 5.3 Sell Fee Decay

A time-based system reduces the effective sell fee as a holder ages their wallet position. This mechanism encourages longer-term holding and fosters deep liquidity. The decay rate and parameters are configurable by the contract owner, with all changes emitting on-chain events.

### 5.4 Excluded Addresses

DEX routers, treasury wallets, and operational addresses are excluded from fees to prevent double-taxation on liquidity operations:

| Chain | Excluded Addresses |
|-------|-------------------|
| PulseChain | PulseX Router, 9mm Router, 9inch Router, Treasury |
| BASE | Uniswap Router, Aerodrome Router, Treasury |

---

## 6. Buy & Burn Engine

The Buy & Burn engine is a dedicated smart contract that accumulates native coin (PLS on PulseChain, ETH on BASE) from transfer fees and executes scheduled buybacks that permanently reduce HERO supply.

### 6.1 How It Works

1. **Accumulation** — A portion of each swap's fee is routed to the Buy & Burn contract in native coin
2. **Scheduling** — The engine operates on discrete 30-minute intervals
3. **Daily Allocation** — 1–10% of the contract's native coin balance is allocated per day
4. **Execution** — Anyone can trigger a buyback via the herobase.io dashboard once the interval allowance is available
5. **Incentive** — The caller receives a 1.5% fee in native coin for executing the buyback

### 6.2 Key Readouts (Live on herobase.io/burn)

- Total native coin queued for burning
- Next buy-and-burn amount for current interval
- User incentive in native coin for triggering
- Countdown to next interval
- Last execution timestamp
- Historical burn chart with timeframe filters

The Buy & Burn Tracker on herobase.io provides real-time visualization of burn progress, including total HERO burned, burn rate trends, and progress toward the 21 Gun Salute target.

---

## 7. Liquidity Architecture

### 7.1 Auto-Liquidity Mechanism

The auto-liquidity system splits fee allocations into two halves: one half is paired with native coin, and the other half remains as HERO. These are combined and added as liquidity to the primary DEX pool.

On PulseChain specifically, an additional pairing occurs: half pairs with native coin (PLS) and half pairs with VETS, creating a HERO/VETS liquidity pool that strengthens the connection between the two ecosystem tokens.

All liquidity additions emit `AutoLiquify` events and track cumulative LP value in both native coin and USD equivalents.

### 7.2 DEX Integrations

| Chain | Primary DEX | Secondary DEXs | Liquidity Pairs |
|-------|------------|----------------|-----------------|
| PulseChain | PulseX | 9mm, 9inch | HERO/PLS, HERO/VETS |
| BASE | Uniswap v2 | Aerodrome | HERO/ETH |

---

## 8. NFT Collection — HERO Cards

### 8.1 Collection Overview

The HERO NFT Collection consists of **2,000 unique steampunk-military trading cards** deployed as ERC-721 tokens on both PulseChain and BASE as independent collections (1,000 per chain). Each card is a one-of-a-kind digital collectible created by layering six trait categories through provably fair RNG, rendered in a distinctive steampunk-military art style.

| Parameter | Value |
|-----------|-------|
| **Total Cards** | 2,000 (1,000 per chain) |
| **Standard** | ERC-721 (Immutable, ERC-2981 Royalties) |
| **Theme** | Steampunk-Military Trading Cards |
| **Trait Categories** | 6 (Background, Outfit, Weapon, Rank, Badge, Special) |
| **Options per Category** | 9–10 |
| **Total Possible Combinations** | 810,000+ |
| **Animated NFTs** | 4 (UK, South Korea, US Marine, Mexico) |
| **Chains** | PulseChain (1,000) & BASE (1,000) — Independent |
| **Max Per Wallet** | 5 per chain |
| **Metadata Storage** | IPFS (permanent, decentralized) |
| **Mint Price (BASE)** | 0.005 WETH |
| **Mint Price (PulseChain)** | 3,500,000 PLS |
| **Mint Revenue** | 85% Treasury (Charity), 15% Operations |

### 8.2 Dual-Chain Independent Collections

Each chain has its own independent 1,000-NFT collection. There is no cross-chain bridge dependency. This design eliminates bridge risk, oracle trust assumptions, and additional gas costs.

| Chain | Collection Size | RNG Method | Mint Price | Fee Discount |
|-------|----------------|------------|------------|-------------|
| BASE | 1,000 NFTs | Chainlink VRF v2.5 | 0.005 WETH | 2% on BASE $HERO only |
| PulseChain | 1,000 NFTs | Commit-Reveal (2-tx) | 3,500,000 PLS | 2% on PulseChain $HERO only |

> **Design Decision:** Holding a BASE NFT gives a 2% discount on BASE $HERO transfers ONLY. Holding a PulseChain NFT gives a 2% discount on PulseChain $HERO transfers ONLY. This keeps the system simple, trustless, and free of bridge risk.

### 8.3 Six Trait Categories

Each NFT is composed of six layered traits, stacked bottom-to-top. The RNG engine selects one option from each category to create a unique combination.

| Layer | Category | Options | Description |
|-------|----------|---------|-------------|
| 1 | **Background** | 10 | Base canvas (Desert Storm, Urban Camo, Holographic, etc.) |
| 2 | **Outfit** | 10 | Character clothing/armor (BDU Woodland, Dress Blues, Space Force Suit, etc.) |
| 3 | **Weapon** | 10 | Held item (M16A4, Ka-Bar Knife, Plasma Rifle, Crayon Launcher, etc.) |
| 4 | **Rank** | 10 | Military rank insignia (Private E-1 through General O-10) |
| 5 | **Badge** | 9 | Medal/award overlay (Purple Heart, Medal of Honor, Bronze Star, etc.) |
| 6 | **Special** | 9 | Extra flair (Dog Tags, Aviator Sunglasses, PulseChain Aura, or None) |

With 810,000+ possible combinations, the duplicate probability is less than 0.25% across the full 2,000-piece collection.

### 8.4 Trait Rarity Tiers

Each individual trait has a rarity that determines how often it appears during minting. Rarity is assigned via provably fair RNG and is permanent — it never changes after minting.

| Rarity | Chance | Color Code | Example Traits |
|--------|--------|------------|----------------|
| Common | 50% | Gray | Desert Storm, BDU Woodland, M16A4 |
| Uncommon | 25% | Green | Ocean Blue, Dress Blues, M249 SAW |
| Rare | 15% | Blue | Arctic White, Ghillie Suit, Tomahawk |
| Epic | 7% | Purple | Holographic, Space Force Suit, Plasma Rifle |
| Legendary | 3% | Gold | American Flag Animated, Mjolnir Power Armor, Infinity Gauntlet |

All NFT holders receive the same flat 2% fee discount regardless of trait rarity. Rarity affects the visual appearance and collectibility of the card, not the fee benefit.

### 8.5 Immutable Ownership (v2.0 Contract)

The HeroNFT v2.0 smart contract (Solidity ^0.8.20, OpenZeppelin v5) is fully immutable with zero admin functions:

- **No owner()** — no admin can change anything post-deployment
- **No pause()** — the contract cannot be stopped or frozen
- **No proxy** — no upgrade path, the code is final
- **No setBaseURI()** — metadata URIs are set at mint and cannot be changed
- **No blacklist/whitelist** — anyone can buy, sell, or transfer
- **Immutable MINTER** — minter address is set in constructor and locked forever
- **ERC-2981 Royalties** — optional, set in constructor
- **Burnable** — holders can burn their NFT (gone forever, token ID never reused, removes 2% fee discount if it was the holder's only NFT)
- **True Ownership** — if you lose your keys, the NFT is gone forever. No recovery, no duplication, no backdoors.
- **MAX_SUPPLY = 1,000** per chain — hardcoded constant, cannot be changed

**Post-Deployment:** Nothing to do. No admin keys to secure, no multisig to manage, no proxy to worry about. The contract runs forever.

### 8.6 Animated NFTs

Four special cards in the collection feature animated video content:

1. United Kingdom — Animated steampunk British soldier
2. South Korea — Animated steampunk Korean warrior
3. US Marine — Animated steampunk Marine (Semper Fi)
4. Mexico — Animated steampunk Mexican soldier

These are stored as video files on IPFS alongside the static card artwork.

---

## 9. NFT Utility System

The HERO NFT provides real, on-chain utility — not just a profile picture. Every utility is either enforced by smart contract logic or verifiable through on-chain state.

### Core Utility — Every NFT Holder (On-Chain Enforced)

**1. Flat 2% Fee Discount**
Every HERO NFT holder receives an automatic 2% reduction on all $HERO transfer fees. This is the primary utility of the NFT and is enforced entirely on-chain.

| Scenario | Sender NFT | Receiver NFT | Fee | Savings |
|----------|-----------|-------------|-----|--------|
| Normal transfer | NO | NO | 5.00% | $0 |
| Sender holds NFT | YES | NO | 3.00% | 2.00% |
| Receiver holds NFT | NO | YES | 3.00% | 2.00% |
| Both hold NFTs | YES | YES | 3.00% | 2.00% |
| DEX router (excluded) | N/A | N/A | 0.00% | N/A |

- On-chain enforcement: HERO token contract calls `HeroNFT.balanceOf(wallet)` during every transfer
- Flash loan protection: NFT must be held for at least 1 block before discount activates
- If either sender OR receiver holds an NFT, the discount applies
- Gas cost of NFT check: ~5,200 gas (~$0.001 on BASE, ~$0.0001 on PulseChain) — negligible

**2. DAO Voting Power**
NFT holders receive weighted voting power in HERO DAO governance proposals. Voting power is determined by HERO token balance, with NFT holders eligible to participate in quarterly charity votes and ecosystem decisions.

**3. Holder Rewards**
NFT holders are eligible for quarterly airdrop rewards. Eligibility is verified via on-chain snapshot of NFT holders using `balanceOf` checks.

**4. Spin Wheel Bonus**
NFT holders receive extra daily spins on the herobase.io Spin-the-Wheel engagement feature. Verified via `balanceOf` check in the spin engine.

**5. Giveaway Priority**
NFT holders receive priority entry in all community raffles and giveaways. Verified via `balanceOf` check in the raffle engine.

### Utility Summary

| Utility | Description | Implementation |
|---------|-------------|---------------|
| **2% Fee Discount** | Reduced fee on all $HERO transfers | On-chain `balanceOf` check |
| **DAO Voting** | Weighted voting power in HERO DAO | `balanceOf` check in DAO contract |
| **Holder Rewards** | Eligible for quarterly airdrop rewards | Snapshot of NFT holders |
| **Spin Wheel Bonus** | Extra daily spins for NFT holders | `balanceOf` check in spin engine |
| **Giveaway Priority** | Priority entry in community raffles | `balanceOf` check in raffle engine |

### Future Utility (Planned)

**6. Community Marketplace**
A peer-to-peer trading marketplace on herobase.io for HERO NFT holders to buy, sell, and trade cards directly within the ecosystem.

**7. Custom Animated NFT**
Legendary-trait card holders receive a custom animated NFT featuring their specific military branch or unit — a one-of-a-kind animated collectible created exclusively for them.

---

## 10. Rank System

The Rank System provides a visual and community hierarchy for NFT holders based on their HERO token holdings. Rank is displayed on herobase.io and determines governance weight and future staking boosts.

**Important:** The NFT fee discount is a flat 2% for ALL holders (see Section 9). The Rank System is separate — it governs governance multipliers, community status, and planned staking boosts, not the fee discount.

Rank is **dynamic** — it automatically upgrades or downgrades based on the wallet's current HERO token balance. This is calculated in real-time.

| Rank | Military Grade | HERO Required | Governance Multiplier | Planned Staking Boost |
|------|---------------|--------------|----------------------|----------------------|
| Private | E-1 | 1,000+ | 1x (base) | +5% APY |
| Corporal | E-4 | 10,000+ | 1.5x | +10% APY |
| Sergeant | E-5 | 50,000+ | 2x | +15% APY |
| Lieutenant | O-2 | 250,000+ | 3x | +25% APY |
| Colonel | O-6 | 1,000,000+ | 4x | +40% APY |
| General | O-10 | 5,000,000+ | 5x | +60% APY |

**How it works:** You need BOTH an NFT AND the required HERO balance to achieve a rank. The NFT is the key; the HERO balance determines which door it opens. A General-ranked holder with 5,000,000 HERO has 25,000,000 effective voting power (5x multiplier).

---

## 11. DAO Governance

### 11.1 Overview

The HERO DAO enables community governance of the ecosystem treasury. NFT holders with sufficient HERO balance can create proposals, vote on initiatives, and direct charitable donations.

### 11.2 Quarterly Charity Proposals

Each quarter, the DAO conducts a vote to determine which charity receives treasury funds. Three charities are nominated, and NFT holders vote with their token-weighted governance power.

### 11.3 RNG Fallback Mechanism

If a quarterly proposal fails to reach quorum (10% of total supply voting), the system does not stall. Instead, a provably fair RNG mechanism automatically selects the winning charity from the three nominees.

This ensures the treasury continues to move forward and fulfill its charitable mission regardless of voter participation. The RNG selection uses the same provably fair system described in Section 12.

When a winner is declared (whether by vote or RNG fallback), an automated notification is sent to the foundation team for processing.

### 11.4 Governance Power

Voting power is determined by HERO token balance. NFT holders are eligible to participate in DAO votes. The Rank System (Section 10) provides governance multipliers for holders who meet the HERO balance thresholds, with a General-ranked holder (5,000,000+ HERO) receiving 5x effective voting power.

---

## 12. RNG FLOW Integration

The ecosystem integrates provably fair random number generation for multiple features. The RNG system operates in three tiers:

| Tier | Method | Use Case | Cost |
|------|--------|----------|------|
| T1 (Off-Chain) | Block hash + keccak256 | Daily spins, previews, giveaways | Free (250 draws/day) |
| T2 (Direct) | Chainlink VRF v2.5 (BASE) / Commit-Reveal (PulseChain) | NFT minting, trait assignment | ~0.25 LINK or ~$0.001 PLS |
| T3 (Subscription) | Chainlink VRF batch (BASE) | Large-scale minting events | ~0.10 LINK per request |

### 12.1 RNG-Powered Features

1. **NFT Trait Randomness** — Card rarity and trait categories are assigned at mint using provably fair RNG. On BASE, this uses Chainlink VRF v2.5. On PulseChain, a commit-reveal scheme provides equivalent fairness guarantees.

2. **DAO Fallback Voting** — When quarterly proposals fail to reach quorum, RNG selects the winning charity (see Section 11.3).

3. **Community Giveaways & Raffles** — Provably fair winner selection for community events. No one can cry "rigged" because the randomness is verifiable.

4. **Holder Rewards** — Random selection of NFT holders for bonus airdrops, weighted by holdings and rank.

5. **Daily Spin-the-Wheel** — A gamification feature on herobase.io where NFT holders can spin daily for rewards. Uses cryptographically secure random number generation (not Math.random()).

---

## 13. Ecosystem Tools & Platform

herobase.io serves as the central hub for the HERO ecosystem. The following tools are live and accessible:

### 13.1 Dashboard & Analytics

| Tool | Description | Status |
|------|-------------|--------|
| **Dashboard** | Live prices, market cap, liquidity, TradingView chart | LIVE |
| **Buy & Burn Tracker** | Real-time burn progress, historical charts, trigger interface | LIVE |
| **DEX Analytics** | HERO/VETS pool stats across all DEXs, volume charts | LIVE |
| **Chain Stats Widget** | Live gas prices, block height for PulseChain + BASE | LIVE |
| **Transaction Cost Calculator** | Real-time gas cost estimates for common operations | LIVE |

### 13.2 Security & Management

| Tool | Description | Status |
|------|-------------|--------|
| **Approval Manager** | View and revoke token approvals with risk scoring | LIVE |
| **Ecosystem Directory** | 49+ PulseChain/BASE projects, searchable, categorized | LIVE |

### 13.3 NFT Features

| Tool | Description | Status |
|------|-------------|--------|
| **NFT Gallery** | Browse all 2,000 cards with rarity filters | LIVE |
| **NFT Mint Page** | Mint with live trait preview and reveal animation | LIVE |
| **Rank System** | View your current rank and required HERO for next tier | LIVE |
| **Community Marketplace** | P2P NFT trading (Phase 3) | PLANNED |

### 13.4 Community & Education

| Tool | Description | Status |
|------|-------------|--------|
| **DAO Proposals** | Create, vote, and track governance proposals | LIVE |
| **Community Giveaways** | Provably fair raffles and reward distributions | LIVE |
| **Daily Spin Wheel** | Daily engagement feature for NFT holders | LIVE |
| **Holder Rewards** | Weighted random airdrop selection | LIVE |
| **Boot Camp** | Educational resources for crypto newcomers | LIVE |
| **Community Hub** | Social features and community engagement | LIVE |
| **Liberty Swap** | Token swap interface | LIVE |

---

## 14. Monitoring & Security Infrastructure

The ecosystem is protected by a fleet of automated monitoring bots that run 24/7:

| Bot | Function | Schedule |
|-----|----------|----------|
| **RNG Monitor** | Watches RNG feed health, draw counts, anomaly detection | Every 15 min |
| **Governance Monitor** | Tracks DAO proposals, voting deadlines, quorum status, triggers RNG fallback | Every 6 hours |
| **Security Bot** | Monitors contract events, large transfers, approval exploits, suspicious activity | Every 5 min |
| **Price Oracle** | Aggregates HERO/VETS prices from multiple DEXs, detects price manipulation | Every 5 min |
| **Liquidity Analytics** | Monitors LP positions, TVL trends, impermanent loss, pool health | Every 15 min |

All bots log to structured files and can trigger alerts via email notification.

---

## 15. Cross-Chain Architecture

HERO operates on both PulseChain and BASE with independent contract deployments. The contract addresses are **different on each chain** — each chain has its own token contract and buy-and-burn contract.

| Feature | PulseChain | BASE |
|---------|-----------|------|
| Token Address | `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` | `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` |
| Buy & Burn Address | `0x9016a0DAA30bD29A51a1a2905352877947f904E9` | `0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670` |
| NFT Collection | 1,000 NFTs (independent) | 1,000 NFTs (independent) |
| NFT Mint Price | 3,500,000 PLS | 0.005 WETH |
| NFT Fee Discount | 2% on PulseChain $HERO only | 2% on BASE $HERO only |
| Native Coin | PLS | ETH |
| Primary DEX | PulseX | Uniswap v2 |
| Stablecoin | DAI | USDC |
| NFT RNG | Commit-Reveal (2-tx) | Chainlink VRF v2.5 |
| Block Time | ~10s | ~2s |

### 15.1 Independent NFT Collections

Each chain has its own independent 1,000-NFT collection. There is no cross-chain bridge dependency for NFTs. This design was chosen to eliminate bridge risk, oracle trust assumptions, and additional gas costs.

- BASE NFT holders receive 2% fee discount on BASE $HERO transfers only
- PulseChain NFT holders receive 2% fee discount on PulseChain $HERO transfers only
- No cross-chain discount — each collection is self-contained
- Identical Solidity contract code deployed on both chains
- Independent RNG: Chainlink VRF v2.5 (BASE) / Commit-Reveal (PulseChain)

---

## 16. Smart Contract Security

### 16.1 Design Principles

- **Immutability** — NFT contracts (v2.0) have no admin functions, no pause, no proxy, no upgrade. MAX_SUPPLY = 1,000 per chain is hardcoded.
- **Transparency** — All fee allocations, burns, donations, and NFT transfers are tracked on-chain with events
- **Defensive Patterns** — ReentrancyGuard on all state-changing functions, flash loan protection via 1-block hold minimum
- **Flash Loan Protection** — 1-block hold minimum for NFT fee discount
- **Deterministic Deployment** — Same contract addresses on both chains

### 16.2 Audits & Verification

- Verified by SpyWolf (security audit) [1]
- KYC Verified (team identity confirmed)
- All contracts verified on PulseScan and BaseScan
- Open-source code available for community review

### 16.3 Third-Party Dependencies

The ecosystem relies on external systems including DEX routers, Chainlink oracles, and cross-chain bridges. Issues in these external systems could propagate to HERO contracts. Users should verify contract addresses via official channels and use reputable wallets.

---

## 17. Roadmap

### Phase 1: Foundation (COMPLETED)
- Token launch on PulseChain
- Token launch on BASE (same address)
- Buy & Burn engine deployment
- Auto-liquidity system activation
- Charitable donation routing (stablecoin conversion)
- herobase.io dashboard launch
- SpyWolf audit and KYC verification

### Phase 2: Ecosystem Tools (COMPLETED)
- Swap tool on dashboard (Liberty Swap)
- Farm pools with zapper tool
- Buy & Burn Tracker page
- DEX Analytics page
- Ecosystem Directory (49+ projects)
- Approval Manager with risk scoring
- Chain Stats Widget (PulseChain + BASE)
- Transaction Cost Calculator
- Boot Camp (education)
- Community Hub

### Phase 3: NFT Collection (IN PROGRESS)
- 2,000 unique steampunk-military trading cards (1,000 per chain) — 6 trait categories, 58 layer files
- 4 animated video NFTs complete
- ERC-721 smart contract v2.0 finalized (immutable, ERC-2981 royalties, flash loan protection)
- Independent dual-chain deployment architecture (no bridge dependency)
- Artist integration pipeline built (compositor, metadata, IPFS)
- Immutable Ownership Specification v2.0 locked
- Flat 2% fee discount utility — on-chain enforced via `balanceOf`
- Mint prices: 0.005 WETH (BASE) / 3,500,000 PLS (PulseChain)
- Mint revenue: 85% treasury (charity), 15% operations
- Max 5 NFTs per wallet per chain
- **NEXT:** Artist delivers final layer artwork → Generate 1,000 composites per chain → IPFS upload → Deploy to testnets

### Phase 4: NFT Utility & DAO Activation (PLANNED — Q2-Q3 2026)
- Flat 2% fee discount live on both chains
- DAO governance with quarterly charity proposals
- RNG FLOW integration for provably fair voting fallback
- Community giveaways and raffles (provably fair)
- Holder rewards (weighted random airdrops via snapshot)
- Daily Spin-the-Wheel engagement feature for NFT holders
- Rank System live on herobase.io (governance multipliers)

### Phase 5: Advanced Features (PLANNED — Q3-Q4 2026)
- Rank-based staking APY boost (+5% to +60%)
- Community marketplace for P2P NFT trading
- Custom animated NFT for Legendary-trait holders
- Bug bounty program for responsible disclosure
- Multisig governance with timelock for parameter updates

### Phase 6: Ecosystem Growth (ONGOING)
- 5 monitoring bots (RNG, Governance, Security, Price Oracle, Liquidity)
- AI-powered analytics and insights
- Partner integrations and cross-ecosystem collaborations
- Continuous platform improvements based on community feedback
- GitHub knowledge base and documentation maintenance
- RNG feed publication on-chain

---

## 18. Deployment Addresses

### BASE

| Contract | Address |
|----------|---------|
| HERO Token | `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` |
| HERO Buy & Burn | `0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670` |
| HERO NFT | TBD (pending deployment) |

### PulseChain

| Contract | Address |
|----------|--------|
| HERO Token | `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` |
| HERO Buy & Burn | `0x9016a0DAA30bD29A51a1a2905352877947f904E9` |
| HERO NFT | TBD (pending deployment) |

> **Important:** Contract addresses are **different on each chain**. PulseChain and BASE have independent deployments with separate token and buy-and-burn contracts.

---

## 19. Risk Disclosures

### 19.1 General Risks
- **No guarantees** — Token prices are volatile. Only risk what you can afford to lose.
- **On-chain transparency** — All accounting and events are public. Verify on block explorers.
- **Parameter updates** — Certain fee allocation parameters can be updated by the owner to respond to market conditions. All changes emit on-chain events and are publicly visible.
- **Third-party dependencies** — DEXs and oracles (Chainlink VRF) are external systems. Issues in these systems can propagate to HERO operations.
- **NFT immutability** — Once minted, NFTs cannot be recovered if keys are lost. There is no admin recovery function by design. **Users are solely responsible for securing their private keys.**
- **Smart contract risk** — Despite audits, all smart contracts carry inherent risk. DYOR.

### 19.2 Security Considerations
- **Owner privileges** — The token owner can update fee allocation splits and sell-fee decay parameters. A transition to multisig governance with timelock is planned for Phase 5 of the roadmap.
- **Flash loan protection** — NFTs must be held for a minimum of 1 block before fee discounts activate. This is enforced via on-chain block-number tracking in the NFT contract.
- **Buy & Burn front-running** — The buy-and-burn engine uses slippage protection and minimum output checks to mitigate sandwich attacks.
- **Commit-reveal RNG (PulseChain)** — Reveal transactions must be submitted within a defined window. Expired commits are voided and the user must re-commit. Miner censorship risk is mitigated by the window duration.
- **Independent collections** — Each chain operates its own NFT collection with no cross-chain dependency. A BASE NFT provides utility on BASE only; a PulseChain NFT provides utility on PulseChain only.
- **Bug bounty** — A community bug bounty program will be established in Phase 5 to incentivize responsible disclosure.

### 19.3 Regulatory & Legal Disclaimers
- **Not investment advice** — This whitepaper is for informational purposes only. Nothing herein constitutes financial, legal, or investment advice.
- **No securities offering** — HERO tokens are utility tokens designed for ecosystem participation. They are not securities, shares, or equity instruments.
- **Charity treasury** — NFT mint revenue allocated to charity (85%) is managed by the VetsInCrypto Foundation. Disbursement is governed by DAO vote with quarterly reporting.
- **Jurisdictional variance** — Cryptocurrency regulations vary by jurisdiction. Users are responsible for compliance with their local laws.
- **No KYC requirement** — HERO operates as a permissionless DeFi protocol. No KYC/AML is required for token transactions or NFT minting.
- **Tax obligations** — Users are solely responsible for any tax obligations arising from token transactions, NFT purchases, or staking rewards.

**DYOR (Do Your Own Research):**
- Verify contract addresses via official channels only
- Use reputable wallets and keep keys secure
- Community feedback is welcome through official contacts

---

## 20. References

[1]: SpyWolf Security Audit — https://spywolf.co  
[2]: ERC-721 Standard — https://eips.ethereum.org/EIPS/eip-721  
[3]: Chainlink VRF v2.5 — https://docs.chain.link/vrf  
[4]: PulseChain Documentation — https://pulsechain.com  
[5]: BASE Documentation — https://docs.base.org  
[6]: herobase.io — https://herobase.io  
[7]: VetsInCrypto Foundation — https://vicfoundation.com  
[8]: RNG FLOW Whitepaper — https://squirrels.pro/doc/RNG-FLOW-whitepaper.html  

---

*This whitepaper is a living document and will be updated as the ecosystem evolves. For the latest information, visit [herobase.io](https://herobase.io) and [docs.vicfoundation.com](https://docs.vicfoundation.com).*

*Last updated: April 23, 2026*
