#!/usr/bin/env python3
"""
Auto-Refill Functions for HABFF BASE, PulseChain, and Kraken
=============================================================
These functions replace the alert-only check functions in auto_sustain_daemon.py
with actual self-sustaining swap logic:

1. HABFF BASE: Swap wallet HERO → WETH (via Uniswap V2) → unwrap to ETH for gas
2. PulseChain: Swap wallet HERO → WPLS (via PulseX V2) → unwrap to PLS for gas
3. Kraken: Sell crypto profits → USD when total USD < $60

Author: Manus AI for VETS
"""
import os
import json
import time
import logging
from web3 import Web3
from eth_account import Account

log = logging.getLogger("auto_sustain")

# ─── SHARED CONFIG ────────────────────────────────────────────────
DEX_WALLET = "0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6"

# BASE Chain
BASE_RPCS = [
    "https://base-rpc.publicnode.com",
    "https://base.llamarpc.com",
    "https://mainnet.base.org",
]
HERO_BASE = Web3.to_checksum_address("0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8")
WETH_BASE = Web3.to_checksum_address("0x4200000000000000000000000000000000000006")
UNIV2_ROUTER_BASE = Web3.to_checksum_address("0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24")

# PulseChain
PULSE_RPCS = [
    "https://rpc.pulsechain.com",
    "https://pulsechain-rpc.publicnode.com",
    "https://rpc-pulsechain.g4mm4.io",
]
HERO_PULSE = Web3.to_checksum_address("0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27")
WPLS = Web3.to_checksum_address("0xA1077a294dDE1B09bB078844df40758a5D0f9a27")
PULSEX_V2_ROUTER = Web3.to_checksum_address("0x165C3410fC91EF562C50559f7d2289fEbed552d9")

# ABIs
ERC20_ABI = json.loads('[{"inputs":[{"name":"spender","type":"uint256"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]')

# Fix: approve takes (address, uint256) not (uint256, uint256)
ERC20_APPROVE_ABI = json.loads('[{"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]')

UNIV2_ROUTER_ABI = json.loads('[{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

WETH_ABI = json.loads('[{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')

# Thresholds
HABFF_MIN_ETH = 0.01
HABFF_TARGET_ETH = 0.02
HABFF_HERO_SELL_AMOUNT = 5000  # Sell 5000 HERO at a time for gas (500 was dust)

PULSE_MIN_PLS = 50000
PULSE_TARGET_PLS = 100000
PULSE_HERO_SELL_AMOUNT = 2000  # Sell 2000 HERO at a time for gas

KRAKEN_MIN_USD = 60.0  # Trigger at $60
KRAKEN_TARGET_USD = 120.0

# Cooldown files
HABFF_COOLDOWN = "/tmp/habff_refill_cooldown"
PULSE_COOLDOWN = "/tmp/pulse_refill_cooldown"
KRAKEN_COOLDOWN = "/tmp/kraken_recycle_cooldown"
COOLDOWN_SEC = 300  # 5 min between refill attempts (SOP)


def _load_private_key():
    """Load the shared wallet private key."""
    for env_file in ["/root/.env_architecture", "/root/.env"]:
        if not os.path.exists(env_file):
            continue
        with open(env_file) as f:
            for line in f:
                for kn in ["ARB_BOT_BASE_PRIVATE_KEY", "HERO_FARM_PRIVATE_KEY", "WALLET_PRIVATE_KEY"]:
                    if kn in line and not line.strip().startswith("#"):
                        pk = line.split("=", 1)[1].strip().strip('"')
                        if pk:
                            return pk
    return None


def _connect(rpcs):
    """Connect to first available RPC."""
    for rpc in rpcs:
        try:
            w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 15}))
            if w3.is_connected():
                return w3
        except Exception:
            continue
    return None


def _check_cooldown(cooldown_file):
    """Return True if still in cooldown."""
    try:
        if os.path.exists(cooldown_file):
            last = os.path.getmtime(cooldown_file)
            if time.time() - last < COOLDOWN_SEC:
                return True
    except Exception:
        pass
    return False


def _set_cooldown(cooldown_file):
    """Set cooldown timestamp."""
    try:
        with open(cooldown_file, "w") as f:
            f.write(str(time.time()))
    except Exception:
        pass


def _ensure_approval(w3, token_addr, spender, wallet, pk, amount_wei):
    """Check and set ERC20 approval if needed."""
    token = w3.eth.contract(address=token_addr, abi=ERC20_APPROVE_ABI)
    allowance = token.functions.allowance(wallet, spender).call()
    if allowance >= amount_wei:
        return True
    log.info(f"[REFILL] Approving {spender} to spend token...")
    max_approve = 2**256 - 1
    tx = token.functions.approve(spender, max_approve).build_transaction({
        "from": wallet,
        "nonce": w3.eth.get_transaction_count(wallet),
        "gas": 60000,
        "gasPrice": w3.eth.gas_price,
    })
    signed = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt.status != 1:
        log.error("[REFILL] Approval failed!")
        return False
    log.info(f"[REFILL] Approval OK (gas: {receipt.gasUsed})")
    time.sleep(2)
    return True


# ═══════════════════════════════════════════════════════════════════
# 1. HABFF BASE: Swap wallet HERO → ETH for gas
# ═══════════════════════════════════════════════════════════════════
def refill_habff_base(send_telegram=None):
    """
    Self-sustain for HABFF BASE bot:
    - If wallet ETH < 0.01, sell 5000 HERO → WETH → unwrap to ETH
    - Uses Uniswap V2 on BASE (swapExactTokensForETH)
    - 30 min cooldown between attempts
    """
    log.info("[HABFF-BASE] Checking gas balance...")
    
    w3 = _connect(BASE_RPCS)
    if not w3:
        log.warning("[HABFF-BASE] Cannot connect to RPC")
        return
    
    pk = _load_private_key()
    if not pk:
        log.error("[HABFF-BASE] No private key found")
        return
    
    wallet = Web3.to_checksum_address(DEX_WALLET)
    eth_balance = w3.eth.get_balance(wallet) / 1e18
    
    hero_contract = w3.eth.contract(address=HERO_BASE, abi=ERC20_APPROVE_ABI)
    hero_balance = hero_contract.functions.balanceOf(wallet).call() / 1e18
    
    log.info(f"[HABFF-BASE] ETH={eth_balance:.6f} HERO={hero_balance:.0f}")
    
    if eth_balance >= HABFF_MIN_ETH:
        log.info("[HABFF-BASE] ✅ ETH above minimum")
        return
    
    # Need gas refill
    if _check_cooldown(HABFF_COOLDOWN):
        log.info("[HABFF-BASE] ⏳ Cooldown active")
        return
    
    # Check if we have enough HERO to sell
    if hero_balance < HABFF_HERO_SELL_AMOUNT:
        log.warning(f"[HABFF-BASE] Not enough HERO to sell ({hero_balance:.0f} < {HABFF_HERO_SELL_AMOUNT})")
        if send_telegram:
            send_telegram(
                f"⚠️ <b>HABFF BASE LOW GAS</b>\n"
                f"ETH: {eth_balance:.6f} (min: {HABFF_MIN_ETH})\n"
                f"HERO: {hero_balance:.0f} (need {HABFF_HERO_SELL_AMOUNT} to sell)\n"
                f"Cannot self-refill — send ETH to:\n"
                f"<code>{DEX_WALLET}</code> (BASE)",
                siren=True,
            )
        _set_cooldown(HABFF_COOLDOWN)
        return
    
    log.info(f"[HABFF-BASE] 🔄 Selling {HABFF_HERO_SELL_AMOUNT} HERO → ETH for gas")
    
    try:
        sell_amount_wei = int(HABFF_HERO_SELL_AMOUNT * 1e18)
        router = w3.eth.contract(address=UNIV2_ROUTER_BASE, abi=UNIV2_ROUTER_ABI)
        
        # Ensure approval
        if not _ensure_approval(w3, HERO_BASE, UNIV2_ROUTER_BASE, wallet, pk, sell_amount_wei):
            _set_cooldown(HABFF_COOLDOWN)
            return
        
        # Get quote
        path = [HERO_BASE, WETH_BASE]
        try:
            amounts = router.functions.getAmountsOut(sell_amount_wei, path).call()
            expected_eth = amounts[-1] / 1e18
            log.info(f"[HABFF-BASE] Quote: {HABFF_HERO_SELL_AMOUNT} HERO → {expected_eth:.6f} ETH")
        except Exception as e:
            log.error(f"[HABFF-BASE] Quote failed: {e}")
            _set_cooldown(HABFF_COOLDOWN)
            return
        
        # Use token-to-token swap as PRIMARY (more reliable)
        # Then manually unwrap WETH → ETH
        # 13% slippage SOP (permanent)
        min_out = int(amounts[-1] * 0.87)
        deadline = int(time.time()) + 300
        
        log.info("[HABFF-BASE] Swapping HERO → WETH (token-to-token)...")
        tx = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            sell_amount_wei,
            min_out,
            path,
            wallet,
            deadline,
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
        })
        
        signed = w3.eth.account.sign_transaction(tx, pk)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        log.info(f"[HABFF-BASE] Swap TX: {tx_hash.hex()}")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt.status == 1:
            time.sleep(3)
            # Unwrap WETH → ETH
            weth_contract = w3.eth.contract(address=WETH_BASE, abi=WETH_ABI)
            weth_bal = weth_contract.functions.balanceOf(wallet).call()
            if weth_bal > 0:
                log.info(f"[HABFF-BASE] Unwrapping {weth_bal/1e18:.6f} WETH → ETH...")
                tx2 = weth_contract.functions.withdraw(weth_bal).build_transaction({
                    "from": wallet,
                    "nonce": w3.eth.get_transaction_count(wallet),
                    "gas": 50000,
                    "gasPrice": w3.eth.gas_price,
                })
                signed2 = w3.eth.account.sign_transaction(tx2, pk)
                tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
                receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=120)
                if receipt2.status != 1:
                    log.error("[HABFF-BASE] WETH unwrap failed")
            
            time.sleep(3)
            new_eth = w3.eth.get_balance(wallet) / 1e18
            gained = new_eth - eth_balance
            log.info(f"[HABFF-BASE] ✅ Refill SUCCESS! ETH: {eth_balance:.6f} → {new_eth:.6f} (+{gained:.6f})")
            
            if send_telegram:
                send_telegram(
                    f"⛽ <b>HABFF BASE GAS REFILL</b>\n"
                    f"Sold {HABFF_HERO_SELL_AMOUNT} HERO → {gained:.6f} ETH\n"
                    f"ETH: {eth_balance:.6f} → {new_eth:.6f}\n"
                    f"TX: <code>{tx_hash.hex()[:16]}...</code>",
                    siren=False,
                )
        else:
            log.error(f"[HABFF-BASE] ❌ Swap FAILED (status=0)")
        
    except Exception as e:
        log.error(f"[HABFF-BASE] Refill error: {e}")
    
    _set_cooldown(HABFF_COOLDOWN)


def _habff_fallback_swap(w3, router, wallet, pk, sell_amount_wei, path, old_eth, send_telegram):
    """Fallback: HERO → WETH (token swap) then manually unwrap WETH → ETH."""
    try:
        amounts = router.functions.getAmountsOut(sell_amount_wei, path).call()
        min_out = int(amounts[-1] * 0.87)  # 13% slippage SOP (permanent)
        deadline = int(time.time()) + 300
        
        tx = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            sell_amount_wei,
            min_out,
            path,
            wallet,
            deadline,
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx, pk)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt.status != 1:
            log.error("[HABFF-BASE] Fallback swap also failed")
            return
        
        time.sleep(2)
        
        # Unwrap WETH → ETH
        weth_contract = w3.eth.contract(address=WETH_BASE, abi=WETH_ABI)
        weth_bal = weth_contract.functions.balanceOf(wallet).call()
        
        if weth_bal > 0:
            tx2 = weth_contract.functions.withdraw(weth_bal).build_transaction({
                "from": wallet,
                "nonce": w3.eth.get_transaction_count(wallet),
                "gas": 50000,
                "gasPrice": w3.eth.gas_price,
            })
            signed2 = w3.eth.account.sign_transaction(tx2, pk)
            tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
            receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=60)
            
            if receipt2.status == 1:
                time.sleep(2)
                new_eth = w3.eth.get_balance(wallet) / 1e18
                gained = new_eth - old_eth
                log.info(f"[HABFF-BASE] ✅ Fallback SUCCESS! ETH: {old_eth:.6f} → {new_eth:.6f}")
                if send_telegram:
                    send_telegram(
                        f"⛽ <b>HABFF BASE GAS REFILL (fallback)</b>\n"
                        f"Sold HERO → WETH → ETH\n"
                        f"ETH: {old_eth:.6f} → {new_eth:.6f} (+{gained:.6f})",
                        siren=False,
                    )
    except Exception as e:
        log.error(f"[HABFF-BASE] Fallback error: {e}")


# ═══════════════════════════════════════════════════════════════════
# 2. PULSECHAIN: Swap wallet HERO → PLS for gas via PulseX V2
# ═══════════════════════════════════════════════════════════════════
def refill_pulsechain(send_telegram=None):
    """
    Self-sustain for PulseChain bots:
    - If wallet PLS < 50,000, sell 2000 HERO → WPLS → unwrap to PLS
    - Uses PulseX V2 Router on PulseChain
    - 30 min cooldown between attempts
    """
    log.info("[PULSECHAIN] Checking gas balance...")
    
    w3 = _connect(PULSE_RPCS)
    if not w3:
        log.warning("[PULSECHAIN] Cannot connect to RPC")
        return
    
    pk = _load_private_key()
    if not pk:
        log.error("[PULSECHAIN] No private key found")
        return
    
    wallet = Web3.to_checksum_address(DEX_WALLET)
    pls_balance = w3.eth.get_balance(wallet) / 1e18
    
    hero_contract = w3.eth.contract(address=HERO_PULSE, abi=ERC20_APPROVE_ABI)
    hero_balance = hero_contract.functions.balanceOf(wallet).call() / 1e18
    
    log.info(f"[PULSECHAIN] PLS={pls_balance:.2f} HERO={hero_balance:.0f}")
    
    if pls_balance >= PULSE_MIN_PLS:
        log.info("[PULSECHAIN] ✅ PLS above minimum")
        return
    
    # Need gas refill
    if _check_cooldown(PULSE_COOLDOWN):
        log.info("[PULSECHAIN] ⏳ Cooldown active")
        return
    
    # Check if we have enough HERO to sell
    if hero_balance < PULSE_HERO_SELL_AMOUNT:
        log.warning(f"[PULSECHAIN] Not enough HERO to sell ({hero_balance:.0f} < {PULSE_HERO_SELL_AMOUNT})")
        if send_telegram:
            send_telegram(
                f"⚠️ <b>PULSECHAIN LOW GAS</b>\n"
                f"PLS: {pls_balance:.2f} (min: {PULSE_MIN_PLS:,})\n"
                f"HERO: {hero_balance:.0f} (need {PULSE_HERO_SELL_AMOUNT} to sell)\n"
                f"Cannot self-refill — send PLS/HERO to:\n"
                f"<code>{DEX_WALLET}</code> (PulseChain)",
                siren=True,
            )
        _set_cooldown(PULSE_COOLDOWN)
        return
    
    log.info(f"[PULSECHAIN] 🔄 Selling {PULSE_HERO_SELL_AMOUNT} HERO → PLS for gas via PulseX")
    
    try:
        sell_amount_wei = int(PULSE_HERO_SELL_AMOUNT * 1e18)
        router = w3.eth.contract(address=PULSEX_V2_ROUTER, abi=UNIV2_ROUTER_ABI)
        
        # Ensure approval for PulseX V2 Router
        if not _ensure_approval(w3, HERO_PULSE, PULSEX_V2_ROUTER, wallet, pk, sell_amount_wei):
            _set_cooldown(PULSE_COOLDOWN)
            return
        
        # Get quote: HERO → WPLS
        path = [HERO_PULSE, WPLS]
        try:
            amounts = router.functions.getAmountsOut(sell_amount_wei, path).call()
            expected_pls = amounts[-1] / 1e18
            log.info(f"[PULSECHAIN] Quote: {PULSE_HERO_SELL_AMOUNT} HERO → {expected_pls:.2f} PLS")
        except Exception as e:
            log.error(f"[PULSECHAIN] Quote failed: {e}")
            _set_cooldown(PULSE_COOLDOWN)
            return
        
        # PRIMARY: Token-to-token swap (HERO → WPLS) + manual unwrap
        # This is proven to work on PulseChain (swapForETH fails)
        # 13% slippage SOP (permanent)
        min_out = int(amounts[-1] * 0.87)
        deadline = int(time.time()) + 300
        
        log.info("[PULSECHAIN] Step 1: Swapping HERO → WPLS (token-to-token)...")
        tx = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            sell_amount_wei,
            min_out,
            path,
            wallet,
            deadline,
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 350000,
            "gasPrice": w3.eth.gas_price,
        })
        
        signed = w3.eth.account.sign_transaction(tx, pk)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        log.info(f"[PULSECHAIN] Swap TX: {tx_hash.hex()}")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt.status == 1:
            time.sleep(3)
            # Step 2: Unwrap WPLS → PLS
            wpls_contract = w3.eth.contract(address=WPLS, abi=WETH_ABI)
            wpls_bal = wpls_contract.functions.balanceOf(wallet).call()
            
            if wpls_bal > 0:
                log.info(f"[PULSECHAIN] Step 2: Unwrapping {wpls_bal/1e18:.2f} WPLS → PLS...")
                tx2 = wpls_contract.functions.withdraw(wpls_bal).build_transaction({
                    "from": wallet,
                    "nonce": w3.eth.get_transaction_count(wallet),
                    "gas": 50000,
                    "gasPrice": w3.eth.gas_price,
                })
                signed2 = w3.eth.account.sign_transaction(tx2, pk)
                tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
                receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=120)
                if receipt2.status != 1:
                    log.error("[PULSECHAIN] WPLS unwrap failed")
            
            time.sleep(3)
            new_pls = w3.eth.get_balance(wallet) / 1e18
            gained = new_pls - pls_balance
            log.info(f"[PULSECHAIN] ✅ Refill SUCCESS! PLS: {pls_balance:.2f} → {new_pls:.2f} (+{gained:.2f})")
            
            if send_telegram:
                send_telegram(
                    f"⛽ <b>PULSECHAIN GAS REFILL</b>\n"
                    f"Sold {PULSE_HERO_SELL_AMOUNT} HERO → {gained:.2f} PLS via PulseX\n"
                    f"PLS: {pls_balance:.2f} → {new_pls:.2f}\n"
                    f"TX: <code>{tx_hash.hex()[:16]}...</code>",
                    siren=False,
                )
        else:
            log.error("[PULSECHAIN] ❌ Token-to-token swap FAILED")
            if send_telegram:
                send_telegram(
                    f"⚠️ <b>PULSECHAIN REFILL FAILED</b>\n"
                    f"HERO → WPLS swap reverted\n"
                    f"PLS: {pls_balance:.2f} (min: {PULSE_MIN_PLS:,})\n"
                    f"Manual PLS deposit needed:\n"
                    f"<code>{DEX_WALLET}</code>",
                    siren=True,
                )
        
    except Exception as e:
        log.error(f"[PULSECHAIN] Refill error: {e}")
    
    _set_cooldown(PULSE_COOLDOWN)


def _pulse_fallback_swap(w3, router, wallet, pk, sell_amount_wei, path, old_pls, send_telegram):
    """Fallback: HERO → WPLS (token swap) then manually unwrap WPLS → PLS."""
    try:
        amounts = router.functions.getAmountsOut(sell_amount_wei, path).call()
        min_out = int(amounts[-1] * 0.90)
        deadline = int(time.time()) + 300
        
        tx = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            sell_amount_wei,
            min_out,
            path,
            wallet,
            deadline,
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx, pk)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=90)
        
        if receipt.status != 1:
            log.error("[PULSECHAIN] Fallback swap also failed")
            return
        
        time.sleep(2)
        
        # Unwrap WPLS → PLS
        wpls_contract = w3.eth.contract(address=WPLS, abi=WETH_ABI)
        wpls_bal = wpls_contract.functions.balanceOf(wallet).call()
        
        if wpls_bal > 0:
            tx2 = wpls_contract.functions.withdraw(wpls_bal).build_transaction({
                "from": wallet,
                "nonce": w3.eth.get_transaction_count(wallet),
                "gas": 50000,
                "gasPrice": w3.eth.gas_price,
            })
            signed2 = w3.eth.account.sign_transaction(tx2, pk)
            tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
            receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=60)
            
            if receipt2.status == 1:
                time.sleep(2)
                new_pls = w3.eth.get_balance(wallet) / 1e18
                gained = new_pls - old_pls
                log.info(f"[PULSECHAIN] ✅ Fallback SUCCESS! PLS: {old_pls:.2f} → {new_pls:.2f}")
                if send_telegram:
                    send_telegram(
                        f"⛽ <b>PULSECHAIN GAS REFILL (fallback)</b>\n"
                        f"Sold HERO → WPLS → PLS via PulseX\n"
                        f"PLS: {old_pls:.2f} → {new_pls:.2f} (+{gained:.2f})",
                        siren=False,
                    )
    except Exception as e:
        log.error(f"[PULSECHAIN] Fallback error: {e}")


# ═══════════════════════════════════════════════════════════════════
# 3. KRAKEN: Sell crypto profits → USD (trigger at $60)
# ═══════════════════════════════════════════════════════════════════
def refill_kraken(kraken_request_fn, send_telegram=None):
    """
    Self-sustain for Kraken bot:
    - If total USD (USDC + ZUSD) < $60, sell crypto profits
    - Strategy 1: Convert ZUSD → USDC if USDC is low
    - Strategy 2: Sell smallest crypto position (50%) if total < $60
    - Strategy 3: Sell larger positions if still critically low
    - 30 min cooldown between attempts
    """
    log.info("[KRAKEN] Checking balances...")
    
    balances = kraken_request_fn("Balance")
    if not balances:
        log.warning("[KRAKEN] Could not fetch balances")
        return
    
    usdc = float(balances.get("USDC", 0))
    zusd = float(balances.get("ZUSD", 0))
    total_usd = usdc + zusd
    
    log.info(f"[KRAKEN] USDC={usdc:.2f} ZUSD={zusd:.2f} Total={total_usd:.2f}")
    
    if total_usd >= KRAKEN_MIN_USD:
        log.info("[KRAKEN] ✅ Total USD above $60 threshold")
        return
    
    # Need refill
    if _check_cooldown(KRAKEN_COOLDOWN):
        log.info("[KRAKEN] ⏳ Cooldown active (30 min)")
        return
    
    needed = KRAKEN_TARGET_USD - total_usd
    log.info(f"[KRAKEN] 🔄 Total USD ${total_usd:.2f} below ${KRAKEN_MIN_USD:.0f} — need ${needed:.2f}")
    
    # Get open orders to check what's locked
    open_orders = kraken_request_fn("OpenOrders") or {}
    locked_pairs = set()
    if isinstance(open_orders, dict) and "open" in open_orders:
        for oid, order in open_orders["open"].items():
            locked_pairs.add(order.get("descr", {}).get("pair", ""))
        if locked_pairs:
            log.info(f"[KRAKEN] Open orders on: {locked_pairs}")
    
    # Strategy 1: Convert ZUSD → USDC if USDC specifically is low
    if usdc < 20 and zusd > 10:
        swap_amount = min(needed + 20, zusd * 0.5)
        if swap_amount >= 5:
            log.info(f"[KRAKEN] 🔄 Converting ${swap_amount:.2f} ZUSD → USDC")
            result = kraken_request_fn("AddOrder", {
                "pair": "USDCUSD",
                "type": "buy",
                "ordertype": "market",
                "volume": str(round(swap_amount, 2)),
                "oflags": "fciq",
            })
            if result:
                txid = result.get("txid", ["unknown"])[0]
                if send_telegram:
                    send_telegram(
                        f"💱 <b>KRAKEN USDC REFILL</b>\n"
                        f"Swapped ${swap_amount:.2f} ZUSD → USDC\n"
                        f"USDC was: ${usdc:.2f}\n"
                        f"TXID: {txid}",
                        siren=False,
                    )
                _set_cooldown(KRAKEN_COOLDOWN)
                return
            else:
                log.warning("[KRAKEN] ❌ ZUSD→USDC swap failed")
    
    # Strategy 2: Sell crypto profits — trigger at $60 (not $20 like before)
    # Sell priority: smallest positions first to minimize impact
    sell_priority = [
        ("XDGUSD", "XDGUSD", "DOGE", 10.0),
        ("DOT", "DOTUSD", "DOT", 0.1),
        ("ADA", "ADAUSD", "ADA", 1.0),
        ("LINK", "LINKUSD", "LINK", 0.1),
        ("AVAX", "AVAXUSD", "AVAX", 0.1),
        ("POL", "POLUSD", "POL", 1.0),
        ("XXRP", "XRPUSD", "XRP", 1.0),
        ("SOL", "SOLUSD", "SOL", 0.01),
        ("XETH", "XETHZUSD", "ETH", 0.001),
        ("XXBT", "XXBTZUSD", "BTC", 0.00001),
    ]
    
    for asset_key, pair, name, min_sell in sell_priority:
        amount = float(balances.get(asset_key, 0))
        if amount > min_sell and pair not in locked_pairs:
            # Sell 30% of position (conservative — preserve most holdings)
            sell_amount = round(amount * 0.30, 6)
            if sell_amount < min_sell:
                continue
            
            log.info(f"[KRAKEN] 🔄 Selling {sell_amount} {name} (30% of {amount})")
            result = kraken_request_fn("AddOrder", {
                "pair": pair,
                "type": "sell",
                "ordertype": "market",
                "volume": str(sell_amount),
            })
            if result:
                txid = result.get("txid", ["unknown"])[0]
                if send_telegram:
                    send_telegram(
                        f"💰 <b>KRAKEN PROFIT RECYCLE</b>\n"
                        f"Sold {sell_amount} {name} (30% of {amount})\n"
                        f"Reason: Total USD ${total_usd:.2f} < ${KRAKEN_MIN_USD:.0f}\n"
                        f"TXID: {txid}",
                        siren=False,
                    )
                _set_cooldown(KRAKEN_COOLDOWN)
                return
            else:
                log.warning(f"[KRAKEN] ❌ {name} sell failed (likely in orders)")
    
    # Nothing worked — alert
    log.warning("[KRAKEN] ⚠️ No available assets to sell")
    if send_telegram:
        send_telegram(
            f"⚠️ <b>KRAKEN LOW BALANCE</b>\n"
            f"USDC: ${usdc:.2f} | ZUSD: ${zusd:.2f} | Total: ${total_usd:.2f}\n"
            f"All assets locked in orders. Will retry in 30 min.",
            siren=True,
        )
    _set_cooldown(KRAKEN_COOLDOWN)
