# V4 Audit — 8 HIGH Findings

## 1. rng-engine.ts — Block hash entropy (line ~248)
**Issue:** T1 off-chain RNG uses block hash which is miner-manipulable
**Fix:** Already documented as T1 limitation. Enforce VRF for T2/T3. ACCEPTED RISK.

## 2. rng-engine.ts — BigInt seed parsing (line ~320)
**Issue:** BigInt(seed) could fail on malformed hex
**Fix:** Already added hex validation + positive BigInt mask in previous fix. VERIFY.

## 3. nft-trait-engine.ts — userSecret enforcement (line ~499)
**Issue:** generateTrait should require userSecret in production
**Fix:** Already added isProduction flag + userSecret validation. VERIFY.

## 4. nft-trait-engine.ts — RNG seed construction (line ~566)
**Issue:** Confirm seed = hash(blockHash + tokenId + userSecret + chain)
**Fix:** Already implemented. VERIFY.

## 5. rewards-engine.ts — BigInt precision in weight calc (line ~1068)
**Issue:** `Number(h.balance / 1000000n)` truncates and loses precision for small holders
**Fix:** Use BigInt-compatible weighted random. NEEDS FIX.

## 6. rewards-engine.ts — Weight bias (line ~1111)
**Issue:** Duplicate of #5 — truncation biases selection
**Fix:** Same as #5. NEEDS FIX.

## 7. SpinWheel.tsx — Client RNG in preview (line ~1430)
**Issue:** Client-side CSPRNG used for preview only — production must use server RNG
**Fix:** Already documented with comments. ACCEPTED (preview only).

## 8. vrf-provider.ts — requestId default to 0n (line ~1495)
**Issue:** If event not found, requestId defaults to 0n causing silent failures
**Fix:** Throw error instead of defaulting. NEEDS FIX.

## Summary
- ALREADY FIXED: #1 (accepted risk), #2, #3, #4, #7 (accepted preview)
- NEEDS FIX: #5/#6 (BigInt precision in rewards), #8 (VRF requestId default)
