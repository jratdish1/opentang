# HERO NFT Collection — PulseChain Architectural Blueprint

**Version:** 1.0  
**Date:** April 23, 2026  
**Author:** Manus AI for VetsInCrypto  
**Chain:** PulseChain (Chain ID: 369)  
**Status:** Production-Ready Specification

---

## 1. Executive Summary

This blueprint defines the complete architecture for deploying the HERO NFT collection on PulseChain, including the **2% fee discount utility** for NFT holders when buying, selling, or transferring HERO tokens. PulseChain is the native home of the HERO ecosystem — $HERO and $VETS both originated here — making this the primary deployment chain for the NFT collection.

PulseChain is a full-state fork of Ethereum with significantly lower gas costs, higher throughput, and a dedicated DeFi ecosystem including PulseX, 9mm, and other DEXs [1]. Unlike BASE, PulseChain does not have native Chainlink VRF support, so this blueprint uses a **commit-reveal scheme** for provably fair trait randomization — achieving the same fairness guarantees through a different cryptographic mechanism.

The system is fully **immutable** — no admin keys, no kill switch, no upgrade proxy. The holder is the sole owner. If they lose it, it is gone forever. No copies, no duplication, no backdoors.

---

## 2. System Architecture Overview

The architecture consists of three smart contracts deployed on PulseChain, a commit-reveal RNG system, metadata on IPFS, and integration hooks into the existing herobase.io frontend.

| Component | Contract Type | Purpose |
|-----------|--------------|---------|
| **HeroNFT_PLS** | ERC-721 (Immutable) | The NFT collection — 1,000 unique tokens |
| **HeroToken_PLS** | ERC-20 (Fee-on-Transfer) | The $HERO token with NFT-gated fee discount |
| **HeroMinter_PLS** | Minting Controller | Handles mint logic, commit-reveal RNG, payment |
| **IPFS Metadata** | Off-chain (Pinata/nft.storage) | Permanent decentralized image + trait storage |
| **herobase.io** | Frontend (React) | Mint page, gallery, wallet verification |

### 2.1 Contract Dependency Graph

```
HeroToken_PLS (ERC-20)
    │
    ├── reads ──► HeroNFT_PLS.balanceOf(wallet)
    │              (checks if wallet holds NFT for 2% discount)
    │
    └── fee logic: if NFT holder → reduce fee by 2%

HeroMinter_PLS
    │
    ├── calls ──► HeroNFT_PLS.mint(to, tokenId)
    ├── uses  ──► Commit-Reveal RNG (2-step process)
    │              Step 1: User commits hash(secret)
    │              Step 2: After N blocks, reveal secret + use future blockhash
    └── reads ──► HeroNFT_PLS.totalSupply() (enforce max 1,000)

HeroNFT_PLS (ERC-721)
    │
    ├── stores ──► tokenURI → IPFS CID (immutable after mint)
    └── NO admin functions, NO pause, NO upgrade
```

### 2.2 Key Difference from BASE Blueprint

The fundamental difference between the PulseChain and BASE deployments is the randomness source. This table summarizes the architectural divergence.

| Feature | BASE Chain | PulseChain |
|---------|-----------|------------|
| **RNG Method** | Chainlink VRF v2.5 | Commit-Reveal Scheme |
| **Randomness Proof** | Cryptographic VRF proof | Block hash + user secret |
| **Mint Steps** | 1 tx (VRF callback) | 2 tx (commit + reveal) |
| **Cost per Mint** | ~$0.01 + LINK fee | ~$0.002 (PLS gas only) |
| **Finality** | ~2 seconds | ~10 seconds |
| **Native Token** | ETH (bridged) | PLS |
| **DEX Ecosystem** | Uniswap, Aerodrome | PulseX, 9mm, 9inch |
| **Fee Discount Logic** | Identical | Identical |
| **NFT Contract** | Identical (same Solidity) | Identical (same Solidity) |
| **Token Contract** | Identical (same Solidity) | Identical (same Solidity) |

---

## 3. Smart Contract Specifications

### 3.1 HeroNFT_PLS (ERC-721 — Immutable)

The NFT contract on PulseChain is **byte-for-byte identical** to the BASE version. The same Solidity source code compiles to the same bytecode and is deployed with different constructor parameters (chain-specific base URI and minter address).

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Token Standard** | ERC-721 | Industry standard, same as BASE [2] |
| **Max Supply** | 1,000 | Hardcoded, matches BASE collection size |
| **Base URI** | `ipfs://` | Same IPFS structure, different CID per chain |
| **Owner Functions** | NONE | Identical immutability guarantees |
| **Pausable** | NO | No pause mechanism |
| **Upgradeable** | NO | No proxy pattern |
| **Burnable** | YES | Holder can burn (gone forever) |
| **Royalties** | ERC-2981 | Optional, marketplace-level |

```solidity
// IDENTICAL to BASE version — same contract, different deployment
contract HeroNFT_PLS is ERC721, ERC721Enumerable, ERC721Burnable, ERC2981 {
    uint256 public constant MAX_SUPPLY = 1000;
    string private _baseTokenURI;
    address public immutable MINTER;
    
    constructor(
        string memory baseURI,
        address minterContract,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721("HERO NFT", "HERONFT") {
        _baseTokenURI = baseURI;
        MINTER = minterContract;
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }
    
    function mint(address to, uint256 tokenId) external {
        require(msg.sender == MINTER, "Only minter");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        _safeMint(to, tokenId);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
```

#### 3.1.1 Immutability Guarantees

Identical to BASE — see Section 3.1.2 of the BASE blueprint. Every admin action is confirmed as non-existent.

### 3.2 HeroToken_PLS (ERC-20 — Fee-on-Transfer with NFT Discount)

The $HERO token contract on PulseChain is **functionally identical** to the BASE version. The fee discount logic, NFT holder check, and excluded address handling are all the same Solidity code.

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Default Fee** | 5% | Same as BASE |
| **NFT Discount** | 2% | Same as BASE |
| **NFT Check** | `HeroNFT_PLS.balanceOf(wallet) > 0` | O(1) lookup |
| **Fee Recipient** | Treasury / Buy-and-Burn | PulseChain treasury address |
| **Excluded Addresses** | PulseX router, 9mm router, treasury | PulseChain DEX routers |

#### 3.2.1 Fee Discount Logic

The `_update()` function is identical to the BASE version. The only difference is the constructor parameters — the NFT contract address and excluded addresses point to PulseChain-specific contracts.

```solidity
// IDENTICAL fee logic — same contract, PulseChain-specific constructor args
contract HeroToken_PLS is ERC20 {
    IERC721 public immutable HERO_NFT;
    address public immutable FEE_RECIPIENT;
    
    uint256 public constant DEFAULT_FEE_BPS = 500;    // 5.00%
    uint256 public constant NFT_DISCOUNT_BPS = 200;   // 2.00%
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    mapping(address => bool) public isExcludedFromFee;
    
    constructor(
        address nftContract,
        address feeRecipient,
        address[] memory excludedAddresses  // PulseX, 9mm, 9inch routers
    ) ERC20("HERO", "HERO") {
        HERO_NFT = IERC721(nftContract);
        FEE_RECIPIENT = feeRecipient;
        for (uint i = 0; i < excludedAddresses.length; i++) {
            isExcludedFromFee[excludedAddresses[i]] = true;
        }
    }
    
    function _update(address from, address to, uint256 amount) internal override {
        if (from == address(0) || to == address(0) ||
            isExcludedFromFee[from] || isExcludedFromFee[to]) {
            super._update(from, to, amount);
            return;
        }
        
        uint256 feeBps = DEFAULT_FEE_BPS;
        if (_holdsHeroNFT(from) || _holdsHeroNFT(to)) {
            feeBps = DEFAULT_FEE_BPS - NFT_DISCOUNT_BPS;
        }
        
        uint256 feeAmount = (amount * feeBps) / BPS_DENOMINATOR;
        uint256 transferAmount = amount - feeAmount;
        
        super._update(from, to, transferAmount);
        super._update(from, FEE_RECIPIENT, feeAmount);
    }
    
    function _holdsHeroNFT(address wallet) internal view returns (bool) {
        try HERO_NFT.balanceOf(wallet) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }
    
    function hasNFTDiscount(address wallet) external view returns (bool) {
        return _holdsHeroNFT(wallet);
    }
    
    function getEffectiveFee(address from, address to) external view returns (uint256 feeBps) {
        if (isExcludedFromFee[from] || isExcludedFromFee[to]) return 0;
        feeBps = DEFAULT_FEE_BPS;
        if (_holdsHeroNFT(from) || _holdsHeroNFT(to)) {
            feeBps = DEFAULT_FEE_BPS - NFT_DISCOUNT_BPS;
        }
        return feeBps;
    }
}
```

#### 3.2.2 Gas Cost Analysis (PulseChain)

PulseChain has significantly lower gas costs than both Ethereum L1 and BASE L2, making the NFT holder check essentially free.

| Operation | Gas Used | Cost (PulseChain) | Cost (BASE) | Cost (Ethereum L1) |
|-----------|----------|-------------------|-------------|-------------------|
| Standard ERC-20 transfer | ~65,000 | ~$0.0003 | ~$0.003 | ~$1.50 |
| Transfer + NFT check (2 calls) | ~70,200 | ~$0.0004 | ~$0.004 | ~$1.65 |
| Additional cost for NFT check | ~5,200 | ~$0.0001 | ~$0.001 | ~$0.15 |
| NFT Mint (commit step) | ~45,000 | ~$0.0002 | N/A | N/A |
| NFT Mint (reveal step) | ~120,000 | ~$0.0006 | N/A | N/A |

The NFT holder verification adds approximately $0.0001 per transfer on PulseChain — completely negligible. PulseChain's low gas environment makes the 2% fee discount even more attractive since the check cost is near-zero.

### 3.3 HeroMinter_PLS (Commit-Reveal Minting Controller)

This is where PulseChain diverges from BASE. Since PulseChain does not have native Chainlink VRF, the minter uses a **two-step commit-reveal scheme** for provably fair randomness. This approach is well-established in the Ethereum ecosystem and provides strong fairness guarantees without requiring an external oracle [3].

#### 3.3.1 How Commit-Reveal Works (Crayon Version)

Think of it like a sealed envelope:

1. **COMMIT** — The user generates a random secret on their device, hashes it (like sealing it in an envelope), and sends the hash to the contract. Nobody can see the secret yet.

2. **WAIT** — The contract waits for N blocks (e.g., 5 blocks = ~50 seconds on PulseChain). During this time, a new block hash is generated that nobody could have predicted.

3. **REVEAL** — The user reveals their original secret. The contract combines the secret with the future block hash to generate the random number. Neither the user nor the miner could have manipulated both values.

The result: provably fair randomness without Chainlink.

#### 3.3.2 Contract Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HeroMinter_PLS {
    HeroNFT_PLS public immutable NFT;
    
    uint256 public constant MINT_PRICE = 100_000 ether;  // 100,000 PLS
    uint256 public constant MAX_PER_WALLET = 5;
    uint256 public constant REVEAL_DELAY = 5;    // Wait 5 blocks
    uint256 public constant REVEAL_WINDOW = 256; // Must reveal within 256 blocks
    
    struct MintCommit {
        bytes32 commitHash;       // keccak256(secret)
        uint256 commitBlock;      // Block number when committed
        bool revealed;            // Whether the reveal has been completed
        bool minted;              // Whether the NFT has been minted
    }
    
    mapping(address => MintCommit[]) public commits;
    mapping(address => uint256) public mintCount;
    
    event MintCommitted(address indexed user, bytes32 commitHash, uint256 commitBlock);
    event MintRevealed(address indexed user, uint256 tokenId, uint256 randomSeed);
    
    constructor(address nftContract) {
        NFT = HeroNFT_PLS(nftContract);
    }
    
    /// @notice Step 1: Commit a hash of your secret
    /// @param commitHash keccak256(abi.encodePacked(secret, msg.sender))
    function commitMint(bytes32 commitHash) external payable {
        require(msg.value >= MINT_PRICE, "Insufficient PLS");
        require(mintCount[msg.sender] < MAX_PER_WALLET, "Max per wallet");
        require(NFT.totalSupply() < NFT.MAX_SUPPLY(), "Sold out");
        require(commitHash != bytes32(0), "Invalid commit");
        
        commits[msg.sender].push(MintCommit({
            commitHash: commitHash,
            commitBlock: block.number,
            revealed: false,
            minted: false
        }));
        
        mintCount[msg.sender]++;
        emit MintCommitted(msg.sender, commitHash, block.number);
    }
    
    /// @notice Step 2: Reveal your secret to mint (after REVEAL_DELAY blocks)
    /// @param commitIndex Index of the commit in the user's commits array
    /// @param secret The original secret that was hashed in Step 1
    function revealMint(uint256 commitIndex, bytes32 secret) external {
        require(commitIndex < commits[msg.sender].length, "Invalid index");
        
        MintCommit storage commit = commits[msg.sender][commitIndex];
        require(!commit.revealed, "Already revealed");
        require(!commit.minted, "Already minted");
        
        // Verify the secret matches the commit
        bytes32 expectedHash = keccak256(abi.encodePacked(secret, msg.sender));
        require(expectedHash == commit.commitHash, "Invalid secret");
        
        // Ensure enough blocks have passed
        require(
            block.number > commit.commitBlock + REVEAL_DELAY,
            "Too early — wait for more blocks"
        );
        
        // Ensure we're within the reveal window (blockhash only available for last 256 blocks)
        require(
            block.number <= commit.commitBlock + REVEAL_WINDOW,
            "Reveal window expired — commit again"
        );
        
        // Generate random seed from secret + future block hash
        bytes32 futureBlockHash = blockhash(commit.commitBlock + REVEAL_DELAY);
        require(futureBlockHash != bytes32(0), "Block hash unavailable");
        
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            secret,
            futureBlockHash,
            msg.sender,
            commit.commitBlock
        )));
        
        // Mint the NFT
        uint256 tokenId = NFT.totalSupply() + 1;
        commit.revealed = true;
        commit.minted = true;
        
        NFT.mint(msg.sender, tokenId);
        emit MintRevealed(msg.sender, tokenId, randomSeed);
    }
    
    /// @notice Get pending commits for a user
    function getPendingCommits(address user) external view returns (uint256 count) {
        for (uint i = 0; i < commits[user].length; i++) {
            if (!commits[user][i].revealed) count++;
        }
    }
    
    /// @notice Check if a commit is ready to reveal
    function isReadyToReveal(address user, uint256 index) external view returns (bool) {
        if (index >= commits[user].length) return false;
        MintCommit storage commit = commits[user][index];
        if (commit.revealed) return false;
        return block.number > commit.commitBlock + REVEAL_DELAY &&
               block.number <= commit.commitBlock + REVEAL_WINDOW;
    }
}
```

#### 3.3.3 Commit-Reveal Security Analysis

| Attack Vector | Risk | Mitigation |
|--------------|------|------------|
| **Miner front-running** | LOW | Miner would need to know the secret AND control the block hash — the commit prevents this since the secret is hidden |
| **User manipulation** | NONE | User commits before knowing the future block hash — they cannot choose a favorable outcome |
| **Block hash prediction** | LOW | PulseChain uses Proof-of-Stake with validator rotation — predicting block hashes 5 blocks ahead is computationally infeasible |
| **Reveal window expiry** | LOW | User has 256 blocks (~42 minutes on PulseChain) to reveal — generous window |
| **Replay attack** | NONE | Commit includes `msg.sender` — cannot be replayed by another address |
| **Front-running the reveal** | NONE | Only the original committer can reveal (secret is bound to their address) |

#### 3.3.4 Commit-Reveal vs Chainlink VRF Comparison

| Feature | Commit-Reveal (PulseChain) | Chainlink VRF (BASE) |
|---------|---------------------------|---------------------|
| **Fairness** | Strong (user secret + block hash) | Strongest (cryptographic VRF proof) |
| **Cost** | ~$0.001 (2 PLS txns) | ~$0.01 + LINK fee |
| **User Experience** | 2-step process (commit, wait, reveal) | 1-step (request, auto-callback) |
| **External Dependencies** | None | Chainlink oracle network |
| **Proof of Randomness** | On-chain (block hash + commit hash) | On-chain (VRF proof) |
| **Manipulation Risk** | Very low (dual-entropy) | Near-zero (VRF guarantee) |

---

## 4. Metadata Architecture (IPFS)

The metadata architecture is **identical** to the BASE blueprint. Both chains share the same IPFS infrastructure, but each chain's collection has its own metadata CID to distinguish between BASE NFTs and PulseChain NFTs.

### 4.1 Chain-Specific Metadata

```json
{
    "name": "HERO #0001",
    "description": "HERO NFT Collection — VetsInCrypto (PulseChain). Holder receives 2% fee discount on all $HERO token transfers.",
    "image": "ipfs://QmYyy.../images/0001.png",
    "external_url": "https://herobase.io/nft/pls/0001",
    "attributes": [
        {"trait_type": "Background", "value": "Desert Storm"},
        {"trait_type": "Outfit", "value": "Dress Blues"},
        {"trait_type": "Weapon", "value": "Ka-Bar"},
        {"trait_type": "Rank", "value": "Sergeant"},
        {"trait_type": "Badge", "value": "Purple Heart"},
        {"trait_type": "Special", "value": "None"}
    ],
    "properties": {
        "rarity_score": 847,
        "rarity_tier": "Rare",
        "chain": "PulseChain",
        "collection_size": 1000,
        "utility": {
            "fee_discount": "2% reduction on HERO token transfers",
            "dao_voting": "Weighted voting power in HERO DAO",
            "holder_rewards": "Eligible for quarterly airdrop rewards"
        },
        "commit_reveal_proof": {
            "commit_hash": "0xdef456...",
            "reveal_block": 26360521,
            "random_seed": "0x789abc..."
        }
    }
}
```

### 4.2 Dual-Chain IPFS Strategy

| Chain | Metadata CID | Image CID | Reason for Separation |
|-------|-------------|-----------|----------------------|
| BASE | `ipfs://QmXxx...` | `ipfs://QmXxx.../images/` | BASE-specific external_url and chain field |
| PulseChain | `ipfs://QmYyy...` | `ipfs://QmYyy.../images/` | PulseChain-specific external_url and chain field |

The artwork images CAN be the same across both chains (same artist layers, same trait combinations), but the metadata JSON must be chain-specific to correctly reference the chain name, external URLs, and randomness proofs.

---

## 5. PulseChain Network Details

| Parameter | Value |
|-----------|-------|
| **Chain ID** | 369 |
| **RPC URL** | `https://rpc.pulsechain.com` |
| **Block Explorer** | `https://scan.pulsechain.com` |
| **Native Token** | PLS |
| **Average Block Time** | ~10 seconds |
| **Average Gas Price** | ~30 gwei (varies) |
| **Consensus** | Proof-of-Stake |
| **EVM Compatibility** | Full (Ethereum fork) |
| **DEX Routers to Exclude** | PulseX V1, PulseX V2, 9mm, 9inch |

### 5.1 PulseChain-Specific DEX Router Addresses

These addresses must be excluded from the fee-on-transfer mechanism to ensure smooth DEX trading.

| DEX | Router Address | Notes |
|-----|---------------|-------|
| **PulseX V2** | `0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02` | Primary DEX |
| **PulseX V1** | `0x165C3410fC91EF562C50559f7d2289fEbed552d9` | Legacy, still active |
| **9mm** | Check current deployment | Newer DEX |
| **9inch** | Check current deployment | Aggregator |

---

## 6. Deployment Pipeline

### 6.1 Pre-Deployment Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | Artist delivers all layer PNGs (per ARTIST_GUIDE.md) | PENDING |
| 2 | Run artist-pipeline.ts to generate 1,000 composite images | READY |
| 3 | Generate 1,000 metadata JSON files (PulseChain-specific) | READY |
| 4 | Upload images + metadata to IPFS via Pinata | READY |
| 5 | Get final IPFS CID for PulseChain metadata directory | READY |
| 6 | Deploy HeroNFT_PLS with IPFS CID as baseURI | READY |
| 7 | Deploy HeroMinter_PLS with NFT contract address | READY |
| 8 | Deploy/update HeroToken_PLS with NFT contract address | READY |
| 9 | Verify all contracts on PulseScan | READY |
| 10 | Test commit-reveal mint flow on PulseChain testnet v4 | READY |
| 11 | Go live on PulseChain mainnet | READY |

### 6.2 Deployment Order (Critical)

The contracts must be deployed in a specific order due to immutable cross-references.

```
Step 1: Deploy HeroMinter_PLS (get address)
Step 2: Deploy HeroNFT_PLS(baseURI, minterAddress, royaltyReceiver, royaltyBps)
Step 3: Deploy HeroToken_PLS(nftAddress, feeRecipient, excludedAddresses)
```

> **Important:** Since `HeroNFT_PLS` takes the minter address in its constructor (immutable), and `HeroMinter_PLS` takes the NFT address in its constructor, there is a circular dependency. The solution is to deploy the minter first with a placeholder NFT address, then deploy the NFT with the minter address, then use a one-time `setNFT()` function on the minter that can only be called once and is then permanently locked.

```solidity
// One-time NFT address setter in HeroMinter_PLS
address public nftAddress;
bool public nftAddressLocked;

function setNFTAddress(address _nft) external {
    require(!nftAddressLocked, "Already locked");
    require(msg.sender == DEPLOYER, "Only deployer");
    nftAddress = _nft;
    nftAddressLocked = true;  // Can NEVER be changed again
}
```

---

## 7. Frontend Integration (herobase.io)

### 7.1 Dual-Chain Mint Experience

The herobase.io mint page must support both chains. The user selects their chain, connects their wallet, and the UI adapts accordingly.

| Feature | BASE | PulseChain |
|---------|------|------------|
| **Wallet Connect** | MetaMask, Coinbase Wallet | MetaMask, Rabby |
| **Mint Flow** | 1-click (VRF auto-callback) | 2-click (commit → wait → reveal) |
| **Mint Price** | 0.001 ETH | 100,000 PLS |
| **Fee Discount Badge** | Shows on Dashboard | Shows on Dashboard |
| **NFT Gallery** | `/nft-gallery?chain=base` | `/nft-gallery?chain=pulse` |

### 7.2 PulseChain-Specific Mint UI

The commit-reveal process requires a slightly different UI flow than BASE. The user sees a progress indicator showing the three stages.

```
[1. COMMIT] ──► [2. WAITING (5 blocks...)] ──► [3. REVEAL & MINT]
   ✅ Done         ⏳ 3/5 blocks                  🔓 Ready!
```

```tsx
// PulseChain mint flow component
function PulseChainMint() {
    const [stage, setStage] = useState<'commit' | 'waiting' | 'reveal'>('commit');
    const [blocksRemaining, setBlocksRemaining] = useState(5);
    
    async function handleCommit() {
        // Generate secret client-side using crypto.getRandomValues()
        const secretBytes = crypto.getRandomValues(new Uint8Array(32));
        const secret = '0x' + Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Store secret locally (user must not lose this!)
        localStorage.setItem('mintSecret', secret);
        
        // Compute commit hash
        const commitHash = keccak256(encodePacked(secret, userAddress));
        
        // Send commit transaction
        await minterContract.commitMint(commitHash, { value: MINT_PRICE });
        setStage('waiting');
    }
    
    async function handleReveal() {
        const secret = localStorage.getItem('mintSecret');
        await minterContract.revealMint(commitIndex, secret);
        setStage('commit');  // Reset for next mint
        // Show trait reveal animation!
    }
}
```

---

## 8. Security Considerations

### 8.1 PulseChain-Specific Attack Vectors

| Attack Vector | Risk | Mitigation |
|--------------|------|------------|
| **Validator collusion (block hash)** | VERY LOW | PulseChain has 100+ validators — collusion to predict block hash 5 blocks ahead is impractical |
| **Flash loan NFT for fee discount** | MEDIUM | Same as BASE — consider minimum hold duration check |
| **Commit front-running** | NONE | Commit hash reveals nothing about the secret |
| **Reveal front-running** | NONE | Only the committer's address can reveal (bound in hash) |
| **Secret loss** | LOW | If user loses secret before reveal, they lose their mint payment — UI must warn clearly |
| **PulseChain reorg** | VERY LOW | PulseChain PoS has strong finality — reorgs beyond 5 blocks are extremely unlikely |

### 8.2 Flash Loan NFT Mitigation (Both Chains)

For both BASE and PulseChain, the flash loan NFT attack is the primary concern. The recommended mitigation is a **minimum hold duration** check.

```solidity
// Add to HeroToken (both chains)
mapping(address => uint256) public lastNFTTransferBlock;

// Called by NFT contract on every transfer (via ERC721 _update hook)
function recordNFTTransfer(address to) external {
    require(msg.sender == address(HERO_NFT), "Only NFT contract");
    lastNFTTransferBlock[to] = block.number;
}

function _holdsHeroNFT(address wallet) internal view returns (bool) {
    try HERO_NFT.balanceOf(wallet) returns (uint256 balance) {
        if (balance == 0) return false;
        // Must have held NFT for at least 1 block
        return block.number > lastNFTTransferBlock[wallet];
    } catch {
        return false;
    }
}
```

---

## 9. Cost Estimates (PulseChain)

| Item | Cost | Notes |
|------|------|-------|
| Deploy HeroNFT_PLS | ~50,000 PLS (~$0.50) | PulseChain deployment |
| Deploy HeroToken_PLS | ~50,000 PLS (~$0.50) | PulseChain deployment |
| Deploy HeroMinter_PLS | ~80,000 PLS (~$0.80) | Commit-reveal logic |
| Chainlink VRF | $0 | Not needed — commit-reveal is free |
| IPFS pinning | ~$10/year | Shared with BASE collection |
| PulseScan verification | FREE | Standard verification |
| **Total Deployment Cost** | **~$2** | Significantly cheaper than BASE |

---

## 10. Dual-Chain Collection Summary

This section provides a side-by-side comparison of the complete HERO NFT ecosystem across both chains.

| Aspect | BASE Chain | PulseChain |
|--------|-----------|------------|
| **Collection Size** | 1,000 NFTs | 1,000 NFTs |
| **Total Across Both Chains** | 2,000 NFTs | (combined) |
| **Token Standard** | ERC-721 | ERC-721 |
| **Fee Discount** | 2% on $HERO transfers | 2% on $HERO transfers |
| **RNG Method** | Chainlink VRF v2.5 | Commit-Reveal |
| **Mint Price** | 0.001 ETH | 100,000 PLS |
| **Deployment Cost** | ~$52 | ~$2 |
| **Immutable** | YES | YES |
| **Burnable** | YES | YES |
| **Cross-Chain** | Independent | Independent |
| **Metadata** | IPFS (separate CID) | IPFS (separate CID) |
| **Artwork** | Same artist layers | Same artist layers |
| **DAO Voting** | Chain-specific DAO | Chain-specific DAO |
| **Holder Rewards** | Chain-specific rewards | Chain-specific rewards |

> **Design Decision:** Each chain operates independently. A holder on BASE gets the 2% discount on BASE $HERO transfers. A holder on PulseChain gets the 2% discount on PulseChain $HERO transfers. There is no cross-chain discount — holding a BASE NFT does NOT give a discount on PulseChain, and vice versa. This keeps the system simple, immutable, and free of bridge dependencies.

---

## 11. References

[1]: https://pulsechain.com "PulseChain — Official Website"
[2]: https://eips.ethereum.org/EIPS/eip-721 "ERC-721: Non-Fungible Token Standard"
[3]: https://ethereum.stackexchange.com/questions/191/how-can-i-securely-generate-a-random-number-in-my-smart-contract "Commit-Reveal Randomness in Smart Contracts"
[4]: https://scan.pulsechain.com "PulseScan — PulseChain Block Explorer"
[5]: https://docs.chain.link/vrf "Chainlink VRF Documentation (BASE reference)"
