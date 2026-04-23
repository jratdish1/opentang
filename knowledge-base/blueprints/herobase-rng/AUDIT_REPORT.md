# HERO RNG Modules — Codex Security Audit Report

**Date:** 2026-04-23 14:05:50
**Auditor:** GPT-4.1-mini (via Manus Proxy)
**Modules Audited:** 13

## Summary

- **Critical Issues:** 1
- **High Issues:** 2
- **Modules Audited:** 13

---

## RNG Engine (shared utility)

Audit Report: RNG Engine (shared utility)

---

### 1. SECURITY

**Issue 1**  
- Severity: LOW  
- Location: `generateRandom` function, line where `seedBigInt` is computed  
- Description: The code converts the keccak256 hash string (`seed`) directly to BigInt via `BigInt(seed)`. However, `seed` is a hex string with "0x" prefix, and `BigInt` can parse hex strings, but if the string is malformed or empty, it will throw. There's no explicit try-catch or validation here. This could cause runtime errors if the entropy source is invalid or corrupted.  
- Fix: Add validation or try-catch around `BigInt(seed)` conversion to handle unexpected input gracefully.

**Issue 2**  
- Severity: INFO  
- Location: `generateRandom` function  
- Description: The RNG is off-chain and depends on the latest block hash + salt + timestamp. This is suitable for low-stakes randomness but is vulnerable to front-running or miner manipulation if used for high-stakes decisions. The comments mention T2/T3 tiers for on-chain commit-reveal and Chainlink VRF, which is good.  
- Fix: Ensure that high-stakes randomness uses T2 or T3 tiers. For T1, document the limitations clearly.

**Issue 3**  
- Severity: LOW  
- Location: `weightedRandom` function  
- Description: The function uses floating-point weights and sums them. Floating-point addition can introduce precision errors, potentially biasing the selection if weights are very large or have many decimal places.  
- Fix: Consider using integers for weights or a fixed-point representation to avoid floating-point precision issues.

**Issue 4**  
- Severity: LOW  
- Location: `selectMultipleWinners` function  
- Description: The function uses a loop with a maxAttempts limit to avoid infinite loops when selecting unique winners. However, if the pool size is small and winnerCount is close to poolSize, this could still be inefficient. Also, the function uses sequential awaits inside the loop, which can be slow.  
- Fix: Consider shuffling the pool or using a more efficient algorithm (e.g., Fisher-Yates shuffle) to select unique winners without retries.

---

### 2. LOGIC

**Issue 5**  
- Severity: MEDIUM  
- Location: `generateRandom` function, seed calculation and modulo operation  
- Description: The code uses `ethers.solidityPackedKeccak256` with inputs `[blockHash, salt, timestamp]` typed as `['bytes32', 'string', 'string']`. The `blockHash` is a hex string, but `bytes32` expects a 32-byte value. If `blockHash` is not properly formatted or padded, this could cause unexpected behavior. Also, the timestamp is included as a string, which changes every call, potentially making the RNG non-deterministic for the same block and salt.  
- Fix: Ensure `blockHash` is a valid 32-byte hex string. Consider whether including the timestamp (which changes every call) is desirable for determinism. If deterministic RNG is needed, remove timestamp or fix it to block timestamp.

**Issue 6**  
- Severity: LOW  
- Location: `weightedRandom` function, selection loop  
- Description: The loop uses `rng.value < cumulative` to select the item. Since `rng.value` is in `[0, totalWeight)`, this is correct. However, if floating-point weights cause precision errors, the last item might never be selected.  
- Fix: Use integer weights or carefully handle floating-point sums.

**Issue 7**  
- Severity: LOW  
- Location: `selectMultipleWinners` function  
- Description: The function uses `winners.length <= i` to check if a winner was selected after attempts. This is correct but could be clearer as `winners.length === i`.  
- Fix: Change to `winners.length === i` for clarity.

---

### 3. BEST PRACTICES

**Issue 8**  
- Severity: MEDIUM  
- Location: `generateRandom` function  
- Description: The function throws generic `Error` with string messages. It would be better to use custom error classes or error codes for better error handling downstream.  
- Fix: Define custom error classes or error codes for input validation errors.

**Issue 9**  
- Severity: LOW  
- Location: `weightedRandom` function  
- Description: The function validates weights in a for-loop but does not DRY the validation logic (similar validation is done in other places).  
- Fix: Extract weight validation into a helper function.

**Issue 10**  
- Severity: LOW  
- Location: `selectMultipleWinners` function  
- Description: The function uses sequential awaits inside a for-loop, which can be slow. The comment mentions Promise.all but the code does not implement parallelism.  
- Fix: Implement parallel RNG calls with Promise.all where possible, or document why sequential calls are necessary.

---

### 4. CRYPTO-SPECIFIC

**Issue 11**  
- Severity: HIGH  
- Location: `generateRandom` function, use of timestamp in seed  
- Description: Including the current ISO timestamp in the seed makes the RNG non-deterministic for the same block hash and salt. This breaks the "provably fair" property because the same inputs should produce the same output for verification.  
- Fix: Remove `timestamp` from the seed input. Instead, use block timestamp or block number for determinism.

**Issue 12**  
- Severity: INFO  
- Location: `generateRandom` function  
- Description: The RNG uses block hash as entropy, but block hashes can be manipulated by miners within a limited range. For low-stakes use, this is acceptable, but for higher stakes, commit-reveal or VRF should be used.  
- Fix: Use T2 or T3 tiers for high-stakes randomness.

**Issue 13**  
- Severity: LOW  
- Location: `weightedRandom` function  
- Description: No explicit handling of zero or dead addresses in weighted items (if items are addresses). This is outside the scope of RNG but relevant if used for token distributions.  
- Fix: Validate items before passing to RNG functions.

---

### 5. REACT (Not applicable)

- The module is a shared utility, no React components or hooks are present. No React-specific issues detected.

---

### Summary

The RNG Engine code is generally well-structured and follows good practices. The main concerns are:

- **High severity:** Inclusion of a non-deterministic timestamp in the RNG seed breaks provable fairness. Remove or replace with deterministic block timestamp.  
- **Medium severity:** Use of generic errors and sequential async calls could be improved.  
- **Low severity:** Floating-point weights may cause subtle bias; consider integer weights.  
- **Info:** Off-chain RNG is suitable only for low-stakes randomness; higher tiers are planned.

---

### Suggested Fixes (Summary)

```typescript
// In generateRandom:
// 1. Remove `timestamp` from seed input to ensure determinism
const seed = ethers.solidityPackedKeccak256(
  ['bytes32', 'string'],
  [

---

## Email Notification Module

Audit Report: HERO DAO Email Notification Module (TypeScript)

---

### 1. SECURITY

**Issue 1**  
- Severity: LOW  
- Location: `escapeHtml` and `escapeText` functions  
- Description: The module uses custom HTML escaping and tag stripping functions. While these cover basic cases, they may not handle all edge cases or complex HTML inputs, potentially leaving room for XSS if input is malformed or crafted specially.  
- Fix: Use a well-tested, battle-hardened library for HTML sanitization (e.g., DOMPurify or sanitize-html) instead of custom regex/string replacements to ensure comprehensive XSS protection.

**Issue 2**  
- Severity: LOW  
- Location: Email sending logic (not fully shown)  
- Description: The SMTP transport disables TLS certificate verification (`rejectUnauthorized: false`) for ProtonMail Bridge on localhost. While justified in comments, if this config is reused elsewhere or exposed to non-localhost connections, it could allow MITM attacks.  
- Fix: Ensure this config is strictly limited to localhost connections only. Add runtime checks or environment-based toggles to prevent accidental use in production environments with external hosts.

**Issue 3**  
- Severity: INFO  
- Location: Rate limiting (`checkRateLimit` and `recordEmailSent`)  
- Description: Rate limiting is implemented in-memory using a simple timestamp array. This works for a single instance but will not scale or persist across server restarts or multiple instances.  
- Fix: For production, consider using a distributed rate limiter (e.g., Redis-based) to enforce limits reliably.

---

### 2. LOGIC

**Issue 4**  
- Severity: MEDIUM  
- Location: `emailLog` array manipulation in `checkRateLimit`  
- Description: The rate limiting uses `emailLog.shift()` inside a while loop to remove old timestamps. This is O(n) per shift and could be inefficient if many emails are sent. Also, no concurrency control is present, so race conditions could occur if multiple sends happen simultaneously.  
- Fix: Use a more efficient data structure like a queue or ring buffer. Add mutex/lock or atomic operations if concurrency is possible.

**Issue 5**  
- Severity: LOW  
- Location: `percentage.toFixed(1)` in `formatNomineesText` and `formatNomineesHtml`  
- Description: `percentage` is a number but could be a floating-point with rounding errors. No validation ensures percentages sum to 100 or are within 0-100.  
- Fix: Validate input percentages before formatting. Consider using BigInt or fixed-point libraries if high precision is required.

---

### 3. BEST PRACTICES

**Issue 6**  
- Severity: LOW  
- Location: `escapeText` function  
- Description: The regex `<[^>]*>` used to strip HTML tags is simplistic and may remove content incorrectly if tags are malformed or nested.  
- Fix: Use a proper HTML parser or sanitizer library to strip tags safely.

**Issue 7**  
- Severity: LOW  
- Location: Error handling in email sending (not shown)  
- Description: The module does not show error handling for nodemailer send failures or transport creation errors.  
- Fix: Add try/catch blocks and proper error logging or retry mechanisms around email sending.

**Issue 8**  
- Severity: INFO  
- Location: `escapeHtml` and `escapeText` functions  
- Description: Both functions are similar in purpose but differ in implementation. This is acceptable but could be documented better to clarify their distinct use cases (HTML vs plain text).  
- Fix: Add comments clarifying when to use each function.

---

### 4. CRYPTO-SPECIFIC

**Issue 9**  
- Severity: INFO  
- Location: `DAOResultEmail.selectionMethod` and RNG fallback display  
- Description: RNG seed is displayed as-is without validation or formatting. No cryptographic verification is performed here (expected, as this is a notification module).  
- Fix: Ensure RNG verification is done on-chain or in backend logic. The email module should only display verified data.

**Issue 10**  
- Severity: INFO  
- Location: No handling of dead addresses or token burn info in email data  
- Description: The module does not handle or mention dead addresses or token burns, which may be relevant in treasury allocation context.  
- Fix: If relevant, include dead address handling or mention in email content.

---

### 5. REACT (Not applicable)

- The module is a backend email notification module, no React components or hooks are present. No React-specific issues.

---

### Summary

The module is generally well-written, with good separation of concerns and basic security measures. The main concerns are:

- Use of custom HTML escaping and tag stripping instead of robust libraries (LOW severity).  
- In-memory rate limiting without concurrency control or persistence (MEDIUM severity).  
- Potential inefficiency in rate limiting array manipulation (LOW severity).  
- Lack of error handling around email sending (LOW severity).  
- TLS verification disabled for localhost SMTP transport (LOW severity, but acceptable with safeguards).

No critical security or logic flaws were found. The module is safe for its intended use with minor improvements recommended.

---

If you want, I can review the email sending logic or React UI components next.

---

## DAO RNG Fallback

Below is a thorough audit of the provided TypeScript/React DAO RNG Fallback module code for the HERO token ecosystem on PulseChain/BASE.

---

### 1. SECURITY

**Issue 1**  
- **Severity:** HIGH  
- **Location:** `castVote` function  
- **Description:** Wallet impersonation risk due to lack of signature verification. The `voter` address is accepted as a string parameter without cryptographic proof that the caller owns the wallet. This allows anyone to submit votes on behalf of others.  
- **Fix:** Integrate on-chain signature verification or require signed messages to prove ownership of the `voter` address before accepting votes.

**Issue 2**  
- **Severity:** LOW  
- **Location:** `castVote` function, voter address validation  
- **Description:** The regex validation for Ethereum addresses is basic and does not enforce checksum (EIP-55). While not critical, this can allow invalid or mistyped addresses.  
- **Fix:** Use `ethers.utils.isAddress(voter)` for robust address validation.

**Issue 3**  
- **Severity:** INFO  
- **Location:** `finalizeProposal` function, RNG fallback  
- **Description:** RNG fairness depends on the external `generateRandom` function. If this RNG is not cryptographically secure or can be influenced by the salt or environment, the fallback selection can be manipulated.  
- **Fix:** Ensure `generateRandom` uses a secure, verifiable randomness source (e.g., Chainlink VRF or on-chain commit-reveal). Document and audit `generateRandom` separately.

**Issue 4**  
- **Severity:** LOW  
- **Location:** Email sending (`sendDAOResultEmail`)  
- **Description:** Potential injection or XSS risk if nominee names or other user-controlled strings are included in emails without sanitization.  
- **Fix:** Sanitize all user inputs before including them in email content. Use templating libraries that auto-escape content.

---

### 2. LOGIC

**Issue 5**  
- **Severity:** MEDIUM  
- **Location:** `tallyVotes` function, percentage calculation  
- **Description:** Percentage calculation uses integer division with BigInt and then converts to Number. This can cause rounding errors or loss of precision in edge cases.  
- **Fix:** Consider using a fixed-point decimal library or carefully document acceptable rounding. Alternatively, calculate percentages as floating-point after converting BigInt to Number if safe.

**Issue 6**  
- **Severity:** LOW  
- **Location:** `finalizeProposal` function, winner selection when quorum met  
- **Description:** The initial `maxWeight` is set to 0n and `winnerId` to the first nominee. If all nominees have zero votes, the first nominee wins by default, which may be unintended.  
- **Fix:** Explicitly handle the case where total votes are zero (e.g., treat as quorum not met or no winner).

**Issue 7**  
- **Severity:** LOW  
- **Location:** `createProposal` function, voting window  
- **Description:** Voting window is hardcoded to 30 days from now, ignoring the quarterly schedule constants defined above. This could cause mismatch between expected quarter dates and actual voting periods.  
- **Fix:** Use `QUARTERLY_SCHEDULE` to set `votingOpens` and `votingCloses` based on the quarter and current year for consistency.

**Issue 8**  
- **Severity:** LOW  
- **Location:** `checkQuorum` function  
- **Description:** The quorum check uses integer division which can cause off-by-one errors in borderline cases. Also, the quorum threshold is a percentage but stored as an integer, which may cause confusion.  
- **Fix:** Use precise decimal math or clarify documentation. Consider storing quorum as a decimal fraction (e.g., 0.1 for 10%).

---

### 3. BEST PRACTICES

**Issue 9**  
- **Severity:** MEDIUM  
- **Location:** `castVote` function  
- **Description:** The function mutates the `proposal.votes` array directly, which can cause issues in React state management or immutable data patterns.  
- **Fix:** Return a new proposal object or use immutable update patterns to avoid side effects.

**Issue 10**  
- **Severity:** LOW  
- **Location:** `finalizeProposal` function  
- **Description:** Partial code truncation at the end suggests incomplete error handling or missing final steps (e.g., updating proposal status, sending email, persisting results).  
- **Fix:** Ensure full implementation includes proper error handling, state updates, and side effects.

**Issue 11**  
- **Severity:** INFO  
- **Location:** General  
- **Description:** No input validation on `treasuryAmount` and `treasuryUsdValue` strings, which could lead to injection or formatting errors downstream.  
- **Fix:** Validate and sanitize these inputs, or use numeric types if possible.

---

### 4. CRYPTO-SPECIFIC

**Issue 12**  
- **Severity:** MEDIUM  
- **Location:** `finalizeProposal` RNG fallback winner selection  
- **Description:** The RNG fallback uses the length of nominees as the upper bound but does not check if `rngProof.value` is within bounds, risking out-of-range errors.  
- **Fix:** Validate `rngProof.value` is >= 0 and < `proposal.nominees.length` before indexing.

**Issue 13**  
- **Severity:** LOW  
- **Location:** Constants `DEAD_ADDRESS` and `ZERO_ADDRESS`  
- **Description:** Dead address is defined but never used. If used for treasury disbursement, ensure tokens sent to dead address are irrecoverable.  
- **Fix:** Confirm usage or remove unused constants.

---

### 5. REACT-SPECIFIC

**Issue 14**  
- **Severity:** INFO  
- **Location:** General (no React components shown)  
- **Description:** No React hooks or components are present in the snippet, so React-specific issues like memory leaks or stale closures cannot be assessed here.  
- **Fix:** N/A for this module.

---

### Summary

The module is generally well-structured and clear, but the main security concern is the lack of cryptographic verification of voter identity, which is critical in a token-weighted voting system. RNG fallback depends on external RNG quality and should be audited separately. Minor logic and best practice improvements can enhance robustness and maintainability.

---

If you want, I can review the rest of the truncated code or the `generateRandom` and `sendDAOResultEmail` implementations for a more complete audit.

---

## DAO Proposals UI

Audit Report: DAO Proposals UI (TypeScript/React)

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `NomineeCard` component, `nominee.website` anchor tag  
  **Description:** External URLs are rendered directly from nominee.website without validation. Although `rel="noopener noreferrer"` and `target="_blank"` are used (good), there is no validation or sanitization of the URL, which could lead to XSS if malicious URLs are injected.  
  **Fix:** Validate and sanitize URLs before rendering. Use a whitelist or URL parser to ensure only valid HTTP/HTTPS URLs are allowed.

- **Severity:** INFO  
  **Location:** `handleVote` function (incomplete)  
  **Description:** Wallet connection check is done before voting, but no explicit wallet impersonation protection or signature verification is shown (likely handled off-chain).  
  **Fix:** Ensure backend verifies wallet signatures and prevents replay attacks. Frontend should also handle wallet connection errors gracefully.

- **Severity:** INFO  
  **Location:** RNG Fallback display (`RNGFallbackBadge`)  
  **Description:** RNG fairness depends on on-chain randomness, but no RNG logic is implemented here (UI only).  
  **Fix:** Confirm on-chain RNG is provably fair and that proofHash/blockNumber are verified on backend.

---

### 2. LOGIC

- **Severity:** LOW  
  **Location:** `QuorumBar` component, calculation of `percentage`  
  **Description:** `percentage` is calculated as `(current / threshold) * 100` but `current` and `threshold` are numbers representing percentages (e.g., 3.2 and 10). This is correct but could be confusing if units change.  
  **Fix:** Add comments clarifying units or rename variables to `currentPercent` and `thresholdPercent` for clarity.

- **Severity:** LOW  
  **Location:** `useCountdown` hook  
  **Description:** Uses `Date.now()` (ms) and targetTimestamp (ms) correctly. No off-by-one or overflow issues detected.  
  **Fix:** None needed.

- **Severity:** INFO  
  **Location:** `weight` field in `Nominee` interface  
  **Description:** `weight` is stored as a string representing a BigInt but no BigInt operations are shown here.  
  **Fix:** Ensure all weight calculations use BigInt or a safe big number library to avoid overflow or precision loss.

---

### 3. BEST PRACTICES

- **Severity:** MEDIUM  
  **Location:** `handleVote` function (incomplete)  
  **Description:** No error handling or user feedback on vote submission or wallet connection failure.  
  **Fix:** Implement try/catch around async calls, show loading and error states, and confirm vote success/failure to user.

- **Severity:** LOW  
  **Location:** `useCountdown` hook  
  **Description:** Interval runs every 1000ms without checking if countdown is already zero, causing unnecessary updates after countdown ends.  
  **Fix:** Clear interval when countdown reaches zero to avoid unnecessary renders.

- **Severity:** LOW  
  **Location:** `NomineeCard` component  
  **Description:** `onVote` callback is recreated inline in JSX, which can cause unnecessary re-renders.  
  **Fix:** Use `useCallback` in parent component to memoize `onVote` handler.

- **Severity:** INFO  
  **Location:** `QuorumBar` and other components  
  **Description:** Some repeated inline styles and classNames could be extracted to constants or CSS modules for DRY and maintainability.  
  **Fix:** Refactor styles into reusable classes or styled components.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** RNG Fallback display  
  **Description:** RNG fallback is only indicated visually; no verification or interaction with on-chain RNG proof is shown.  
  **Fix:** Ensure backend verifies RNG proof and that UI reflects verification status.

- **Severity:** INFO  
  **Location:** `Nominee.weight` and vote counts  
  **Description:** Weight and votes are displayed but no calculation logic is shown here. Ensure weight calculations are accurate and consistent with on-chain data.  
  **Fix:** Confirm weight calculations use BigInt safely and votes are tallied correctly.

- **Severity:** INFO  
  **Location:** Dead address handling  
  **Description:** No mention or handling of dead addresses (e.g., zero address) in nominees or votes.  
  **Fix:** Validate nominee IDs and addresses to exclude dead addresses.

---

### 5. REACT

- **Severity:** LOW  
  **Location:** `useCountdown` hook  
  **Description:** Interval is properly cleared on unmount, no memory leaks detected.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** `useMemo` for `activeProposal`  
  **Description:** Properly memoized to avoid unnecessary recalculations.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** `NomineeCard` component  
  **Description:** No obvious stale closure issues; props are passed correctly.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** `RNGFallbackBadge` component  
  **Description:** Uses conditional rendering and truncation properly to avoid layout shifts.  
  **Fix:** None needed.

---

### Summary

The code is generally clean and well-structured with good React practices and UI clarity. The main concerns are:

- Lack of URL validation for external links (XSS risk, LOW severity).  
- Incomplete vote handling logic with missing error handling and user feedback (MEDIUM severity).  
- Minor performance improvements possible in countdown hook and event handler memoization.  
- Crypto-specific logic (RNG fairness, weight calculations) is not implemented here; ensure backend handles these securely.

No critical security or logic flaws detected in this UI module.

---

If you want, I can review the backend or smart contract code for deeper crypto security analysis.

---

## NFT Trait Randomness Engine

Audit Report: NFT Trait Randomness Engine (TypeScript/React)

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `generateTrait()` function  
  **Description:** RNG relies on `generateRandom()` which is stated to use ON-CHAIN block hash RNG (T1 tier). Assuming `generateRandom()` is implemented securely on-chain, RNG manipulation risk is low. However, the salt construction (`nft-${tokenId}-${category.name}`) is predictable and could be front-run if mint transactions are public before inclusion.  
  **Fix:** Consider adding a user-provided secret or a blockhash from a future block (commit-reveal scheme) to salt to reduce front-running risk. Alternatively, ensure minting contract uses commit-reveal or VRF for final randomness.

- **Severity:** INFO  
  **Location:** `generateTrait()` and `generateNFTTraits()` input validation  
  **Description:** Token ID is validated to be a non-negative integer, but no validation on `chain` parameter beyond type hint.  
  **Fix:** Add runtime validation or use TypeScript union types strictly to prevent invalid chain values.

- **Severity:** LOW  
  **Location:** `generateTrait()` error handling  
  **Description:** Throws error if trait selection fails (should never happen if weights sum correctly). This is good defensive programming.  
  **Fix:** None needed.

- **Severity:** INFO  
  **Location:** React usage (not shown fully)  
  **Description:** No direct wallet interaction or user input handling in this module, so wallet impersonation, XSS, or injection risks are minimal here.  
  **Fix:** Ensure UI components using this module sanitize any user inputs or external data.

---

### 2. LOGIC

- **Severity:** LOW  
  **Location:** `generateTrait()` cumulative weight loop  
  **Description:** The loop uses `< cumulative` comparison which is correct to avoid off-by-one errors. The fallback error if no trait is selected is good.  
  **Fix:** None.

- **Severity:** LOW  
  **Location:** Weight summation in `generateTrait()`  
  **Description:** Uses `reduce` to sum weights as numbers. Since weights are small integers, no overflow risk. If weights were large, consider BigInt.  
  **Fix:** None needed.

- **Severity:** INFO  
  **Location:** `generateNFTTraits()` parallel calls  
  **Description:** Uses `Promise.all` to generate traits in parallel, which is efficient and safe since categories are independent.  
  **Fix:** None.

---

### 3. BEST PRACTICES

- **Severity:** MEDIUM  
  **Location:** `generateTrait()` and `generateNFTTraits()`  
  **Description:** Input validation is good but duplicated in both functions for tokenId. Could DRY by extracting validation helper.  
  **Fix:** Extract `validateTokenId(tokenId: number)` helper function to reuse.

- **Severity:** LOW  
  **Location:** Error messages  
  **Description:** Error messages are descriptive, aiding debugging.  
  **Fix:** None.

- **Severity:** INFO  
  **Location:** Comments and documentation  
  **Description:** Clear distinction between preview and production RNG is well documented.  
  **Fix:** None.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** HIGH  
  **Location:** RNG salt construction in `generateTrait()`  
  **Description:** Salt is deterministic and predictable (`nft-${tokenId}-${category.name}`), which may allow front-running or manipulation if mint transactions are visible before block finalization. This weakens RNG fairness.  
  **Fix:** Incorporate unpredictable entropy such as a future block hash, user-provided secret, or use a commit-reveal scheme on-chain to ensure fairness.

- **Severity:** INFO  
  **Location:** Weight accuracy in `HERO_TRAIT_CATEGORIES`  
  **Description:** Weights per option are consistent with rarity tiers, but total weights per category vary widely (e.g., Background category has many options with weights summing > 300). This is acceptable if intentional, but total weight sums should be documented or normalized if needed.  
  **Fix:** Optionally validate total weights per category or normalize weights to a fixed scale.

- **Severity:** INFO  
  **Location:** Dead address handling  
  **Description:** No direct token transfer or burn logic here, so no dead address handling concerns.  
  **Fix:** None.

---

### 5. REACT

- **Severity:** INFO  
  **Location:** Not shown (React components)  
  **Description:** This module is pure logic without React hooks or state, so no memory leaks, stale closures, or unnecessary re-renders here.  
  **Fix:** Ensure UI components using this module handle async calls properly and clean up effects.

---

### Summary

This module is well-written, with clear separation between preview and production RNG, good input validation, and proper error handling. The main concern is the predictability of the RNG salt which could enable front-running or manipulation in a blockchain environment. Incorporating additional entropy or commit-reveal schemes is recommended to strengthen RNG fairness.

No critical security or logic bugs found. Minor improvements in DRY and input validation can be made.

---

If you want, I can also review the truncated part or related UI components for React-specific issues.

---

## NFT Mint UI

Audit Report: NFT Mint UI (TypeScript/React)

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `getPreviewTraits` function  
  **Description:** The preview RNG uses a simple hash function (`simpleHash`) which is deterministic and client-side only. This is explicitly marked as preview-only and not used for actual minting. No direct security risk here, but ensure this is never used for on-chain randomness or minting logic.  
  **Fix:** None needed; comment clarifies usage. Just ensure on-chain mint uses secure randomness.

- **Severity:** LOW  
  **Location:** `handleMint` function  
  **Description:** The mint function simulates minting without wallet interaction or signature verification. In a real environment, wallet impersonation or front-running could occur if minting is not properly authenticated on-chain.  
  **Fix:** Integrate proper wallet connection, signature verification, and on-chain minting logic with nonce/reentrancy guards in smart contracts.

- **Severity:** LOW  
  **Location:** JSX rendering (TraitCard component)  
  **Description:** No user input is directly injected into HTML; all text is rendered safely. No XSS or injection vectors detected.  
  **Fix:** None.

---

### 2. LOGIC

- **Severity:** MEDIUM  
  **Location:** `getPreviewTraits` function  
  **Description:** The weighted random selection uses modulo with totalWeight and cumulative sum to pick a trait. This is correct, but if `totalWeight` is zero (e.g., empty options array), it will cause division/modulo by zero or unexpected behavior.  
  **Fix:** Add validation to ensure `cat.options` is non-empty and `totalWeight > 0` before modulo operation. Throw or handle empty categories gracefully.

- **Severity:** LOW  
  **Location:** `RarityScoreDisplay` component  
  **Description:** The rarity score calculation uses `(100 - RARITY_WEIGHTS[t.rarity])`. This assumes `RARITY_WEIGHTS` values are less than 100 and consistent. If weights change or are misconfigured, score calculation may be off.  
  **Fix:** Validate `RARITY_WEIGHTS` values and consider documenting expected ranges.

- **Severity:** INFO  
  **Location:** `handleRandomize` function  
  **Description:** Random previewId is generated with `Math.random() * 10000 + 1`. This is fine for preview but not cryptographically secure.  
  **Fix:** None needed for preview.

---

### 3. BEST PRACTICES

- **Severity:** LOW  
  **Location:** `handleMint` function  
  **Description:** No error handling around the simulated mint process (e.g., promise rejection).  
  **Fix:** Wrap async logic in try/catch and handle errors gracefully, e.g., show user feedback.

- **Severity:** LOW  
  **Location:** `NFTMint` component  
  **Description:** State updates for `mintedNFTs` use functional update form, which is good. However, no input validation on `previewId` or traits before minting.  
  **Fix:** Add validation to ensure `previewId` and `traits` are valid before minting.

- **Severity:** INFO  
  **Location:** JSX  
  **Description:** Some repeated className strings could be extracted to constants or utility functions to improve DRY and readability.  
  **Fix:** Refactor repeated Tailwind classes into variables or helper functions.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** Comments and design  
  **Description:** The preview RNG is deterministic and client-side only, which is good to avoid false expectations. The actual mint uses on-chain randomness (block hash), which is appropriate.  
  **Fix:** Ensure on-chain randomness is implemented securely in smart contracts (outside scope here).

- **Severity:** LOW  
  **Location:** Trait selection logic  
  **Description:** The weighted random selection is correct, but no explicit handling of "dead" or null traits. If a category has no valid traits, the function throws.  
  **Fix:** Consider fallback traits or default handling for empty categories.

---

### 5. REACT

- **Severity:** LOW  
  **Location:** `useEffect` in `NFTMint` component  
  **Description:** The timeout for auto-reveal is properly cleared on unmount, preventing memory leaks.  
  **Fix:** None.

- **Severity:** LOW  
  **Location:** `handleMint` function  
  **Description:** `handleMint` depends on `traits` and `previewId` in dependencies, which is correct to avoid stale closures.  
  **Fix:** None.

- **Severity:** INFO  
  **Location:** `TraitCard` component  
  **Description:** The inline style for animation delay is recalculated on every render. Could be memoized if performance becomes an issue.  
  **Fix:** Use `useMemo` or move style calculation outside render if needed.

- **Severity:** INFO  
  **Location:** `NFTMint` component  
  **Description:** No obvious unnecessary re-renders detected; state updates are minimal and scoped.  
  **Fix:** None.

---

### Summary

The code is generally clean, well-structured, and follows good practices. The main concerns are:

- Defensive checks for empty trait categories and zero total weights in `getPreviewTraits`.
- Adding error handling in async mint simulation.
- Ensuring on-chain minting logic (outside this UI code) properly handles wallet authentication and randomness.

No critical security or logic flaws found in this UI module.

---

If you want, I can review the full minting smart contract or backend logic for deeper crypto security analysis.

---

## Raffle/Giveaway Engine

Here is the detailed audit of the provided Raffle/Giveaway Engine TypeScript code:

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `enterRaffle` function, wallet address validation  
  **Description:** Wallet address format is validated with a regex, but no checksum validation (EIP-55) is performed. This could allow invalid or mistyped addresses to enter.  
  **Fix:** Use a library like `ethers.js` to validate and checksum wallet addresses to prevent wallet impersonation or invalid entries.

- **Severity:** INFO  
  **Location:** `drawRaffleWinners` function, RNG usage  
  **Description:** The RNG is offloaded to an external `selectMultipleWinners` function with on-chain RNG. Assuming that function is secure, no direct RNG manipulation is visible here. However, the salt is deterministic (`raffle-${raffle.id}-draw`), which could be front-run if the draw is triggered on-chain or publicly.  
  **Fix:** Ensure the RNG source and salt incorporate unpredictable on-chain data (blockhash, timestamp) and that the draw is triggered in a way that prevents front-running (e.g., commit-reveal or VRF).

- **Severity:** LOW  
  **Location:** `enterRaffle` function  
  **Description:** No rate limiting or anti-bot measures on entries. A single wallet can only enter once, but multiple wallets controlled by the same user could spam entries.  
  **Fix:** Consider adding captchas or off-chain verification if relevant, or limit entries per IP or other heuristics.

- **Severity:** LOW  
  **Location:** General (React context not shown)  
  **Description:** No direct XSS or injection vulnerabilities in this backend logic. However, if any of these strings (e.g., `title`, `description`, `prize`) are rendered in React without sanitization, XSS could occur.  
  **Fix:** Sanitize or escape user-generated content before rendering in React components.

---

### 2. LOGIC

- **Severity:** MEDIUM  
  **Location:** `enterRaffle` function, maxEntries check  
  **Description:** The check `raffle.entries.length >= raffle.maxEntries` is done before pushing the new entry, which is correct. No off-by-one error here.  
  **Fix:** None needed.

- **Severity:** MEDIUM  
  **Location:** `drawRaffleWinners` function, raffle status update  
  **Description:** The function sets `raffle.status = 'drawing'` and then immediately to `'completed'` after drawing winners. If an error occurs between these steps, the raffle could be stuck in 'drawing' or inconsistent state.  
  **Fix:** Use try/catch to ensure status is reverted or set to a safe state on failure.

- **Severity:** LOW  
  **Location:** `drawRaffleWinners` function, `proofs[0]` usage  
  **Description:** The code assumes `proofs[0]` exists for blockNumber and blockHash. If `proofs` is empty, this will fallback to 0 or empty string, which might be misleading.  
  **Fix:** Add validation that `proofs` is non-empty before accessing `proofs[0]`.

- **Severity:** LOW  
  **Location:** `enterRaffle` function, duplicate entry check  
  **Description:** Duplicate check uses `.find` with `.toLowerCase()` on wallets, which is good. No race condition here since this is synchronous.  
  **Fix:** None needed.

- **Severity:** INFO  
  **Location:** `createRaffle` function  
  **Description:** No validation on `maxEntries` or `winnerCount` upper bounds (e.g., winnerCount > maxEntries).  
  **Fix:** Add validation to ensure `winnerCount <= maxEntries` if maxEntries > 0.

---

### 3. BEST PRACTICES

- **Severity:** LOW  
  **Location:** `enterRaffle` function  
  **Description:** The function mutates the passed `raffle.entries` array directly. This could cause issues if the raffle object is managed in React state or immutable contexts.  
  **Fix:** Return a new raffle object or entries array to avoid mutation side effects.

- **Severity:** LOW  
  **Location:** `drawRaffleWinners` function  
  **Description:** The function mutates the raffle object directly (status, winners, drawTimestamp). This could cause stale closures or re-render issues in React if raffle is state.  
  **Fix:** Consider returning a new raffle object or use state management patterns to update raffle immutably.

- **Severity:** LOW  
  **Location:** `checkAndDrawExpiredRaffles` function  
  **Description:** Uses `Promise.all` to draw multiple raffles in parallel, which is good. However, no error handling if one draw fails.  
  **Fix:** Wrap each draw in try/catch to prevent one failure from blocking others.

- **Severity:** INFO  
  **Location:** General  
  **Description:** No explicit input validation on `RaffleConfig` fields like `title`, `description`, `prize` length or content.  
  **Fix:** Add validation or sanitization on these fields to prevent malformed data.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** MEDIUM  
  **Location:** `drawRaffleWinners` function, RNG salt  
  **Description:** The salt is deterministic and predictable. If the draw is triggered by anyone, front-running or manipulation could occur.  
  **Fix:** Incorporate unpredictable on-chain data (blockhash, timestamp) into salt and ensure draw is triggered securely.

- **Severity:** LOW  
  **Location:** `enterRaffle` function, heroBalance check  
  **Description:** Uses `bigint` for heroBalance, which is good. No integer overflow issues visible.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** General  
  **Description:** No explicit handling of dead addresses (e.g., 0x0) in entries or winners.  
  **Fix:** Add validation to reject dead or burn addresses as entries or winners.

---

### 5. REACT

- **Severity:** LOW  
  **Location:** General (no React components shown)  
  **Description:** No React components or hooks shown, so no direct memory leaks or stale closures visible here. However, mutating raffle objects directly could cause stale closures or unnecessary re-renders if raffle is stored in React state.  
  **Fix:** Use immutable updates and React state setters to avoid stale closures and re-render issues.

---

# Summary of Issues

| Severity | Location                 | Description                                    | Fix Summary                                      |
|----------|--------------------------|------------------------------------------------|-------------------------------------------------|
| LOW      | `enterRaffle` wallet validation | No EIP-55 checksum validation on wallet addresses | Use ethers.js for wallet validation             |
| INFO     | `drawRaffleWinners` RNG salt | Salt is deterministic, potential front-running | Use unpredictable on-chain data in salt         |
| MEDIUM   | `drawRaffleWinners` status update | No error handling, raffle could be stuck in '

---

## Giveaways UI

Audit Report for Giveaways UI (HERO token ecosystem)

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `handleEnter` function  
  **Description:** The `handleEnter` function updates raffle entries and `hasEntered` state locally without server-side verification or wallet signature validation. This could allow a malicious user to spoof entry status or manipulate entries count in the UI.  
  **Fix:** Integrate proper backend verification via tRPC mutation with wallet signature verification to confirm genuine entries. Do not trust client-side state alone for critical data like entries or participation status.

- **Severity:** LOW  
  **Location:** Winners Display links (`href` in `RaffleCard`)  
  **Description:** External links to block explorer use `target="_blank"` with `rel="noopener noreferrer"`, which is good. No XSS risk here as URLs are constructed from trusted block numbers.  
  **Fix:** No fix needed; implementation is correct.

- **Severity:** INFO  
  **Location:** No direct RNG or blockchain interaction in this UI code  
  **Description:** RNG fairness and reentrancy risks are not applicable here as this is purely UI code. Ensure backend smart contracts handle RNG and reentrancy securely.  
  **Fix:** N/A for this module.

---

### 2. LOGIC

- **Severity:** LOW  
  **Location:** `fillPercent` calculation in `RaffleCard`  
  **Description:** Division by zero is guarded by `raffle.maxEntries > 0`. No off-by-one or overflow issues detected.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** `handleEnter` function  
  **Description:** Incrementing `entries` by 1 locally without concurrency control could cause race conditions if multiple entries happen simultaneously.  
  **Fix:** Rely on backend atomic updates for entries count. Consider disabling the enter button immediately after click to prevent rapid multiple clicks.

- **Severity:** INFO  
  **Location:** `useCountdown` hook  
  **Description:** Countdown calculation uses `Date.now()` and simple math, no BigInt or overflow issues.  
  **Fix:** None.

---

### 3. BEST PRACTICES

- **Severity:** MEDIUM  
  **Location:** `handleEnter` function  
  **Description:** No error handling or feedback if wallet is not connected or if the backend call fails (currently a TODO).  
  **Fix:** Implement proper error handling and user feedback for wallet connection status and backend mutation results.

- **Severity:** LOW  
  **Location:** `useEffect` in `Giveaways` component for mock data  
  **Description:** Mock data is hardcoded in `useEffect`. This is acceptable for development but should be replaced with real data fetching logic.  
  **Fix:** Replace with actual tRPC queries and handle loading/error states.

- **Severity:** LOW  
  **Location:** `RaffleCard` component  
  **Description:** Some repeated JSX patterns (e.g., countdown display) could be extracted into smaller components for DRY and readability.  
  **Fix:** Refactor repeated UI blocks into reusable components.

- **Severity:** LOW  
  **Location:** `RaffleCard` winners list keys  
  **Description:** Using index `i` as key in winners list can cause rendering issues if list changes dynamically.  
  **Fix:** Use a unique identifier such as `w.wallet` or a combination of wallet + blockNumber as key.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** No direct blockchain interaction in this UI code  
  **Description:** Dead address handling, RNG fairness, and weight calculation are backend concerns. UI only displays data.  
  **Fix:** Ensure backend smart contracts and APIs handle these correctly.

---

### 5. REACT

- **Severity:** LOW  
  **Location:** `useCountdown` hook  
  **Description:** `setInterval` is properly cleared on unmount, preventing memory leaks.  
  **Fix:** None.

- **Severity:** LOW  
  **Location:** `handleEnter` callback  
  **Description:** `handleEnter` uses `useCallback` with `walletConnected` dependency, preventing stale closures.  
  **Fix:** None.

- **Severity:** LOW  
  **Location:** `Giveaways` component render  
  **Description:** Filtering raffles into `activeRaffles` and `upcomingRaffles` on every render could be optimized with `useMemo` if performance becomes an issue.  
  **Fix:** Use `useMemo` for filtered arrays if needed.

---

### Summary

The code is generally clean and well-structured for a React UI module. The main concerns are:

- Lack of backend integration and verification for raffle entry, which is critical for security and correctness.
- Minimal error handling and user feedback.
- Minor React best practices improvements (keys, DRY).

No critical security or logic bugs are present in this UI code. Ensure backend smart contracts and APIs handle all crypto-specific security and fairness aspects.

---

If you want, I can review the backend smart contract or API code for deeper crypto security analysis.

---

## Holder Rewards Engine

Here is the detailed audit of the provided `Holder Rewards Engine` TypeScript module:

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `createRewardRound` (line ~38)  
  **Description:** The exclusion wallet addresses are validated with a regex, but the code does not normalize addresses before validation (e.g., checksum case). This could allow invalid or mixed-case addresses slipping through.  
  **Fix:** Normalize addresses (e.g., to lowercase) before validation or use a robust Ethereum address validation library (like ethers.js `utils.isAddress`) to ensure correctness.

- **Severity:** LOW  
  **Location:** `processSnapshot` (line ~58)  
  **Description:** Wallet addresses are converted to lowercase for exclusion checks, but the `excludedWallets` array is populated with lowercase addresses only in `createRewardRound`. If any excluded addresses are added elsewhere without normalization, they may not be excluded properly.  
  **Fix:** Enforce consistent normalization (lowercase) on all wallet addresses stored in `excludedWallets` and when comparing.

- **Severity:** INFO  
  **Location:** `drawRewardWinners` (line ~81)  
  **Description:** RNG source is abstracted via `weightedRandom` with a salt and chain param, which is good. However, no explicit mention of how RNG fairness or manipulation resistance is ensured.  
  **Fix:** Ensure `weightedRandom` uses a verifiable on-chain or cryptographically secure RNG source with proof (e.g., VRF). Document or audit `weightedRandom` separately.

- **Severity:** INFO  
  **Location:** `drawRewardWinners` (line ~81)  
  **Description:** Front-running risk exists if the RNG seed (salt) or snapshot is predictable or manipulable by adversaries.  
  **Fix:** Use block hashes or other unpredictable on-chain data as part of the RNG seed. Consider delaying draws or using commit-reveal schemes.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~94)  
  **Description:** The reward amount per winner is a string and calculated as a fallback string expression (`round.rewardAmount / actualWinnerCount`) but not parsed or validated as a number. This could cause incorrect reward amounts or injection if used downstream.  
  **Fix:** Parse and validate reward amounts as BigInt or decimal numbers before use. Avoid string concatenation for numeric values.

- **Severity:** LOW  
  **Location:** General (all wallet inputs)  
  **Description:** No explicit input sanitization for wallet addresses beyond regex. While React is not shown here, if wallet addresses are rendered in UI, XSS risk exists if not escaped.  
  **Fix:** Always sanitize and escape wallet addresses before rendering in React components.

---

### 2. LOGIC

- **Severity:** MEDIUM  
  **Location:** `processSnapshot` (line ~66)  
  **Description:** Sorting logic is incorrect: `.sort((a, b) => (b.balance > a.balance ? 1 : -1))` does not handle equality and sorts ascending instead of descending by balance. This can cause off-by-one errors in top holder calculations and median.  
  **Fix:** Use `.sort((a, b) => (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0))` or simpler `.sort((a, b) => Number(b.balance - a.balance))` (with BigInt-aware comparator).

- **Severity:** MEDIUM  
  **Location:** `getRewardStats` (line ~117)  
  **Description:** Sorting for median uses `.sort((a, b) => (a.balance > b.balance ? 1 : -1))` which sorts ascending but does not handle equality properly. Also, median calculation uses `Math.floor(sorted.length / 2)` which is correct for odd counts but does not average middle two for even counts.  
  **Fix:** Fix sort comparator as above. For even number of holders, calculate median as average of two middle balances.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~85)  
  **Description:** Weight calculation uses `Number(h.balance / 1000000n)`. This truncates balances and may cause inaccurate weights for holders with balances < 1,000,000 HERO.  
  **Fix:** Use a more precise scaling or BigInt-aware weighted random function. Alternatively, scale balances to a fixed-point decimal or use a library that supports BigInt weights.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~90)  
  **Description:** `totalWeight` is calculated as sum of scaled down balances, but if all balances are below 1,000,000, totalWeight could be zero, leading to division by zero or zero selectionWeight.  
  **Fix:** Add a check to ensure totalWeight > 0, or adjust scaling factor to avoid zero weights.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~99)  
  **Description:** The loop excludes already selected wallets by filtering `weightedHolders` each iteration, which is O(n²) for large holder sets.  
  **Fix:** Consider a more efficient data structure or algorithm for exclusion, e.g., remove selected holders from weightedHolders array or use a priority queue.

---

### 3. BEST PRACTICES

- **Severity:** LOW  
  **Location:** `createRewardRound` (line ~38)  
  **Description:** `id` generation uses `Date.now()` which may cause collisions if multiple rounds created quickly.  
  **Fix:** Use UUID or a more robust unique ID generator.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~94)  
  **Description:** `rewardAmount` per winner is set as a string fallback expression, which is not calculated or validated.  
  **Fix:** Calculate `rewardPerWinner` as a numeric value during round creation or before drawing winners, and store it as a BigInt or decimal string.

- **Severity:** LOW  
  **Location:** `processSnapshot` (line ~66)  
  **Description:** The function mutates the passed `round` object directly. This is acceptable but could lead to side effects if not documented.  
  **Fix:** Consider returning a new updated round object or document mutation clearly.

- **Severity:** LOW  
  **Location:** `drawRewardWinners` (line ~81)  
  **Description:** Error messages are generic and do not include round ID or context, which could help debugging.  
  **Fix:** Include round ID or other context in error messages.

- **Severity:** LOW  
  **Location:** `getRewardStats` (line ~117)  
  **Description:** The function calculates `topHolderPercentage` as `holders[0].percentage` but if holders are not sorted descending, this may be incorrect.  
  **Fix:** Ensure holders are sorted descending by balance before accessing `holders[0]`.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** RNG usage in `drawRewardWinners`  
 

---

## Holder Rewards UI

Audit Report for Holder Rewards UI (TypeScript/React)

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `Connect Wallet` button onClick handler  
  **Description:** The wallet connection is mocked and sets `walletConnected` to true without actual wallet authentication or signature verification. This can lead to wallet impersonation in a real environment.  
  **Fix:** Integrate a proper wallet connection library (e.g., ethers.js, web3-react) and verify wallet ownership via signature challenge before setting eligibility or balance.

- **Severity:** LOW  
  **Location:** Display of `winners[].wallet` in table  
  **Description:** Wallet addresses are displayed directly without sanitization. Although React escapes content by default, if any HTML injection occurs in wallet strings, it could lead to XSS.  
  **Fix:** Ensure wallet addresses are validated and sanitized before rendering. Preferably, display only checksummed addresses or truncated versions.

- **Severity:** INFO  
  **Location:** RNG and winner selection logic (not present in UI code)  
  **Description:** RNG fairness and manipulation cannot be assessed here as the winner selection logic is off-chain or backend.  
  **Fix:** Ensure on-chain randomness or verifiable randomness sources are used in the backend.

---

### 2. LOGIC

- **Severity:** INFO  
  **Location:** `weight` display in winners table (`w.weight.toFixed(1)`)  
  **Description:** Weight is displayed as a percentage with one decimal place, but no indication if weight is a fraction or absolute number. Potential confusion if weight is not normalized.  
  **Fix:** Clarify weight calculation and ensure consistent units (e.g., percentage vs absolute weight).

- **Severity:** INFO  
  **Location:** `userBalance` state as string with commas ('125,000')  
  **Description:** Storing balances as formatted strings with commas can cause issues if used in calculations or comparisons.  
  **Fix:** Store balances as BigInt or number internally, format only for display.

- **Severity:** INFO  
  **Location:** Eligibility check logic (mocked)  
  **Description:** Eligibility is hardcoded to true on wallet connect, no actual balance check or threshold enforcement.  
  **Fix:** Implement real eligibility logic based on on-chain balance queries.

---

### 3. BEST PRACTICES

- **Severity:** MEDIUM  
  **Location:** `Connect Wallet` button onClick handler  
  **Description:** Inline anonymous function sets multiple states directly, mixing UI logic and state management.  
  **Fix:** Extract wallet connection logic into a separate handler function for clarity and easier testing.

- **Severity:** LOW  
  **Location:** `rounds` state initialization in `useEffect`  
  **Description:** Mock data is hardcoded inside `useEffect` without error handling or data fetching abstraction.  
  **Fix:** Abstract data fetching into a separate async function with error handling and loading states.

- **Severity:** LOW  
  **Location:** JSX in winners table  
  **Description:** The `key` prop for winners uses index (`key={i}`), which can cause rendering issues if winners array changes.  
  **Fix:** Use a unique identifier such as wallet address or proofHash as key.

- **Severity:** LOW  
  **Location:** JSX truncation in code snippet (last line incomplete)  
  **Description:** The last `<span>` tag for pending status is truncated (`</sp`), which will cause rendering errors.  
  **Fix:** Fix JSX syntax to properly close tags.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** Reward amount strings (e.g., '200,000 HERO')  
  **Description:** Reward amounts are strings with commas and token symbol, which are not suitable for arithmetic or on-chain interactions.  
  **Fix:** Store numeric reward amounts as BigInt or number in smallest units (e.g., wei), format for display only.

- **Severity:** INFO  
  **Location:** Dead address handling  
  **Description:** No explicit handling or filtering of dead addresses (e.g., 0x0 or burn addresses) in winners or eligibility.  
  **Fix:** Ensure backend filters out dead addresses from eligibility and winner selection.

---

### 5. REACT

- **Severity:** LOW  
  **Location:** `useEffect` with empty dependency array for rounds data  
  **Description:** No cleanup or cancellation logic for async data fetching (mocked here), but could cause memory leaks if replaced with real async calls.  
  **Fix:** Use abort controllers or cleanup functions when implementing real data fetching.

- **Severity:** LOW  
  **Location:** State updates on wallet connect  
  **Description:** Multiple state updates (`setWalletConnected`, `setUserBalance`, `setIsEligible`) happen synchronously, which can cause multiple re-renders.  
  **Fix:** Use a single state object or batch updates if possible.

- **Severity:** LOW  
  **Location:** Winners table rendering  
  **Description:** Rendering large winners arrays without memoization can cause unnecessary re-renders.  
  **Fix:** Use `React.memo` or `useMemo` for winners list if performance becomes an issue.

---

### Summary

The code is generally clean and well-structured for a UI component with mocked data. The main concerns are:

- Wallet connection and eligibility logic are mocked and insecure for production use. Proper wallet authentication and balance verification must be implemented.

- Data types for balances and rewards are strings with formatting, which is unsuitable for calculations or blockchain interactions.

- Minor React best practices such as key usage and event handler extraction should be improved.

- No critical security vulnerabilities or logic errors are present in this UI-only code.

---

If you provide the backend or smart contract code responsible for randomness, winner selection, and reward distribution, I can audit those critical components for security and correctness.

---

## Spin Wheel Engine

Here is the detailed audit of the provided Spin Wheel Engine TypeScript module:

---

### 1. SECURITY

- **Severity:** LOW  
  **Location:** `performSpin` function, wallet input validation  
  **Description:** Wallet address is validated with a regex, which is good. However, no normalization (e.g., checksum validation) is done. This could allow subtle wallet impersonation if checksummed addresses are expected elsewhere.  
  **Fix:** Use a library like `ethers.js` to validate and checksum the wallet address to prevent wallet impersonation or invalid addresses slipping through.

- **Severity:** INFO  
  **Location:** RNG usage in `performSpin`  
  **Description:** RNG is generated via `generateRandom(totalWeight, salt, chain)`. Assuming this is an on-chain verifiable RNG, this is good. However, RNG fairness depends entirely on `generateRandom` implementation, which is external here.  
  **Fix:** Ensure `generateRandom` uses a secure, verifiable randomness source (e.g., VRF) and that the salt is unique per spin to prevent manipulation.

- **Severity:** INFO  
  **Location:** Front-end React usage (not shown here)  
  **Description:** No direct XSS or injection vectors in this module since it is pure logic and does not handle user input rendering or database queries.  
  **Fix:** Ensure any UI components rendering `segmentLabel` or other user-facing strings sanitize or escape content.

---

### 2. LOGIC

- **Severity:** MEDIUM  
  **Location:** `performSpin` function, RNG selection loop  
  **Description:** The RNG value is compared with cumulative weights using `< cumulative`. If RNG value can be exactly equal to totalWeight, no segment will be selected, causing an error. This is partially mitigated by throwing an error if no segment matches, but it indicates a potential off-by-one or boundary condition.  
  **Fix:** Confirm that `rng.value` is always in `[0, totalWeight)` (exclusive upper bound). If inclusive, change condition to `<= cumulative` or adjust RNG range accordingly.

- **Severity:** LOW  
  **Location:** `updateSpinRecord` function, streak calculation  
  **Description:** The streak logic assumes spins happen exactly once per day and compares dates as strings. Timezone differences could cause issues if server and client are in different zones.  
  **Fix:** Use UTC dates consistently and consider normalizing dates to UTC midnight to avoid off-by-one day errors.

- **Severity:** LOW  
  **Location:** `updateSpinRecord` function, history slicing  
  **Description:** Keeps last 30 spins by slicing `record.history.slice(-29)` and adding the new result, resulting in max 30 entries. This is correct but could be clearer.  
  **Fix:** Add a comment clarifying the slice logic or use a constant for max history length.

- **Severity:** INFO  
  **Location:** `updateSpinRecord` function  
  **Description:** `totalRewards` stores `segmentLabel` strings, which may not be unique or stable identifiers for rewards.  
  **Fix:** Consider storing `segmentId` or a structured reward object for more reliable tracking.

---

### 3. BEST PRACTICES

- **Severity:** LOW  
  **Location:** `performSpin` function, input validation  
  **Description:** Input validation is done manually with `throw new Error`. No custom error types or codes are used, which could help downstream error handling.  
  **Fix:** Define custom error classes or error codes for better error management.

- **Severity:** LOW  
  **Location:** `performSpin` function  
  **Description:** The function mixes input validation, RNG logic, and selection in one function, which could be split for clarity and testability.  
  **Fix:** Separate validation, RNG generation, and segment selection into smaller functions.

- **Severity:** LOW  
  **Location:** `updateSpinRecord` function  
  **Description:** The function accepts `record` as nullable but requires `wallet` string separately. This could lead to inconsistencies if `record.wallet` differs from `wallet` argument.  
  **Fix:** Either require a non-null record or ensure `wallet` matches `record.wallet` if present.

---

### 4. CRYPTO-SPECIFIC

- **Severity:** INFO  
  **Location:** RNG salt generation in `performSpin`  
  **Description:** Salt is `spin-${wallet}-${today}`, which is deterministic per wallet per day. This prevents multiple spins per day but could allow front-running if RNG is predictable.  
  **Fix:** Ensure `generateRandom` uses a secure source and salt is combined with unpredictable on-chain data (blockhash, timestamp) to prevent manipulation.

- **Severity:** INFO  
  **Location:** Reward weight calculation  
  **Description:** Weights are positive integers and summed correctly. No floating point weights, which is good.  
  **Fix:** None needed.

- **Severity:** LOW  
  **Location:** No explicit handling of dead addresses  
  **Description:** The code does not check if the wallet is a dead address (e.g., 0x000...dead). This could allow spins from burn addresses.  
  **Fix:** Add a check to disallow spins from known dead or zero addresses.

---

### 5. REACT (Assuming usage in React app)

- **Severity:** INFO  
  **Location:** Not applicable in this module (pure logic)  
  **Description:** No React hooks or components here, so no memory leaks, stale closures, or re-render issues.  
  **Fix:** N/A

---

# Summary

The module is generally well-written, with good input validation and clear logic. The main concerns are:

- Potential off-by-one in RNG selection boundary (medium severity).  
- Wallet address validation could be stronger with checksum validation (low severity).  
- RNG salt determinism could be a vector for manipulation if `generateRandom` is not secure (info).  
- Minor best practice improvements in error handling and code structure.

No critical security vulnerabilities or logic bugs were found.

---

If you want, I can also review the `generateRandom` module or React UI components for a more complete audit.

---

## Spin Wheel UI

Below is a thorough audit of the provided Spin Wheel UI React/TypeScript code for the HERO token ecosystem on PulseChain/BASE.

---

### 1. SECURITY

**Severity: HIGH**  
**Location:** `handleSpin` function  
**Description:**  
- The RNG is implemented client-side using `Math.random()`, which is insecure and manipulable by users. This allows front-running or RNG manipulation attacks, enabling users to predict or influence spin outcomes.  
- No wallet authentication or signature verification is shown, so wallet impersonation or unauthorized spins could occur if backend checks are missing.  
- No input validation or sanitization is needed here since no user input is taken, but the RNG and wallet connection logic are critical.

**Fix:**  
- Move RNG and spin result determination to a secure backend or smart contract oracle that provides verifiable randomness (e.g., Chainlink VRF or PulseChain equivalent).  
- Require wallet signature verification or on-chain transaction to authorize spins, preventing wallet impersonation.  
- Ensure backend enforces one spin per wallet per day and validates streaks.

---

### 2. LOGIC

**Severity: MEDIUM**  
**Location:** `handleSpin` function, rotation calculation  
**Description:**  
- The rotation calculation assumes equal angular segments (`segmentAngle = 360 / SEGMENTS.length`), but segments have different weights, so their angular sizes differ. This mismatch can cause the wheel pointer to land inaccurately relative to the weighted segment.  
- The winner is selected by weighted RNG, but the visual wheel slices are drawn proportionally by weight, so the rotation should correspond to the weighted slice angle, not equal slices.

**Fix:**  
- Calculate each segment's start and end angle based on weights (as done in `WheelCanvas`), then compute the target rotation angle to land in the middle of the winning segment's weighted slice.  
- This ensures the pointer aligns correctly with the winning segment visually.

---

**Severity: LOW**  
**Location:** `handleSpin` function, `setTimeout` usage  
**Description:**  
- The spin animation duration is hardcoded as 4000ms in `setTimeout`. If the CSS transition duration changes, this could cause desync between animation and result reveal.  
- Potential race condition if user triggers multiple spins quickly (though guarded by `spinning` flag).

**Fix:**  
- Use a ref or state to store animation duration and keep it consistent between CSS and JS timers.  
- Consider disabling the spin button immediately on click to prevent race conditions.

---

**Severity: INFO**  
**Location:** `record.recentRewards` update  
**Description:**  
- The slice `prev.recentRewards.slice(-4)` keeps only the last 4 rewards, but then adds the new one, making 5 total. This may be intentional but could be off-by-one if max recent rewards is intended to be 4.

**Fix:**  
- Clarify max recent rewards count and adjust slice accordingly (e.g., slice(-3) before adding new reward for max 4).

---

### 3. BEST PRACTICES

**Severity: LOW**  
**Location:** `handleSpin` function  
**Description:**  
- The RNG and winner selection logic is duplicated between `WheelCanvas` (for drawing) and `handleSpin` (for RNG).  
- The code mixes UI state updates and RNG logic in one function, reducing separation of concerns.

**Fix:**  
- Extract RNG and winner selection logic into a reusable pure function.  
- Separate animation control and spin result logic for clarity and testability.

---

**Severity: LOW**  
**Location:** `WheelCanvas` component  
**Description:**  
- The canvas redraws on every `rotation` change, but the rotation is applied via CSS transform on the parent div in `SpinWheel`. The canvas rotation prop is always 0, so the `rotation` prop in `WheelCanvas` is unused or misleading.

**Fix:**  
- Remove `rotation` prop from `WheelCanvas` or use it consistently to rotate the canvas drawing instead of CSS transform.  
- This avoids confusion and unnecessary re-renders.

---

**Severity: LOW**  
**Location:** `SpinWheel` component  
**Description:**  
- No error handling or user feedback if wallet is not connected or spin is unavailable.  
- `walletConnected` is a boolean state but no wallet connection logic is shown.

**Fix:**  
- Add wallet connection logic or integrate with wallet provider.  
- Show user feedback or disable spin button with tooltip if wallet not connected or spin unavailable.

---

### 4. CRYPTO-SPECIFIC

**Severity: CRITICAL**  
**Location:** RNG in `handleSpin`  
**Description:** RNG is insecure and client-side, enabling manipulation and front-running.

**Fix:** See SECURITY section.

---

**Severity: MEDIUM**  
**Location:** `SEGMENTS` array and `handleSpin` winner selection  
**Description:**  
- The "nothing" segment is handled specially in recent rewards update, but no explicit handling of "dead" or burn addresses or invalid rewards is shown.  
- No validation that segment weights sum to a positive number.

**Fix:**  
- Validate segment weights sum > 0 before RNG.  
- Ensure backend or smart contract handles dead address or invalid reward cases securely.

---

### 5. REACT

**Severity: LOW**  
**Location:** `handleSpin` function and `setTimeout`  
**Description:**  
- `setTimeout` is used without cleanup, which can cause memory leaks if the component unmounts during the timeout.  
- `handleSpin` uses stale closure over `spinning`, `canSpin`, and `walletConnected` via dependencies, but dependencies are correct.

**Fix:**  
- Use `useEffect` cleanup or `useRef` to track mounted state and cancel timeout on unmount.  
- Alternatively, use `useCallback` with proper dependencies (already done).

---

**Severity: LOW**  
**Location:** `WheelCanvas` component  
**Description:**  
- The canvas redraw effect depends on `segments`, `rotation`, and `size`. Since `segments` is a constant array, it could cause unnecessary redraws if passed as a new array reference.

**Fix:**  
- Memoize `segments` or pass stable references to avoid unnecessary canvas redraws.

---

### Summary

| Severity | Location           | Description                                  | Fix Summary                              |
|----------|--------------------|----------------------------------------------|-----------------------------------------|
| CRITICAL | `handleSpin` RNG   | Insecure client-side RNG, front-running risk | Move RNG to backend/contract oracle     |
| HIGH     | Wallet connection  | No wallet auth or signature verification     | Add wallet signature verification       |
| MEDIUM   | Rotation calc      | Rotation angle assumes equal slices          | Calculate rotation based on weighted slices |
| MEDIUM   | RNG fairness       | No validation of segment weights sum         | Validate weights > 0                     |
| LOW      | Timeout cleanup    | Possible memory leak on unmount               | Cleanup timeout in `useEffect`           |
| LOW      | UI logic separation| Mixed RNG and UI logic                         | Extract RNG logic to pure function       |
| LOW      | Canvas rotation    | Rotation prop unused or inconsistent          | Use rotation consistently or remove prop |
|

---

## VRF Provider (T2/T3 Chainlink VRF)

The provided code snippet is incomplete (truncated at the end of the `commitReveal` method), but I will audit what is available thoroughly.

---

## 1. SECURITY

### Issue 1: Potential front-running in `commitReveal` method (lines ~130-160)
- **Severity:** HIGH  
- **Location:** `commitReveal` method  
- **Description:** The commit-reveal scheme relies on the secrecy of the `secret` and the `commitHash`. However, the secret is generated as `keccak256(abi.encodePacked(salt, Date.now()))`. Using `Date.now()` (current timestamp) as part of the secret is predictable and can be guessed or brute-forced by an attacker, enabling front-running or preimage attacks on the commit.  
- **Fix:** Use a secure source of entropy for the secret, e.g., a cryptographically secure random number generator (CSPRNG) or a server-side secure random seed. Avoid using timestamps or any predictable values.

### Issue 2: No input validation on `numWords` in `requestRandomWords` (line ~90)
- **Severity:** MEDIUM  
- **Location:** `requestRandomWords` method  
- **Description:** The `numWords` parameter is accepted as a number with a default of 1 but is not validated. If a caller passes 0 or an excessively large number, it could cause unexpected behavior or high gas costs.  
- **Fix:** Validate `numWords` to be within acceptable bounds (e.g., 1 <= numWords <= max allowed by Chainlink VRF).

### Issue 3: No validation or sanitization of `salt` in `commitReveal` (line ~130)
- **Severity:** LOW  
- **Location:** `commitReveal` method  
- **Description:** The `salt` parameter is a string that is used directly in hashing. If this value comes from user input, it could be crafted to cause unexpected behavior or injection attacks in other parts of the system.  
- **Fix:** Validate and sanitize `salt` input to ensure it is a safe string (e.g., length limits, allowed characters).

### Issue 4: No error handling on contract calls (lines ~90, ~140)
- **Severity:** MEDIUM  
- **Location:** `requestRandomWords` and `commitReveal` methods  
- **Description:** The code awaits contract calls and transactions but does not catch or handle errors explicitly. Failures in contract calls (e.g., out-of-gas, revert) will throw exceptions that may crash the server or cause unhandled promise rejections.  
- **Fix:** Wrap contract calls in try-catch blocks and handle errors gracefully, possibly retrying or returning meaningful error messages.

### Issue 5: Potential wallet impersonation risk if private key is compromised (general)
- **Severity:** INFO  
- **Location:** `constructor` and usage of `privateKey`  
- **Description:** The private key is passed in plaintext to the constructor and used to create a signer. If this key is leaked or mishandled, an attacker can impersonate the wallet and submit VRF requests or commits.  
- **Fix:** Ensure private keys are stored securely (e.g., environment variables, vaults) and never exposed in logs or client-side code.

### Issue 6: No XSS or injection risks detected in this backend module
- **Severity:** INFO  
- **Location:** Entire module  
- **Description:** This is a backend VRF provider module with no direct user input rendering or database queries, so typical XSS or injection vectors are not applicable here.

---

## 2. LOGIC

### Issue 7: Off-by-one risk in waiting for confirmations in `commitReveal` (incomplete code)
- **Severity:** MEDIUM  
- **Location:** `commitReveal` method (incomplete)  
- **Description:** The code snippet shows `const targetBlock = commitReceipt.blockNumber + this.config.requestConfirmations;` and then presumably waits until the current block >= targetBlock. If `requestConfirmations` is 5, waiting for blockNumber + 5 means 5 blocks after the commit block, which is correct. However, the waiting loop is truncated, so cannot confirm if the loop waits correctly or off-by-one.  
- **Fix:** Ensure the waiting loop waits until `currentBlock >= targetBlock` to avoid premature reveal.

### Issue 8: Use of `bigint` for requestId and subscriptionId but passing `0n` to contract calls expecting `uint64` or `uint256` (line ~95)
- **Severity:** LOW  
- **Location:** `requestRandomWords` method  
- **Description:** The contract method `requestRandomWords` expects `uint64 subId`, but the code passes `this.config.subscriptionId || 0n`. If `subscriptionId` is undefined, `0n` (bigint) is passed, but ethers.js expects a number or BigNumber. This could cause type issues or unexpected behavior.  
- **Fix:** Convert `bigint` to `number` or `ethers.BigNumber` as appropriate before passing to contract calls. For example, `Number(this.config.subscriptionId ?? 0)` or `ethers.BigNumber.from(this.config.subscriptionId ?? 0)`.

### Issue 9: Potential race condition in `pendingRequests` map (line ~100)
- **Severity:** LOW  
- **Location:** `requestRandomWords` method  
- **Description:** The `pendingRequests` map is updated after the transaction is mined. If multiple requests are made concurrently, there could be race conditions or overwrites if requestIds collide (unlikely but possible if requestId parsing fails and defaults to 0n).  
- **Fix:** Ensure requestId is always valid and unique before inserting into the map. Add checks to prevent overwriting existing requests.

---

## 3. BEST PRACTICES

### Issue 10: DRY violation - duplicate event parsing code (lines ~95 and ~145)
- **Severity:** LOW  
- **Location:** `requestRandomWords` and `commitReveal` methods  
- **Description:** Both methods parse logs to find specific events using similar code patterns. This could be abstracted into a helper function to reduce duplication.  
- **Fix:** Create a utility function `parseEventFromReceipt(contract, receipt, eventName)` to reuse.

### Issue 11: KISS - `commitReveal` method is complex and mixes multiple concerns (lines ~130-160)
- **Severity:** LOW  
- **Location:** `commitReveal` method  
- **Description:** The method handles secret generation, commit, waiting for confirmations, and reveal logic (though truncated). This could be split into smaller functions for clarity and testability.  
- **Fix:** Refactor `commitReveal` into smaller private methods: `generateSecret`, `commitHash`, `waitForConfirmations`, `revealSecret`.

### Issue 12: Missing input validation on config parameters (constructor)
- **Severity:** LOW  
- **Location:** `constructor`  
- **Description:** The constructor accepts a config object but does not validate required fields (e.g., `coordinatorAddress`, `keyHash`, `rpcUrl`).  
- **Fix:** Add validation and throw early errors if

---

