# HERO NFT — Immutable Ownership Specification

## Core Principle: TRUE OWNERSHIP

> "If they lose it, it's gone forever. They own it. No copies. No off switch."

---

## Contract Design: Zero Admin, Zero Kill Switch

### What the Contract DOES:
- Mint NFTs up to MAX_SUPPLY (2,000) — hardcoded, immutable
- Transfer NFTs between wallets (standard ERC-721)
- Burn NFTs (owner only — permanently destroys the token)
- Store tokenURI pointing to IPFS metadata (immutable after mint)

### What the Contract DOES NOT Have:
- ❌ NO `pause()` or `unpause()` — no kill switch
- ❌ NO `setBaseURI()` after deployment — metadata is permanent
- ❌ NO `Ownable` or admin role — no privileged functions
- ❌ NO proxy pattern — no upgradability
- ❌ NO `mint()` after collection is complete — supply is capped
- ❌ NO `setApprovalForAll()` override — standard ERC-721 only
- ❌ NO royalty enforcement on-chain — optional marketplace-level only
- ❌ NO blacklist or whitelist — anyone can buy/sell/transfer
- ❌ NO recovery function — lost keys = lost NFT forever

### What Makes It Truly Immutable:
1. **No constructor admin**: Contract has no `owner` variable
2. **Hardcoded supply**: `uint256 public constant MAX_SUPPLY = 2000;`
3. **IPFS metadata**: Once minted, tokenURI points to `ipfs://` — no server dependency
4. **No selfdestruct**: Contract cannot be destroyed
5. **Renounced everything**: No admin functions exist to renounce — they were never created

---

## Smart Contract Skeleton (Solidity 0.8.24+)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HeroNFT
 * @notice Immutable ERC-721 NFT contract for the HERO collection.
 *         No admin functions. No kill switch. No upgradability.
 *         True ownership — if you lose it, it's gone forever.
 * 
 * @dev MAX_SUPPLY is hardcoded. Metadata is on IPFS (immutable).
 *      Once minting is complete, no more tokens can ever be created.
 *      There is NO owner, NO pause, NO proxy, NO recovery.
 */
contract HeroNFT is ERC721, ERC721Burnable, ERC721Enumerable {
    using Strings for uint256;

    // ─── Immutable State ────────────────────────────────────────
    
    uint256 public constant MAX_SUPPLY = 2000;
    uint256 public constant MINT_PRICE = 0; // Free mint (or set price)
    
    // IPFS base URI — set once at deployment, never changeable
    string private immutable _baseTokenURI;
    
    // Tracks next token ID to mint
    uint256 private _nextTokenId = 1;
    
    // Minting window — once closed, NEVER reopens
    bool public mintingComplete = false;

    // ─── Events ─────────────────────────────────────────────────
    
    event MintingCompleted(uint256 totalMinted, uint256 timestamp);

    // ─── Constructor ────────────────────────────────────────────
    
    /**
     * @param baseURI_ The IPFS base URI for metadata (e.g., "ipfs://QmXYZ.../")
     *                 This is set ONCE and can NEVER be changed.
     */
    constructor(string memory baseURI_) ERC721("HERO NFT", "HERO") {
        require(bytes(baseURI_).length > 0, "Base URI required");
        _baseTokenURI = baseURI_;
    }

    // ─── Minting ────────────────────────────────────────────────
    
    /**
     * @notice Mint a new HERO NFT. Anyone can mint until MAX_SUPPLY is reached.
     * @dev No admin required. No whitelist. First come, first served.
     */
    function mint() external payable {
        require(!mintingComplete, "Minting is complete");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        
        // Auto-close minting when supply is reached
        if (_nextTokenId > MAX_SUPPLY) {
            mintingComplete = true;
            emit MintingCompleted(MAX_SUPPLY, block.timestamp);
        }
    }
    
    /**
     * @notice Batch mint multiple NFTs (gas efficient)
     * @param quantity Number of NFTs to mint (max 10 per tx)
     */
    function mintBatch(uint256 quantity) external payable {
        require(!mintingComplete, "Minting is complete");
        require(quantity > 0 && quantity <= 10, "Mint 1-10 per tx");
        require(_nextTokenId + quantity - 1 <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            _safeMint(msg.sender, tokenId);
        }
        
        if (_nextTokenId > MAX_SUPPLY) {
            mintingComplete = true;
            emit MintingCompleted(MAX_SUPPLY, block.timestamp);
        }
    }

    // ─── Metadata ───────────────────────────────────────────────
    
    /**
     * @notice Returns the IPFS URI for a token's metadata
     * @dev Points to immutable IPFS content — no server dependency
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // ─── Required Overrides ─────────────────────────────────────
    
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable) returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ─── View Functions ─────────────────────────────────────────
    
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function remainingSupply() external view returns (uint256) {
        if (mintingComplete) return 0;
        return MAX_SUPPLY - (_nextTokenId - 1);
    }
}
```

---

## Deployment Checklist

### Pre-Deployment:
1. [ ] All 2,000 NFT images composed and uploaded to IPFS
2. [ ] All 2,000 metadata JSON files uploaded to IPFS
3. [ ] IPFS directory CID verified and pinned (Pinata/NFT.Storage)
4. [ ] Base URI confirmed: `ipfs://{CID}/`
5. [ ] Contract compiled with Solidity 0.8.24+ (no optimizer bugs)
6. [ ] Contract verified on block explorer

### Deployment Steps:
1. Deploy with `baseURI_` = `ipfs://{CID}/`
2. Verify contract source on PulseChain/BASE explorer
3. Test mint 1 NFT → verify metadata loads from IPFS
4. Announce mint to community
5. Monitor minting progress

### Post-Deployment:
- **NOTHING TO DO** — contract is immutable
- No admin keys to secure
- No multisig to manage
- No proxy to worry about
- Just... let it run forever

---

## Why No Royalties On-Chain?

On-chain royalty enforcement (ERC-2981) requires marketplace cooperation and can be bypassed. Instead:
- Set royalties at the marketplace level (OpenSea, PulseX NFT, etc.)
- 5% suggested royalty to HERO treasury
- Marketplaces that respect ERC-2981 will honor it
- Those that don't... well, that's the free market

---

## Burn Mechanics

- Only the token OWNER can burn their NFT
- `burn(tokenId)` permanently destroys the token
- Token ID is never reused
- Total supply decreases permanently
- **There is no undo** — burned = gone forever

---

## 2,000 NFT Collection Capacity

| Metric | Value |
|--------|-------|
| Max Supply | 2,000 (hardcoded) |
| Trait Categories | 6 |
| Options per Category | 9-10 |
| Total Possible Combinations | 810,000+ |
| Duplicate Probability | < 0.25% at 2,000 mints |
| Batch Mint | Up to 10 per transaction |
| Gas per Mint | ~120,000 gas (PulseChain: ~$0.01) |

---

*Built for Veterans, by Veterans. No admin. No kill switch. True ownership. Semper Fi.*
