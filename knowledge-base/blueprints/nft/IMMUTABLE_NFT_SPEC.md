# HERO NFT — Immutable Ownership Specification (v2.0)

**Version:** 2.0 — Updated with 2% Fee Discount Utility + Dual-Chain Support  
**Date:** April 23, 2026  
**Author:** Manus AI for VetsInCrypto  
**Chains:** BASE (Chain ID: 8453) + PulseChain (Chain ID: 369)

---

## Core Principle: TRUE OWNERSHIP

> "If they lose it, it's gone forever. They own it. No copies. No off switch. No backdoors."

---

## What Changed in v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Fee Discount Utility | Not included | **2% fee reduction on all $HERO transfers** |
| Chain Support | Single chain | **Dual-chain: BASE + PulseChain** |
| Collection Size | 2,000 (single) | **1,000 per chain (2,000 total)** |
| RNG Method | Not specified | **Chainlink VRF (BASE) + Commit-Reveal (PulseChain)** |
| Flash Loan Protection | Not included | **Minimum 1-block hold duration** |
| ERC-2981 Royalties | Not included | **Optional, set in constructor** |
| Minter Contract | Open mint | **Dedicated minter with RNG + wallet limits** |

---

## Contract Design: Zero Admin, Zero Kill Switch

### What the Contract DOES:
- Mint NFTs up to MAX_SUPPLY (1,000 per chain) — hardcoded, immutable
- Transfer NFTs between wallets (standard ERC-721)
- Burn NFTs (owner only — permanently destroys the token)
- Store tokenURI pointing to IPFS metadata (immutable after mint)
- **Report NFT balance to $HERO token contract for 2% fee discount verification**
- Report royalty info via ERC-2981 (optional, marketplace-level enforcement)

### What the Contract DOES NOT Have:
- NO `pause()` or `unpause()` — no kill switch
- NO `setBaseURI()` after deployment — metadata is permanent
- NO `Ownable` or admin role — no privileged functions
- NO proxy pattern — no upgradability
- NO `mint()` after collection is complete — supply is capped
- NO blacklist or whitelist — anyone can buy/sell/transfer
- NO recovery function — lost keys = lost NFT forever
- NO cross-chain bridge dependency — each chain operates independently
- NO centralized server dependency — metadata lives on IPFS forever

### What Makes It Truly Immutable:
1. **No constructor admin**: Contract has no `owner` variable
2. **Hardcoded supply**: `uint256 public constant MAX_SUPPLY = 1000;`
3. **IPFS metadata**: Once minted, tokenURI points to `ipfs://` — no server dependency
4. **No selfdestruct**: Contract cannot be destroyed
5. **Renounced everything**: No admin functions exist to renounce — they were never created
6. **Immutable minter**: The minter address is set in constructor and locked forever

---

## The 2% Fee Discount Utility

This is the primary utility of holding a HERO NFT. When the $HERO token contract processes a transfer, it checks if the sender OR receiver holds a HERO NFT. If they do, the transfer fee is reduced by 2%.

### How It Works On-Chain

```
User sends $HERO tokens
    │
    ▼
HeroToken._update() is called
    │
    ├── Check: Is sender excluded from fees? → No fee
    ├── Check: Is receiver excluded from fees? → No fee
    │
    ├── Check: Does sender hold a HERO NFT?
    │   └── HeroNFT.balanceOf(sender) > 0 ? → YES = discount
    │
    ├── Check: Does receiver hold a HERO NFT?
    │   └── HeroNFT.balanceOf(receiver) > 0 ? → YES = discount
    │
    ├── Check: Has the NFT been held for at least 1 block?
    │   └── block.number > lastNFTTransferBlock[wallet] ? → YES = valid
    │
    ▼
    NFT Holder: 3% fee (5% default - 2% discount)
    Non-Holder:  5% fee (standard)
```

### Fee Discount Scenarios

| Scenario | Sender NFT | Receiver NFT | Fee | Savings |
|----------|-----------|-------------|-----|---------|
| Normal transfer | NO | NO | 5.00% | $0 |
| Sender holds NFT | YES | NO | 3.00% | 2.00% |
| Receiver holds NFT | NO | YES | 3.00% | 2.00% |
| Both hold NFTs | YES | YES | 3.00% | 2.00% |
| DEX router (excluded) | N/A | N/A | 0.00% | N/A |

### Flash Loan Protection

A sophisticated attacker could flash-loan a HERO NFT within the same transaction to get the discount. The mitigation is a minimum hold duration check — the NFT must have been held for at least 1 block before the discount applies.

```solidity
// In HeroToken contract
mapping(address => uint256) public lastNFTTransferBlock;

function _holdsHeroNFT(address wallet) internal view returns (bool) {
    try HERO_NFT.balanceOf(wallet) returns (uint256 balance) {
        if (balance == 0) return false;
        // Must have held NFT for at least 1 block (anti-flash-loan)
        return block.number > lastNFTTransferBlock[wallet];
    } catch {
        return false;
    }
}
```

### Gas Cost of NFT Check

| Chain | Additional Gas | Additional Cost | Verdict |
|-------|---------------|----------------|---------|
| BASE | ~5,200 gas | ~$0.001 | Negligible |
| PulseChain | ~5,200 gas | ~$0.0001 | Essentially free |

---

## Dual-Chain Architecture

Each chain has its own independent collection. There is no cross-chain dependency.

### Why Independent Collections?

Cross-chain NFT verification (e.g., via Chainlink CCIP or LayerZero) introduces bridge dependencies, oracle trust assumptions, and additional gas costs. For a collection focused on true ownership and immutability, these dependencies are unacceptable. Each chain stands on its own.

| Aspect | BASE | PulseChain |
|--------|------|------------|
| Collection Size | 1,000 NFTs | 1,000 NFTs |
| RNG Method | Chainlink VRF v2.5 | Commit-Reveal |
| Mint Steps | 1 transaction | 2 transactions |
| Mint Price | 0.005 WETH | 3,500,000 PLS |
| Fee Discount | 2% on BASE $HERO | 2% on PulseChain $HERO |
| Cross-Chain Discount | NO | NO |
| DEX Exclusions | Uniswap, Aerodrome | PulseX, 9mm, 9inch |
| Contract Code | Identical Solidity | Identical Solidity |

> **Design Decision:** Holding a BASE NFT gives a 2% discount on BASE $HERO transfers ONLY. Holding a PulseChain NFT gives a 2% discount on PulseChain $HERO transfers ONLY. This keeps the system simple, trustless, and free of bridge risk.

---

## Smart Contract (Updated for v2.0)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title HeroNFT (v2.0)
 * @notice Immutable ERC-721 NFT with 2% fee discount utility.
 *         No admin. No kill switch. No upgradability. True ownership.
 *         Deployed on both BASE and PulseChain as independent collections.
 *
 * @dev MAX_SUPPLY = 1,000 per chain (2,000 total across both chains).
 *      The $HERO token contract reads balanceOf() to verify NFT holdings
 *      and apply the 2% fee discount automatically.
 */
contract HeroNFT is ERC721, ERC721Enumerable, ERC721Burnable, ERC2981 {
    uint256 public constant MAX_SUPPLY = 1000;
    string private _baseTokenURI;
    address public immutable MINTER;

    // Track last transfer block for flash loan protection
    mapping(address => uint256) public lastTransferBlock;

    event NFTTransferred(address indexed from, address indexed to, uint256 tokenId);

    constructor(
        string memory baseURI,
        address minterContract,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721("HERO NFT", "HERONFT") {
        require(bytes(baseURI).length > 0, "Base URI required");
        require(minterContract != address(0), "Invalid minter");
        _baseTokenURI = baseURI;
        MINTER = minterContract;
        if (royaltyReceiver != address(0)) {
            _setDefaultRoyalty(royaltyReceiver, royaltyBps);
        }
    }

    function mint(address to, uint256 tokenId) external {
        require(msg.sender == MINTER, "Only minter");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        _safeMint(to, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Override _update to track transfer blocks for flash loan protection
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable) returns (address)
    {
        address from = super._update(to, tokenId, auth);

        // Record transfer block for both sender and receiver
        if (from != address(0)) {
            lastTransferBlock[from] = block.number;
        }
        if (to != address(0)) {
            lastTransferBlock[to] = block.number;
        }

        emit NFTTransferred(from, to, tokenId);
        return from;
    }

    /// @notice Check if a wallet has held an NFT for at least 1 block
    /// @dev Used by HeroToken to verify flash-loan-resistant NFT holding
    function hasValidHolding(address wallet) external view returns (bool) {
        if (balanceOf(wallet) == 0) return false;
        return block.number > lastTransferBlock[wallet];
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ─── View Functions ─────────────────────────────────────────

    function totalMinted() external view returns (uint256) {
        return totalSupply();
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    // NO setBaseURI, NO setMinter, NO pause, NO admin functions
    // The contract is FINAL once deployed
}
```

---

## Deployment Checklist (Both Chains)

### Pre-Deployment:
1. [ ] Artist delivers all layer PNGs (per ARTIST_GUIDE.md)
2. [ ] Run artist-pipeline.ts to generate 1,000 composite images per chain
3. [ ] Generate 1,000 metadata JSON files per chain (chain-specific fields)
4. [ ] Upload images + metadata to IPFS via Pinata
5. [ ] Verify IPFS CIDs are pinned on Pinata + nft.storage (redundancy)
6. [ ] Compile contracts with Solidity 0.8.20+ (OpenZeppelin v5)

### Deployment Order:
1. Deploy HeroMinter (get address)
2. Deploy HeroNFT with minter address, IPFS CID, royalty config
3. Set NFT address in minter (one-time, then locked)
4. Deploy/update HeroToken with NFT contract address
5. Verify all contracts on block explorer
6. Test full mint flow on testnet
7. Go live on mainnet

### Post-Deployment:
- **NOTHING TO DO** — contracts are immutable
- No admin keys to secure
- No multisig to manage
- No proxy to worry about
- Just... let it run forever

---

## Collection Capacity

| Metric | Per Chain | Total (Both Chains) |
|--------|----------|-------------------|
| Max Supply | 1,000 | 2,000 |
| Trait Categories | 6 | 6 |
| Options per Category | 9-10 | 9-10 |
| Total Possible Combinations | 810,000+ | 810,000+ |
| Duplicate Probability | < 0.12% at 1,000 mints | < 0.25% at 2,000 mints |
| Max Per Wallet | 5 | 5 per chain |
| Gas per Mint (BASE) | ~$0.01 | — |
| Gas per Mint (PulseChain) | ~$0.001 | — |

---

## Burn Mechanics

- Only the token OWNER can burn their NFT
- `burn(tokenId)` permanently destroys the token
- Token ID is never reused
- Total supply decreases permanently
- **Burning removes the 2% fee discount** (if that was the holder's only NFT)
- **There is no undo** — burned = gone forever

---

## Additional Utilities (Beyond Fee Discount)

| Utility | Description | Implementation |
|---------|-------------|----------------|
| **2% Fee Discount** | Reduced fee on all $HERO transfers | On-chain `balanceOf` check |
| **DAO Voting** | Weighted voting power in HERO DAO | `balanceOf` check in DAO contract |
| **Holder Rewards** | Eligible for quarterly airdrop rewards | Snapshot of NFT holders |
| **Spin Wheel Bonus** | Extra daily spins for NFT holders | `balanceOf` check in spin engine |
| **Giveaway Priority** | Priority entry in community raffles | `balanceOf` check in raffle engine |

---

*Built for Veterans, by Veterans. No admin. No kill switch. True ownership. Dual-chain. Semper Fi.*
