#!/usr/bin/env python3
"""
Auto-Refill Functions for HABFF BASE, PulseChain, and Kraken
=============================================================
Self-sustaining swap logic — bots sell profits to maintain gas:
1. HABFF BASE: Sell AERO → WETH → ETH (via Aerodrome) — primary
              Fallback: HERO → WETH → ETH (via Uniswap V2)
2. PulseChain: Sell HERO → WPLS → PLS (via PulseX V2)
3. Kraken: Sell crypto profits → USD when total < $60

HERO on BASE: 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8
AERO on BASE: 0x940181a94A35A4569E4529A3CDfB74e38FD98631
Slippage: 13% SOP (permanent)
Cooldown: 5 min between attempts

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
    "https://base-mainnet.public.blastapi.io",
]
HERO_BASE = Web3.to_checksum_address("0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8")
AERO_BASE = Web3.to_checksum_address("0x940181a94A35A4569E4529A3CDfB74e38FD98631")
WETH_BASE = Web3.to_checksum_address("0x4200000000000000000000000000000000000006")
USDC_BASE = Web3.to_checksum_address("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
UNIV2_ROUTER_BASE = Web3.to_checksum_address("0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24")
AERO_ROUTER_BASE = Web3.to_checksum_address("0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43")
AERO_FACTORY_BASE = Web3.to_checksum_address("0x420DD381b31aEf6683db6B902084cB0FFECe40Da")

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
ERC20_ABI = json.loads('[{"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]')

WETH_ABI = json.loads('[{"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')

# Aerodrome Router ABI (V2 with struct routes)
AERO_ROUTER_ABI = json.loads("""[
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]""")

# Uniswap V2 / PulseX V2 Router ABI
UNIV2_ROUTER_ABI = json.loads("""[
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]""")

# Thresholds
HABFF_MIN_ETH = 0.01
HABFF_TARGET_ETH = 0.02
HABFF_AERO_SELL_AMOUNT = 100   # Sell 100 AERO at a time (~$50 ETH)
HABFF_HERO_SELL_AMOUNT = 5000  # Fallback: sell HERO
PULSE_MIN_PLS = 50000
PULSE_TARGET_PLS = 100000
PULSE_HERO_SELL_AMOUNT = 2000
KRAKEN_MIN_USD = 60.0
KRAKEN_TARGET_USD = 120.0

# Cooldown files
HABFF_COOLDOWN = "/tmp/habff_refill_cooldown"
PULSE_COOLDOWN = "/tmp/pulse_refill_cooldown"
KRAKEN_COOLDOWN = "/tmp/kraken_recycle_cooldown"
COOLDOWN_SEC = 300  # 5 min between refill attempts (SOP)

SLIPPAGE = 0.87  # 13% slippage SOP (permanent)


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


def _ensure_approval(w3, token_addr, spender, wallet, pk):
    """Check and set ERC20 max approval if needed."""
    token = w3.eth.contract(address=token_addr, abi=ERC20_ABI)
    allowance = token.functions.allowance(wallet, spender).call()
    if allowance > 10**30:
        return True
    log.info(f"[REFILL] Approving {spender[:10]}... for token {token_addr[:10]}...")
    tx = token.functions.approve(spender, 2**256 - 1).build_transaction({
        "from": wallet,
        "nonce": w3.eth.get_transaction_count(wallet),
        "gas": 60000,
        "gasPrice": w3.eth.gas_price,
        "chainId": w3.eth.chain_id,
    })
    signed = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt.status != 1:
        log.error("[REFILL] Approval failed!")
        return False
    log.info(f"[REFILL] Approval OK")
    time.sleep(3)
    return True


def _unwrap_weth(w3, wallet, pk):
    """Unwrap all WETH in wallet to ETH."""
    weth = w3.eth.contract(address=WETH_BASE, abi=WETH_ABI)
    weth_bal = weth.functions.balanceOf(wallet).call()
    if weth_bal == 0:
        return 0
    log.info(f"[REFILL] Unwrapping {w3.from_wei(weth_bal, 'ether')} WETH...")
    tx = weth.functions.withdraw(weth_bal).build_transaction({
        "from": wallet,
        "nonce": w3.eth.get_transaction_count(wallet),
        "gas": 50000,
        "gasPrice": w3.eth.gas_price,
        "chainId": 8453,
    })
    signed = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt.status == 1:
        log.info("[REFILL] WETH unwrap OK")
    else:
        log.error("[REFILL] WETH unwrap FAILED")
    return weth_bal


# ═══════════════════════════════════════════════════════════════════
# 1. HABFF BASE: Sell AERO (primary) or HERO (fallback) → ETH
# ═══════════════════════════════════════════════════════════════════
def refill_habff_base(send_telegram=None):
    """
    Self-sustain for HABFF BASE bot:
    - If wallet ETH < 0.01:
      1. PRIMARY: Sell AERO → WETH via Aerodrome → unwrap to ETH
      2. FALLBACK: Sell HERO → WETH via Uniswap V2 → unwrap to ETH
    - 13% slippage SOP, 5 min cooldown
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

    # Check all sellable token balances
    aero_contract = w3.eth.contract(address=AERO_BASE, abi=ERC20_ABI)
    hero_contract = w3.eth.contract(address=HERO_BASE, abi=ERC20_ABI)

    try:
        aero_balance = aero_contract.functions.balanceOf(wallet).call() / 1e18
    except Exception:
        aero_balance = 0
    time.sleep(0.5)
    try:
        hero_balance = hero_contract.functions.balanceOf(wallet).call() / 1e18
    except Exception:
        hero_balance = 0

    log.info(f"[HABFF-BASE] ETH={eth_balance:.6f} AERO={aero_balance:.2f} HERO={hero_balance:.0f}")

    if eth_balance >= HABFF_MIN_ETH:
        log.info("[HABFF-BASE] ETH above minimum")
        return

    # Need gas refill
    if _check_cooldown(HABFF_COOLDOWN):
        log.info("[HABFF-BASE] Cooldown active")
        return

    # ─── PRIMARY: Sell AERO via Aerodrome ─────────────────────────
    if aero_balance >= 10:  # At least 10 AERO (~$5 worth)
        log.info(f"[HABFF-BASE] Selling {aero_balance:.2f} AERO via Aerodrome...")
        try:
            sell_amount = int(aero_balance * 1e18)
            if not _ensure_approval(w3, AERO_BASE, AERO_ROUTER_BASE, wallet, pk):
                log.error("[HABFF-BASE] AERO approval failed")
            else:
                time.sleep(2)
                router = w3.eth.contract(address=AERO_ROUTER_BASE, abi=AERO_ROUTER_ABI)
                route = [(AERO_BASE, WETH_BASE, False, AERO_FACTORY_BASE)]

                amounts = router.functions.getAmountsOut(sell_amount, route).call()
                expected_weth = amounts[-1]
                min_out = int(expected_weth * SLIPPAGE)
                deadline = int(time.time()) + 600

                log.info(f"[HABFF-BASE] Quote: {aero_balance:.2f} AERO -> {w3.from_wei(expected_weth, 'ether')} WETH")

                time.sleep(2)
                nonce = w3.eth.get_transaction_count(wallet)
                swap_tx = router.functions.swapExactTokensForTokens(
                    sell_amount, min_out, route, wallet, deadline
                ).build_transaction({
                    "from": wallet, "nonce": nonce, "gas": 300000,
                    "gasPrice": w3.eth.gas_price, "chainId": 8453,
                })
                signed = w3.eth.account.sign_transaction(swap_tx, pk)
                tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
                log.info(f"[HABFF-BASE] AERO swap TX: {tx_hash.hex()[:20]}...")
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

                if receipt.status == 1:
                    time.sleep(3)
                    _unwrap_weth(w3, wallet, pk)
                    time.sleep(2)
                    new_eth = w3.eth.get_balance(wallet) / 1e18
                    gained = new_eth - eth_balance
                    log.info(f"[HABFF-BASE] AERO REFILL SUCCESS! ETH: {eth_balance:.6f} -> {new_eth:.6f} (+{gained:.6f})")
                    if send_telegram:
                        send_telegram(
                            f"⛽ <b>HABFF BASE GAS REFILL</b>\n"
                            f"Sold {aero_balance:.1f} AERO → {gained:.6f} ETH\n"
                            f"ETH: {eth_balance:.6f} → {new_eth:.6f}\n"
                            f"Via Aerodrome DEX",
                            siren=False,
                        )
                    _set_cooldown(HABFF_COOLDOWN)
                    return
                else:
                    log.warning("[HABFF-BASE] AERO swap reverted, trying HERO fallback...")
        except Exception as e:
            log.error(f"[HABFF-BASE] AERO swap error: {e}")

    # ─── FALLBACK: Sell HERO via Uniswap V2 ──────────────────────
    if hero_balance >= HABFF_HERO_SELL_AMOUNT:
        log.info(f"[HABFF-BASE] Fallback: Selling {HABFF_HERO_SELL_AMOUNT} HERO via Uniswap V2...")
        try:
            sell_amount = int(HABFF_HERO_SELL_AMOUNT * 1e18)
            if not _ensure_approval(w3, HERO_BASE, UNIV2_ROUTER_BASE, wallet, pk):
                log.error("[HABFF-BASE] HERO approval failed")
            else:
                time.sleep(2)
                router = w3.eth.contract(address=UNIV2_ROUTER_BASE, abi=UNIV2_ROUTER_ABI)
                path = [HERO_BASE, WETH_BASE]

                amounts = router.functions.getAmountsOut(sell_amount, path).call()
                expected_weth = amounts[-1]
                min_out = int(expected_weth * SLIPPAGE)
                deadline = int(time.time()) + 600

                log.info(f"[HABFF-BASE] Quote: {HABFF_HERO_SELL_AMOUNT} HERO -> {w3.from_wei(expected_weth, 'ether')} WETH")

                time.sleep(2)
                nonce = w3.eth.get_transaction_count(wallet)
                swap_tx = router.functions.swapExactTokensForTokens(
                    sell_amount, min_out, path, wallet, deadline
                ).build_transaction({
                    "from": wallet, "nonce": nonce, "gas": 300000,
                    "gasPrice": w3.eth.gas_price, "chainId": 8453,
                })
                signed = w3.eth.account.sign_transaction(swap_tx, pk)
                tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

                if receipt.status == 1:
                    time.sleep(3)
                    _unwrap_weth(w3, wallet, pk)
                    time.sleep(2)
                    new_eth = w3.eth.get_balance(wallet) / 1e18
                    gained = new_eth - eth_balance
                    log.info(f"[HABFF-BASE] HERO REFILL SUCCESS! ETH: {eth_balance:.6f} -> {new_eth:.6f}")
                    if send_telegram:
                        send_telegram(
                            f"⛽ <b>HABFF BASE GAS REFILL (HERO)</b>\n"
                            f"Sold {HABFF_HERO_SELL_AMOUNT} HERO → {gained:.6f} ETH\n"
                            f"ETH: {eth_balance:.6f} → {new_eth:.6f}",
                            siren=False,
                        )
                else:
                    log.error("[HABFF-BASE] HERO swap also reverted")
        except Exception as e:
            log.error(f"[HABFF-BASE] HERO swap error: {e}")
    else:
        log.warning(f"[HABFF-BASE] No sellable tokens (AERO={aero_balance:.1f}, HERO={hero_balance:.0f})")
        if send_telegram:
            send_telegram(
                f"⚠️ <b>HABFF BASE LOW GAS</b>\n"
                f"ETH: {eth_balance:.6f} (min: {HABFF_MIN_ETH})\n"
                f"AERO: {aero_balance:.1f} | HERO: {hero_balance:.0f}\n"
                f"Not enough to auto-refill\n"
                f"Send ETH/AERO to:\n"
                f"<code>{DEX_WALLET}</code> (BASE)",
                siren=True,
            )

    _set_cooldown(HABFF_COOLDOWN)


# ═══════════════════════════════════════════════════════════════════
# 2. PULSECHAIN: Swap HERO → WPLS → PLS via PulseX V2
# ═══════════════════════════════════════════════════════════════════
def refill_pulsechain(send_telegram=None):
    """
    Self-sustain for PulseChain bots:
    - If wallet PLS < 50,000, sell HERO → WPLS via PulseX V2 → unwrap to PLS
    - Uses token-to-token swap (not swapForETH) + manual WPLS unwrap
    - 13% slippage SOP, 5 min cooldown
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

    hero_contract = w3.eth.contract(address=HERO_PULSE, abi=ERC20_ABI)
    hero_balance = hero_contract.functions.balanceOf(wallet).call() / 1e18

    log.info(f"[PULSECHAIN] PLS={pls_balance:.2f} HERO={hero_balance:.0f}")

    if pls_balance >= PULSE_MIN_PLS:
        log.info("[PULSECHAIN] PLS above minimum")
        return

    if _check_cooldown(PULSE_COOLDOWN):
        log.info("[PULSECHAIN] Cooldown active")
        return

    if hero_balance < PULSE_HERO_SELL_AMOUNT:
        log.warning(f"[PULSECHAIN] Not enough HERO ({hero_balance:.0f} < {PULSE_HERO_SELL_AMOUNT})")
        if send_telegram:
            send_telegram(
                f"⚠️ <b>PULSECHAIN LOW GAS</b>\n"
                f"PLS: {pls_balance:.2f} (min: {PULSE_MIN_PLS:,})\n"
                f"HERO: {hero_balance:.0f} (need {PULSE_HERO_SELL_AMOUNT})\n"
                f"Send PLS/HERO to:\n"
                f"<code>{DEX_WALLET}</code> (PulseChain)",
                siren=True,
            )
        _set_cooldown(PULSE_COOLDOWN)
        return

    # Sell HERO → WPLS via PulseX V2 (token-to-token)
    log.info(f"[PULSECHAIN] Selling {PULSE_HERO_SELL_AMOUNT} HERO via PulseX V2...")
    try:
        sell_amount = int(PULSE_HERO_SELL_AMOUNT * 1e18)

        if not _ensure_approval(w3, HERO_PULSE, PULSEX_V2_ROUTER, wallet, pk):
            _set_cooldown(PULSE_COOLDOWN)
            return

        time.sleep(2)
        router = w3.eth.contract(address=PULSEX_V2_ROUTER, abi=UNIV2_ROUTER_ABI)
        path = [HERO_PULSE, WPLS]

        amounts = router.functions.getAmountsOut(sell_amount, path).call()
        expected_wpls = amounts[-1]
        min_out = int(expected_wpls * SLIPPAGE)
        deadline = int(time.time()) + 600

        log.info(f"[PULSECHAIN] Quote: {PULSE_HERO_SELL_AMOUNT} HERO -> {expected_wpls / 1e18:.2f} WPLS")

        time.sleep(2)
        nonce = w3.eth.get_transaction_count(wallet)
        swap_tx = router.functions.swapExactTokensForTokens(
            sell_amount, min_out, path, wallet, deadline
        ).build_transaction({
            "from": wallet, "nonce": nonce, "gas": 500000,
            "gasPrice": w3.eth.gas_price, "chainId": 369,
        })
        signed = w3.eth.account.sign_transaction(swap_tx, pk)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        log.info(f"[PULSECHAIN] Swap TX: {tx_hash.hex()[:20]}...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        if receipt.status == 1:
            # Unwrap WPLS → PLS
            time.sleep(3)
            wpls_contract = w3.eth.contract(address=WPLS, abi=WETH_ABI)
            wpls_bal = wpls_contract.functions.balanceOf(wallet).call()

            if wpls_bal > 0:
                log.info(f"[PULSECHAIN] Unwrapping {wpls_bal / 1e18:.2f} WPLS...")
                nonce2 = w3.eth.get_transaction_count(wallet)
                unwrap_tx = wpls_contract.functions.withdraw(wpls_bal).build_transaction({
                    "from": wallet, "nonce": nonce2, "gas": 50000,
                    "gasPrice": w3.eth.gas_price, "chainId": 369,
                })
                signed2 = w3.eth.account.sign_transaction(unwrap_tx, pk)
                tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
                receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=60)

                time.sleep(2)
                new_pls = w3.eth.get_balance(wallet) / 1e18
                gained = new_pls - pls_balance
                log.info(f"[PULSECHAIN] REFILL SUCCESS! PLS: {pls_balance:.2f} -> {new_pls:.2f} (+{gained:.2f})")
                if send_telegram:
                    send_telegram(
                        f"⛽ <b>PULSECHAIN GAS REFILL</b>\n"
                        f"Sold {PULSE_HERO_SELL_AMOUNT} HERO → {gained:.0f} PLS\n"
                        f"PLS: {pls_balance:.0f} → {new_pls:.0f}\n"
                        f"Via PulseX V2",
                        siren=False,
                    )
            else:
                log.warning("[PULSECHAIN] No WPLS to unwrap after swap")
        else:
            log.error("[PULSECHAIN] Swap reverted")
            if send_telegram:
                send_telegram(
                    f"⚠️ <b>PULSECHAIN REFILL FAILED</b>\n"
                    f"Swap TX reverted\n"
                    f"PLS: {pls_balance:.0f} (min: {PULSE_MIN_PLS:,})",
                    siren=True,
                )
    except Exception as e:
        log.error(f"[PULSECHAIN] Refill error: {e}")

    _set_cooldown(PULSE_COOLDOWN)


# ═══════════════════════════════════════════════════════════════════
# 3. KRAKEN: Sell crypto profits → USD when total < $60
# ═══════════════════════════════════════════════════════════════════
def refill_kraken(send_telegram=None):
    """
    Self-sustain for Kraken bot:
    - If total USD < $60, sell smallest profitable crypto position for USD
    - Uses Kraken REST API
    - 5 min cooldown
    """
    log.info("[KRAKEN] Checking USD balance...")

    if _check_cooldown(KRAKEN_COOLDOWN):
        log.info("[KRAKEN] Cooldown active")
        return

    try:
        import urllib.request
        import hashlib
        import hmac
        import base64

        # Load Kraken API keys
        api_key = None
        api_secret = None
        for env_file in ["/root/.env_architecture", "/root/.env"]:
            if not os.path.exists(env_file):
                continue
            with open(env_file) as f:
                for line in f:
                    if "KRAKEN_API_KEY" in line and not line.strip().startswith("#"):
                        api_key = line.split("=", 1)[1].strip().strip('"')
                    elif "KRAKEN_API_SECRET" in line and not line.strip().startswith("#"):
                        api_secret = line.split("=", 1)[1].strip().strip('"')

        if not api_key or not api_secret:
            log.error("[KRAKEN] No API keys found")
            return

        def kraken_request(uri_path, data=None):
            """Make authenticated Kraken API request."""
            if data is None:
                data = {}
            data["nonce"] = str(int(time.time() * 1000))
            postdata = "&".join([f"{k}={v}" for k, v in data.items()])
            encoded = (data["nonce"] + postdata).encode()
            message = uri_path.encode() + hashlib.sha256(encoded).digest()
            # Handle base64 padding
            secret_padded = api_secret + "=" * (4 - len(api_secret) % 4) if len(api_secret) % 4 else api_secret
            mac = hmac.new(base64.b64decode(secret_padded), message, hashlib.sha512)
            sigdigest = base64.b64encode(mac.digest()).decode()

            req = urllib.request.Request(
                f"https://api.kraken.com{uri_path}",
                data=postdata.encode(),
                headers={"API-Key": api_key, "API-Sign": sigdigest, "Content-Type": "application/x-www-form-urlencoded"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read())

        # Get balance
        result = kraken_request("/0/private/Balance")
        if result.get("error"):
            log.error(f"[KRAKEN] API error: {result['error']}")
            return

        balances = result.get("result", {})
        usd_balance = float(balances.get("ZUSD", 0))
        log.info(f"[KRAKEN] USD balance: ${usd_balance:.2f}")

        if usd_balance >= KRAKEN_MIN_USD:
            log.info("[KRAKEN] USD above minimum")
            return

        # Find crypto to sell
        sellable = {}
        for asset, bal in balances.items():
            bal_f = float(bal)
            if bal_f > 0 and asset not in ("ZUSD", "USD", "USDT", "USDC"):
                sellable[asset] = bal_f

        if not sellable:
            log.warning("[KRAKEN] No crypto to sell")
            if send_telegram:
                send_telegram(
                    f"⚠️ <b>KRAKEN LOW BALANCE</b>\n"
                    f"USD: ${usd_balance:.2f} (min: ${KRAKEN_MIN_USD})\n"
                    f"No crypto to sell for USD",
                    siren=True,
                )
            _set_cooldown(KRAKEN_COOLDOWN)
            return

        # Sell the asset with the smallest balance first (preserve large positions)
        asset_to_sell = min(sellable, key=sellable.get)
        amount = sellable[asset_to_sell]

        # Map Kraken asset names to trading pairs
        pair_map = {
            "XXBT": "XBTUSD", "BTC": "XBTUSD",
            "XETH": "ETHUSD", "ETH": "ETHUSD",
            "SOL": "SOLUSD", "DOT": "DOTUSD",
            "ADA": "ADAUSD", "MATIC": "MATICUSD",
            "LINK": "LINKUSD", "AVAX": "AVAXUSD",
            "XRP": "XRPUSD", "DOGE": "DOGEUSD",
        }

        pair = pair_map.get(asset_to_sell)
        if not pair:
            # Try generic pair name
            clean = asset_to_sell.lstrip("X").lstrip("Z")
            pair = f"{clean}USD"

        log.info(f"[KRAKEN] Selling {amount} {asset_to_sell} (pair: {pair})")

        sell_result = kraken_request("/0/private/AddOrder", {
            "pair": pair,
            "type": "sell",
            "ordertype": "market",
            "volume": str(amount),
        })

        if sell_result.get("error"):
            log.error(f"[KRAKEN] Sell error: {sell_result['error']}")
        else:
            txid = sell_result.get("result", {}).get("txid", ["unknown"])[0]
            log.info(f"[KRAKEN] SELL SUCCESS! TX: {txid}")
            if send_telegram:
                send_telegram(
                    f"⛽ <b>KRAKEN USD REFILL</b>\n"
                    f"Sold {amount} {asset_to_sell}\n"
                    f"USD was: ${usd_balance:.2f}\n"
                    f"TX: {txid}",
                    siren=False,
                )

    except Exception as e:
        log.error(f"[KRAKEN] Refill error: {e}")

    _set_cooldown(KRAKEN_COOLDOWN)
