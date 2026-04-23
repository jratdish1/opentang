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

The ecosystem operates on two chains — PulseChain and BASE — with identical token contracts, shared infrastructure, and a unified community. The HERO NFT Collection of 555 unique steampunk-military trading cards provides real, on-chain utility including tiered fee reductions, governance power, staking boosts, and exclusive rewards.

Since the original whitepaper, the ecosystem has grown substantially. This v2.0 document incorporates all live features on herobase.io, the complete NFT utility system, DAO governance with RNG-powered fallback voting, five monitoring bots, and a comprehensive suite of ecosystem tools. The roadmap has been updated to reflect current progress and future milestones.

**Key Metrics:**
- 100,000,000 HERO initial supply (target: 21,000,000 circulating — the "21 Gun Salute")
- 555 unique NFT trading cards across 10 military/first-responder categories
- 85% of NFT mint revenue directed to charity treasury
- 6-tier rank system with 1–7% fee reductions for NFT holders
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

HERO NFT holders receive a tiered fee reduction based on their **Rank** (determined by HERO token holdings). This is the primary utility of the NFT collection and is enforced on-chain.

| Rank | HERO Required | Fee Reduction | Effective Fee |
|------|--------------|---------------|---------------|
| No NFT | — | 0% | 5.00% |
| Private (E-1) | 1,000+ | 1% | 4.00% |
| Corporal (E-4) | 10,000+ | 2% | 3.00% |
| Sergeant (E-5) | 50,000+ | 3% | 2.00% |
| Lieutenant (O-2) | 250,000+ | 4% | 1.00% |
| Colonel (O-6) | 1,000,000+ | 5% | 0.00% (zero-fee) |
| General (O-10) | 5,000,000+ | 7% (exceeds 5% base) | 0.00% (zero-fee, plus 2% rebate credit on buys) |

The fee reduction is calculated in real-time during each transfer. The HERO token contract calls `HeroNFT.getFeeReduction(wallet)` to determine the applicable discount. If either the sender or receiver holds an NFT, the best available reduction applies.

> **Clarification on General Rank:** The base transaction fee is 5%. A 7% reduction exceeds the base fee, resulting in a 0% effective fee. The surplus 2% is applied as a rebate credit on buy transactions, effectively rewarding the highest-tier holders. Flash loan protection (1-block minimum hold) prevents abuse of this mechanism.

**Flash Loan Protection:** NFTs must be held for at least 1 block before the fee discount activates. This prevents flash loan attacks where an attacker borrows an NFT, executes a discounted trade, and returns the NFT in the same transaction.

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

The HERO NFT Collection consists of **555 unique steampunk-military trading cards** deployed as ERC-721 tokens on both PulseChain and BASE. Each card is a one-of-a-kind digital collectible featuring military personnel, first responders, and historical warriors rendered in a distinctive steampunk-military art style.

| Parameter | Value |
|-----------|-------|
| **Total Cards** | 555 |
| **Standard** | ERC-721 (Immutable) |
| **Theme** | Steampunk-Military Trading Cards |
| **Categories** | 10 |
| **Nations Represented** | 50+ |
| **Animated NFTs** | 4 (UK, South Korea, US Marine, Mexico) |
| **Chains** | PulseChain & BASE |
| **Metadata Storage** | IPFS (permanent, decentralized) |
| **Mint Revenue** | 85% Treasury (Charity), 15% Operations |

### 8.2 Collection Split

The 555 cards are distributed across both chains:

| Allocation | Count | Description |
|-----------|-------|-------------|
| PulseChain Primary | ~185 | Cards minted exclusively on PulseChain |
| BASE Primary | ~185 | Cards minted exclusively on BASE |
| Shared | ~185 | Cards available on both chains via bridging |

### 8.3 Ten Categories

| Category | Count | Description |
|----------|-------|-------------|
| International Forces | 131 | Military from 50+ nations worldwide |
| First Responders | 105 | Fire, police, EMS, rescue, medical |
| Historical Warriors | 88 | Warriors spanning 3,000+ years of history |
| Special / Community | 66 | Veteran transition stories, crypto pioneers |
| US Army | 54 | All ranks, specialties, and diversity |
| US Marines | 44 | Semper Fi — all ranks and roles |
| US Navy | 31 | SEALs, pilots, corpsmen, officers |
| US Air Force | 23 | Pilots, PJs, Thunderbirds, cyber warriors |
| US Coast Guard | 10 | Rescue swimmers, cutter crews |
| US Space Force | 8 | Guardians, cyber warriors, orbital ops |

### 8.4 Card Rarity Tiers

Card rarity is a **visual attribute** determined at mint via provably fair RNG. It affects the card's appearance (border style, effects) and is permanent — it never changes after minting.

| Rarity | Style | Distribution | Count (~) |
|--------|-------|-------------|-----------|
| Common | Bronze Metallic | 20% | ~112 |
| Uncommon | Silver Metallic | 20% | ~111 |
| Rare | Gold Metallic | 30% | ~166 |
| Ultra Rare | Purple Diamond | 20% | ~111 |
| Legendary | Holographic Rainbow | 10% | ~55 |

Card rarity is independent of the Rank System (Section 10). A Common rarity card held by a wallet with 5,000,000+ HERO tokens would have General rank and receive the maximum 7% fee reduction.

### 8.5 Immutable Ownership

The NFT contract is fully immutable with no administrative functions:

- **No owner()** — no admin can change anything post-deployment
- **No pause()** — the contract cannot be stopped or frozen
- **No proxy** — no upgrade path, the code is final
- **No setBaseURI()** — metadata URIs are set at mint and cannot be changed
- **No withdraw()** — mint funds go directly to treasury (85%) and operations (15%) at mint time
- **Burnable** — holders can burn their NFT (gone forever, token ID never reused)
- **True Ownership** — if you lose your keys, the NFT is gone forever. No recovery, no duplication, no backdoors.

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

### Phase 1 — Core Utility (Every NFT Holder)

**1. Fee Reduction**
Hold an NFT to automatically reduce buy/sell/transfer fees on HERO tokens. The reduction is tiered based on your Rank (determined by HERO token holdings). See Section 10 for the full rank table.

- On-chain enforcement: HERO token contract calls `HeroNFT.getFeeReduction(wallet)` during every transfer
- Flash loan protection: 1-block hold minimum
- Best reduction between sender and receiver applies

**2. Diamond Hands Rewards**
The longer you hold your NFT and tokens, the more you earn. A time-weighted staking multiplier rewards loyalty:

| Hold Duration | Multiplier | Bonus |
|--------------|------------|-------|
| 0–30 days | 1.0x | Base rate |
| 30–60 days | 1.1x | +10% |
| 60–90 days | 1.2x | +20% |
| 90–180 days | 1.5x | +50% |
| 180–365 days | 2.0x | +100% |
| 365+ days | 3.0x (cap) | +200% |

The multiplier is calculated on-chain using block timestamps. Transferring the NFT resets the timer.

### Phase 2 — Enhanced Utility (All Holders)

**3. Governance Power**
NFT holders receive boosted voting power in DAO proposals. The boost scales with rank:

| Rank | Governance Multiplier |
|------|----------------------|
| Private (E-1) | 1x (base) |
| Corporal (E-4) | 1.5x |
| Sergeant (E-5) | 2x |
| Lieutenant (O-2) | 3x |
| Colonel (O-6) | 4x |
| General (O-10) | 5x |

**4. Exclusive Airdrops**
Periodic airdrops of HERO, VETS, and partner tokens are distributed exclusively to NFT holders. Eligibility is verified on-chain via `isAirdropEligible(wallet)` which checks both NFT ownership and valid holding duration.

### Phase 3 — Premium Utility (Rank-Dependent)

**5. Staking APY Boost**
NFT holders receive boosted APY on all staking pools. The boost percentage is determined by rank:

| Rank | APY Boost |
|------|-----------|
| Private (E-1) | +5% |
| Corporal (E-4) | +10% |
| Sergeant (E-5) | +15% |
| Lieutenant (O-2) | +25% |
| Colonel (O-6) | +40% |
| General (O-10) | +60% |

**6. Rank Promotion**
As your wallet accumulates more HERO tokens, your NFT rank automatically upgrades — reflecting your true commitment to the ecosystem. Rank is dynamic and recalculated in real-time. If your HERO balance drops below a threshold, your rank adjusts accordingly.

### Phase 3+ — Advanced Features

**7. Cross-Chain NFT Bridging**
NFTs can be bridged between PulseChain and BASE using a lock-and-mint mechanism:
- Lock NFT on source chain → Mint mirror on destination chain
- Bridge back → Burn mirror → Unlock original
- Only one instance exists at any time (no duplication)
- Metadata and rank travel with the NFT
- Fee discount applies on whichever chain the NFT currently resides

**8. Community Marketplace**
A peer-to-peer trading marketplace on herobase.io for HERO NFT holders to buy, sell, and trade cards directly within the ecosystem.

**9. Custom Animated NFT**
Legendary card holders receive a custom animated NFT featuring their specific military branch or unit — a one-of-a-kind animated collectible created exclusively for them.

### Utility Tiers Summary

| Tier | Requirement | Unlocks |
|------|------------|---------|
| **Core** | Any NFT | Fee reduction, Diamond Hands rewards |
| **Enhanced** | Rare+ card rarity | Enhanced features, priority access |
| **Premium** | Legendary card rarity | Custom animated NFT, all utilities |

---

## 10. Rank System

The Rank System is the backbone of NFT utility. It is entirely separate from Card Rarity (Section 8.4). Card rarity determines how the card looks. Rank determines what the card does.

Rank is **dynamic** — it automatically upgrades or downgrades based on the wallet's current HERO token balance. This is calculated in real-time by the smart contract.

| Rank | Military Grade | HERO Required | Fee Reduction | Governance | Staking Boost | Rarity Tier % |
|------|---------------|--------------|---------------|------------|---------------|---------------|
| Private | E-1 | 1,000+ | 1% | 1x | +5% APY | 40% |
| Corporal | E-4 | 10,000+ | 2% | 1.5x | +10% APY | 25% |
| Sergeant | E-5 | 50,000+ | 3% | 2x | +15% APY | 18% |
| Lieutenant | O-2 | 250,000+ | 4% | 3x | +25% APY | 10% |
| Colonel | O-6 | 1,000,000+ | 5% | 4x | +40% APY | 5% |
| General | O-10 | 5,000,000+ | 7% (zero-fee) | 5x | +60% APY | 2% |

**Important:** You need BOTH an NFT AND the required HERO balance to achieve a rank. The NFT is the key; the HERO balance determines which door it opens.

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

Voting power is determined by HERO token balance multiplied by the NFT governance multiplier (see Section 10). A General-ranked holder with 5,000,000 HERO has 25,000,000 effective voting power (5x multiplier).

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
| **NFT Gallery** | Browse all 555 cards with rarity filters | LIVE |
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

HERO operates identically on PulseChain and BASE with deterministic contract deployment (same addresses on both chains).

| Feature | PulseChain | BASE |
|---------|-----------|------|
| Token Address | 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8 | 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8 |
| Buy & Burn Address | 0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670 | 0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670 |
| Native Coin | PLS | ETH |
| Primary DEX | PulseX | Uniswap v2 |
| Stablecoin | DAI | USDC |
| NFT RNG | Commit-Reveal (2-tx) | Chainlink VRF v2.5 |
| Block Time | ~10s | ~2s |

### 15.1 NFT Cross-Chain Bridging (Phase 3)

A lock-and-mint bridge will enable NFTs to move between PulseChain and BASE:

1. Lock NFT on source chain
2. Mint mirror NFT on destination chain
3. Bridge back: burn mirror, unlock original
4. Only one instance exists at any time
5. Metadata, rank, and utility travel with the NFT

---

## 16. Smart Contract Security

### 16.1 Design Principles

- **Immutability** — NFT contracts have no admin functions, no pause, no proxy, no upgrade
- **Transparency** — All fee allocations, burns, and donations are tracked on-chain with events
- **Defensive Patterns** — ReentrancyGuard on all state-changing functions
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
- 555 unique steampunk-military trading cards — artwork complete
- 4 animated video NFTs complete
- ERC-721 smart contract blueprint finalized
- Dual-chain deployment architecture (PulseChain + BASE)
- Artist integration pipeline built (compositor, metadata, IPFS)
- Immutable ownership specification locked
- Mint event: 85% treasury (charity), 15% operations
- **NEXT:** Artist delivers final layer artwork → Generate collection → Deploy to testnets

### Phase 4: NFT Utility Activation (PLANNED — Q2-Q3 2026)
- Tiered fee reduction (1–7% based on rank) — smart contract integration
- Diamond Hands time-weighted staking multiplier
- Governance voting power boost (1x–5x)
- Exclusive airdrop eligibility for holders
- Rank System live on herobase.io

### Phase 5: Advanced NFT Features (PLANNED — Q3-Q4 2026)
- Rank promotion system (dynamic rank based on HERO holdings)
- Staking APY boost by rank (+5% to +60%)
- Cross-chain NFT bridging (PulseChain ↔ BASE)
- Community marketplace for P2P trading
- Custom animated NFT for Legendary holders

### Phase 6: DAO & RNG Integration (PLANNED — Q4 2026)
- DAO governance with quarterly charity proposals
- RNG FLOW integration for provably fair voting fallback
- Community giveaways and raffles
- Holder rewards (weighted random airdrops)
- Daily Spin-the-Wheel engagement feature
- RNG feed publication on-chain

### Phase 7: Ecosystem Growth (ONGOING)
- 5 monitoring bots (RNG, Governance, Security, Price Oracle, Liquidity)
- AI-powered analytics and insights
- Partner integrations and cross-ecosystem collaborations
- Continuous platform improvements based on community feedback
- GitHub knowledge base and documentation maintenance

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
|----------|---------|
| HERO Token | `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` |
| HERO Buy & Burn | `0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670` |
| HERO NFT | TBD (pending deployment) |

Note: Token and Buy & Burn contracts share the same addresses on both chains via deterministic deployment.

---

## 19. Risk Disclosures

### 19.1 General Risks
- **No guarantees** — Token prices are volatile. Only risk what you can afford to lose.
- **On-chain transparency** — All accounting and events are public. Verify on block explorers.
- **Parameter updates** — Certain fee allocation parameters can be updated by the owner to respond to market conditions. All changes emit on-chain events and are publicly visible.
- **Third-party dependencies** — DEXs, oracles (Chainlink VRF), and bridges are external systems. Issues in these systems can propagate to HERO operations.
- **NFT immutability** — Once minted, NFTs cannot be recovered if keys are lost. There is no admin recovery function by design. **Users are solely responsible for securing their private keys.**
- **Smart contract risk** — Despite audits, all smart contracts carry inherent risk. DYOR.

### 19.2 Security Considerations
- **Owner privileges** — The token owner can update fee allocation splits and sell-fee decay parameters. A transition to multisig governance with timelock is planned for Phase 5 of the roadmap.
- **Flash loan protection** — NFTs must be held for a minimum of 1 block before fee discounts activate. This is enforced via on-chain block-number tracking in the NFT contract.
- **Buy & Burn front-running** — The buy-and-burn engine uses slippage protection and minimum output checks to mitigate sandwich attacks.
- **Commit-reveal RNG (PulseChain)** — Reveal transactions must be submitted within a defined window. Expired commits are voided and the user must re-commit. Miner censorship risk is mitigated by the window duration.
- **Bridge security** — Cross-chain NFT bridging uses a lock-and-mint mechanism. Bridge contracts will undergo independent security audits before mainnet activation (Phase 5).
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
