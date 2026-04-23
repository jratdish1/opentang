# DexScreener LP Pair Verification — April 24, 2026

## PulseChain Pairs

### 1. HERO/PLSX — 0xCC04c1c8bf3bfC686b9A64a8505f84934067366e
- Price: $0.0002264 (36.3389 PLSX)
- Liquidity: $4.2K
- FDV/MCap: $22K
- 24H Volume: $3 (very low)
- Txns: 3 (all sells in last 24h)
- Pooled: 9,393,295 HERO ($2.1K) + 341,342,473 PLSX ($2.1K)
- Status: ACTIVE but very low volume
- Last trade: 1h 21m ago (Sell $2.59)
- HERO CA confirmed: 0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27 ✅

### 2. HERO/WPLS — 0x34948E125033a697332202964DE96Af85beCd78F
- Price: $0.0002191 (27.7047 WPLS)
- Liquidity: $5.1K
- FDV/MCap: $21K
- 24H Volume: $8 (very low)
- Txns: 2 (all sells)
- Pooled: 11,739,045 HERO ($2.5K) + 325,227,207 WPLS ($2.5K)
- Status: ACTIVE but very low volume
- Last trade: 6h 46m ago (Sell $8.22)
- HERO CA confirmed: 0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27 ✅

## BASE Pairs

### 3. HERO/WETH (Aerodrome) — 0xb813599dd596c179c8888c8a4bd3fec8308d1e20
- Price: $0.048326 (0.073571 WETH)
- Liquidity: $4.6K
- FDV/MCap: $8.3K
- 24H Volume: $8
- Txns: 5 (all buys!)
- Pooled: 28,008,275 HERO ($2.3K) + 1.00 WETH ($2.3K)
- Status: ACTIVE — HABFF bot buying confirmed (5 buys in 24h)
- Last trade: 7h 13m ago (Buy $2.16)
- HERO CA confirmed: 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8 ✅
- 52 holders, 5 LP providers

### 4. HERO/WETH (Uniswap V2) — 0x3Bb159de8604ab7E0148EDC24F2A568c430476CF ⭐ HABFF MAIN PAIR
- Price: $0.048304 (0.073565 WETH)
- Liquidity: $3.9K
- FDV/MCap: $8.2K
- 24H Volume: $51 (156 buys / 187 sells = 343 txns!)
- Makers: 20 (13 buyers, 10 sellers)
- Pooled: 23,545,657 HERO ($1.9K) + 0.8395 WETH ($1.9K)
- Status: VERY ACTIVE — HABFF bot confirmed buying/selling every ~10 min
- Last trade: 4 min ago! (Buy/Sell pairs visible)
- HERO CA confirmed: 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8 ✅
- This matches HABFF bot pair address exactly ✅
- 52 holders, 5 LP providers

NOTE: The buy/sell pairs every 10 min (49.70 HERO buy, 50 HERO sell) are the HABFF volume trades confirmed live!

### 5. VETS/HERO (PulseX) — 0x3Bb750564dF56F9589aF250cb9d0C4BF9a1D0D53
- Price: $0.005315 (25.7111 HERO per VETS)
- Liquidity: $1.5K
- FDV/MCap: $5.3K
- 24H Volume: $1
- Txns: 1 (buy)
- Pooled: 142,593 VETS ($757) + 3,666,248 HERO ($757)
- Status: ACTIVE but low volume
- Last trade: 1h 39m ago (Buy $1.31)
- HERO CA: 0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27 ✅
- VETS CA: 0x4013abBf94A745EfA7cc848989Ee83424A770060 ✅

## HABFF Fee Exemption Verification (BASE)

### HERO Token Contract Functions (from BaseScan Read Contract):
Key fee-related functions found:
- #21: feeDecayTime
- #22: feeDenominator
- #23: feeDiscountEnabled
- #24: feeDiscountNft
- #27: getTotalFee
- #29: heroAutoLpFee
- #30: heroBurnFee
- #32: isEligibleForNftDiscount
- **#33: isFeeExempt (0x3f4218e0)** ← THIS IS THE ONE
- #34: isPair
- #35: isTxLimitExempt
- #40: nftFeeDiscountBps

Now querying isFeeExempt for HABFF contract 0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55...

### On-Chain Fee Exemption Results (BASE HERO Token — isFeeExempt):
- **HABFF Contract (0x1e8B3A00):** ✅ FEE EXEMPT (val=1)
- **Buy & Burn (0x67bEF0A8):** ✅ FEE EXEMPT (val=1)

Both confirmed fee-exempt on-chain via direct RPC call to isFeeExempt(address) on the HERO token contract.
