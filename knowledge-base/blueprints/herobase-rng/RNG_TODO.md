# HEROBASE.IO — RNG FLOW Integration Todo

## Master Build Order & Status

### Module 1: NFT Trait Randomness (FIRST — integrates into herobase.io)
- [ ] Build NFT trait generation engine using RNG FLOW T1 (free tier)
- [ ] Define trait categories: Background, Outfit, Weapon, Rank, Badge, Special
- [ ] Implement rarity tiers: Common (50%), Uncommon (25%), Rare (15%), Epic (7%), Legendary (3%)
- [ ] Build React page for herobase.io with live mint preview
- [ ] Connect to PulseChain RPC for on-chain trait verification
- [ ] Add trait reveal animation (card flip / holographic effect)
- [ ] Test with 100 sample mints for distribution accuracy
- [ ] Deploy to herobase.io /nft-mint route
- [ ] Codex audit

### Module 2: DAO RNG Fallback (Treasury Charity Selection)
- [ ] Build quarterly proposal system with 3 charity nominees
- [ ] Implement voting mechanism (HERO token-weighted)
- [ ] Set quorum threshold (e.g., 10% of circulating supply must vote)
- [ ] Build deadline timer (quarterly: Jan 1, Apr 1, Jul 1, Oct 1)
- [ ] Implement RNG fallback: if quorum not met by deadline, RNG picks winner from 3 nominees
- [ ] RNG uses on-chain seed (block hash + timestamp) for provable fairness
- [ ] Build email notification system: sends to VETSCrypto@pm.me
  - Subject: "HERO DAO quarterly winner of the treasury"
  - Body: Winner name, selection method (vote vs RNG), vote counts, timestamp, tx hash
- [ ] Build admin dashboard for proposal management
- [ ] Add Telegram notification for DAO results
- [ ] Test full cycle: create proposal → voting period → deadline → RNG fallback → email
- [ ] Codex audit

### Module 3: Community Giveaways/Raffles
- [ ] Build raffle creation UI (admin sets prize, duration, entry rules)
- [ ] Implement entry system (wallet connect → hold HERO to enter)
- [ ] Minimum HERO holding threshold for entry (configurable)
- [ ] RNG winner selection using on-chain randomness
- [ ] Build winner announcement page with confetti animation
- [ ] Provably fair verification link (tx hash on PulseChain)
- [ ] Historical raffle results archive
- [ ] Test with mock raffle (10 entries, 1 winner)
- [ ] Codex audit

### Module 4: HERO Holder Rewards (Weighted Random Airdrops)
- [ ] Build holder snapshot system (reads all HERO balances from chain)
- [ ] Implement weighted random selection (more HERO = higher chance)
- [ ] Configurable reward tiers (top 10 winners, top 50, etc.)
- [ ] Build reward distribution UI showing selected winners
- [ ] Add exclusion list (team wallets, dead address, LP contracts)
- [ ] Historical rewards archive with proof of selection
- [ ] Test with mock snapshot (100 holders, 5 winners)
- [ ] Codex audit

### Module 5: Daily Spin-the-Wheel (Gamification)
- [ ] Build spin wheel UI component (animated wheel with segments)
- [ ] Define reward segments: HERO tokens, NFT whitelist, merch discount, badge, nothing
- [ ] One spin per wallet per day (cookie + on-chain check)
- [ ] RNG determines landing segment
- [ ] Build reward claim flow
- [ ] Streak bonus system (7-day streak = guaranteed rare reward)
- [ ] Leaderboard for most spins / best rewards
- [ ] Test 1000 spins for distribution fairness
- [ ] Codex audit

---

## DAO RNG Fallback — Design Specification

### Flow Diagram
```
Quarterly Proposal Created (3 charity nominees)
        │
        ▼
   Voting Period Opens (30 days)
        │
        ▼
   HERO holders vote (token-weighted)
        │
        ▼
   Deadline Reached?
        │
   ┌────┴────┐
   │         │
Quorum Met  Quorum NOT Met
   │         │
   ▼         ▼
Winner =    RNG FLOW picks
Top Vote    from 3 nominees
   │         │
   └────┬────┘
        │
        ▼
   Winner Declared
        │
        ├──► Email to VETSCrypto@pm.me
        │    Subject: "HERO DAO quarterly winner of the treasury"
        │
        ├──► Telegram notification to HERO community
        │
        ├──► On-chain record (tx hash for proof)
        │
        └──► Treasury disbursement initiated
```

### RNG Fallback Logic
- Seed = keccak256(blockHash + proposalId + timestamp)
- Winner index = seed % 3 (picks nominee 0, 1, or 2)
- All inputs are on-chain verifiable
- Uses RNG FLOW T1 tier (250 draws/day, FREE after 25 eDAI setup)

### Email Template
```
To: VETSCrypto@pm.me
Subject: HERO DAO quarterly winner of the treasury

HERO DAO — Quarterly Treasury Allocation Result
================================================

Quarter: Q2 2026
Selection Method: [RNG Fallback / Community Vote]
Winner: [Charity Name]

Nominees:
1. [Charity A] — [X votes / X% of total]
2. [Charity B] — [Y votes / Y% of total]
3. [Charity C] — [Z votes / Z% of total]

Quorum Status: [Met / Not Met (X% of Y% required)]
Total Votes Cast: [N]
Treasury Amount: [X HERO / $Y USD value]

Verification:
- Transaction Hash: [0x...]
- Block Number: [N]
- RNG Seed: [if applicable]

This is an automated notification from the HERO DAO system.
Semper Fi.
================================================
```

### Quarterly Schedule
| Quarter | Proposal Opens | Voting Deadline | Disbursement |
|---------|---------------|-----------------|--------------|
| Q1      | Jan 1         | Jan 31          | Feb 1        |
| Q2      | Apr 1         | Apr 30          | May 1        |
| Q3      | Jul 1         | Jul 31          | Aug 1        |
| Q4      | Oct 1         | Oct 31          | Nov 1        |

---

## Technical Stack
- **Frontend**: React + TypeScript (herobase.io existing stack)
- **RNG**: On-chain seed from PulseChain block hash + keccak256
- **Email**: Nodemailer via SMTP (ProtonMail bridge or external SMTP)
- **Notifications**: Telegram Bot API (existing bot token in env_architecture)
- **Data**: tRPC endpoints on existing hero-dapp server
- **Verification**: All RNG results stored on-chain with tx hash proof
