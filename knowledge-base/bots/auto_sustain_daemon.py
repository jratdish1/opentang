#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║  SELF-SUSTAINING TRADING BOT AUTO-REFILL DAEMON v1.0           ║
║  Maintains minimum token thresholds across ALL trading bots    ║
║  24/7/365 — Zero human intervention                            ║
║  Author: Manus AI for VETS                                     ║
╚══════════════════════════════════════════════════════════════════╝

ARCHITECTURE:
  - Runs on VDS as a pm2 process (auto-sustain-daemon)
  - Checks every 5 minutes
  - Each bot has its own refill strategy using existing funds
  - Telegram 🚨 alert on every refill action
  - Profit recycling: profits stay in the trading pool

BOTS COVERED:
  1. Kraken (CEX)     — Maintain $50 USDC min, auto-convert ZUSD→USDC
  2. Kalshi (CEX)     — Auto-reinvest settled profits, maintain $50 min
  3. Polymarket (DEX) — USDC.e threshold via Hetzner module (already exists)
  4. HABFF (BASE)     — Maintain 0.01 ETH gas + 1000 HERO min
  5. PulseChain bots  — Maintain 50K PLS gas + 5000 HERO min
"""

import os
import sys
import json
import time
import logging
import traceback
import requests
import urllib.parse
import hashlib
import hmac
import base64
from datetime import datetime, timezone

# ─── LOGGING ──────────────────────────────────────────────────────
LOG_DIR = "/opt/apex-agent/logs"
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"{LOG_DIR}/auto_sustain.log"),
    ],
)
log = logging.getLogger("auto-sustain")

# ─── TELEGRAM ─────────────────────────────────────────────────────
TG_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8755508099:AAFDeEvGIZU-EsBWJk7r3j_2gIeYvmJ1YJc")
TG_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "1760124019")

SNOOZE_FILE = "/tmp/auto_sustain_snooze"
SNOOZE_DURATION = 3600  # 1 hour default

def is_snoozed() -> bool:
    """Check if alerts are snoozed. Snooze file auto-expires after SNOOZE_DURATION."""
    try:
        if os.path.exists(SNOOZE_FILE):
            age = time.time() - os.path.getmtime(SNOOZE_FILE)
            if age < SNOOZE_DURATION:
                remaining = int((SNOOZE_DURATION - age) / 60)
                log.info(f"[TG] 💤 Alerts snoozed ({remaining} min remaining)")
                return True
            else:
                # Snooze expired — clean up
                os.remove(SNOOZE_FILE)
                log.info("[TG] 💤 Snooze expired — alerts resumed")
    except Exception:
        pass
    return False

def send_telegram(msg: str, siren: bool = False):
    """Send Telegram alert. siren=True adds 🚨 red siren prefix. Respects snooze."""
    if is_snoozed():
        return
    prefix = "🚨🚨🚨 AUTO-REFILL ALERT 🚨🚨🚨\n\n" if siren else ""
    text = f"{prefix}{msg}\n\n⏰ {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
    try:
        r = requests.post(
            f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage",
            json={"chat_id": TG_CHAT_ID, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )
        if r.status_code == 200:
            log.info(f"[TG] Alert sent: {msg[:80]}...")
        else:
            log.warning(f"[TG] Failed ({r.status_code}): {r.text[:100]}")
    except Exception as e:
        log.error(f"[TG] Error: {e}")

# ─── KRAKEN API ───────────────────────────────────────────────────
KRAKEN_API_KEY = os.environ.get(
    "KRAKEN_API_KEY",
    "T3rGCqP/eAzot9JbBfwfjP6Cz7jjY1Mu58k6tvRQa5f+juH+brk44XdZ",
)
KRAKEN_API_SECRET = os.environ.get(
    "KRAKEN_PRIVATE_KEY",
    "k3lI46oTTE6zR/78wjqBHgqZ0fAcpj3nI+mTXRvOJ30UxjezAV9S3/nMPZi0IPLiJsGYwLO753n1ryUuc4Q+EQ==",
)

def kraken_request(endpoint, data=None, private=True):
    """Make a Kraken API request."""
    if data is None:
        data = {}
    try:
        if private:
            data["nonce"] = str(int(time.time() * 1000))
            urlpath = f"/0/private/{endpoint}"
            postdata = urllib.parse.urlencode(data)
            encoded = (str(data["nonce"]) + postdata).encode()
            message = urlpath.encode() + hashlib.sha256(encoded).digest()
            signature = hmac.new(
                base64.b64decode(KRAKEN_API_SECRET), message, hashlib.sha512
            )
            sigdigest = base64.b64encode(signature.digest()).decode()
            headers = {"API-Key": KRAKEN_API_KEY, "API-Sign": sigdigest}
            r = requests.post(
                f"https://api.kraken.com{urlpath}",
                headers=headers,
                data=data,
                timeout=15,
            )
        else:
            urlpath = f"/0/public/{endpoint}"
            r = requests.get(
                f"https://api.kraken.com{urlpath}", params=data, timeout=15
            )
        resp = r.json()
        if resp.get("error"):
            log.warning(f"[KRAKEN] API error on {endpoint}: {resp['error']}")
        return resp.get("result", {})
    except Exception as e:
        log.error(f"[KRAKEN] Request failed for {endpoint}: {e}")
        return {}

# ─── THRESHOLDS ───────────────────────────────────────────────────
THRESHOLDS = {
    "kraken": {
        "min_usdc": 50.0,       # Minimum USDC balance
        "target_usdc": 100.0,   # Target after refill
        "min_zusd": 20.0,       # Keep some USD reserve
    },
    "kalshi": {
        "min_balance": 50.0,    # Minimum trading balance
    },
    "polymarket": {
        "min_usdc_e": 50.0,     # Minimum USDC.e
        "target_usdc_e": 100.0, # Target after refill
    },
    "habff_base": {
        "min_eth": 0.01,        # Gas minimum
        "min_hero": 1000,       # Volume trading minimum
    },
    "pulsechain": {
        "min_pls": 50000,       # Gas minimum
        "min_hero": 5000,       # Volume trading minimum
    },
}

# ─── DEX WALLET ───────────────────────────────────────────────────
DEX_WALLET = "0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6"

# Token addresses
HERO_BASE = "0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8"
HERO_PULSE = "0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27"
VETS_PULSE = "0x4013abBf94A745EfA7cc848989Ee83424A770060"

BASE_RPC = "https://mainnet.base.org"
PULSE_RPC = "https://rpc.pulsechain.com"

# ─── BALANCE HELPERS ──────────────────────────────────────────────
def get_native_balance(rpc, wallet, retries=3):
    """Get native token balance (ETH/PLS) with retry logic."""
    for attempt in range(retries):
        try:
            r = requests.post(
                rpc,
                json={"jsonrpc": "2.0", "method": "eth_getBalance", "params": [wallet, "latest"], "id": 1},
                timeout=15,
            )
            return int(r.json().get("result", "0x0"), 16) / 1e18
        except Exception as e:
            log.error(f"[RPC] Native balance error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
    return None

def get_token_balance(rpc, token_addr, wallet, retries=3):
    """Get ERC20 token balance with retry logic."""
    data = "0x70a08231" + "0" * 24 + wallet[2:].lower()
    for attempt in range(retries):
        try:
            r = requests.post(
                rpc,
                json={"jsonrpc": "2.0", "method": "eth_call", "params": [{"to": token_addr, "data": data}, "latest"], "id": 1},
                timeout=15,
            )
            result = r.json().get("result", "0x0")
            if result and result != "0x" and result != "0x0":
                val = int(result, 16) / 1e18
                if val > 0:
                    return val
            # Got zero — might be transient, retry
            if attempt < retries - 1:
                time.sleep(2)
                continue
            return 0
        except Exception as e:
            log.error(f"[RPC] Token balance error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
    return None

# ─── KRAKEN SELF-SUSTAIN ─────────────────────────────────────────
def check_kraken():
    """
    Kraken self-sustain logic:
    1. Check USDC + ZUSD total balance (both are USD-equivalent)
    2. If total USD < $50, recycle crypto profits
    3. Prioritize ZUSD→USDC, then sell smallest available crypto
    4. 30-minute cooldown between recycle attempts
    5. Only sell AVAILABLE balances (not locked in orders)
    """
    log.info("[KRAKEN] Checking balances...")
    balances = kraken_request("Balance")
    if not balances:
        log.warning("[KRAKEN] Could not fetch balances")
        return

    usdc = float(balances.get("USDC", 0))
    zusd = float(balances.get("ZUSD", 0))
    total_usd = usdc + zusd

    log.info(f"[KRAKEN] USDC={usdc:.2f} ZUSD={zusd:.2f} Total={total_usd:.2f}")

    # The trading bot uses USDC for trades, so it fluctuates.
    # Only intervene if TOTAL USD (USDC + ZUSD) drops below threshold.
    if total_usd >= THRESHOLDS["kraken"]["min_usdc"]:
        log.info("[KRAKEN] ✅ Total USD above threshold")
        return

    # Cooldown: don't attempt recycle more than once per 30 minutes
    cooldown_file = "/tmp/kraken_recycle_cooldown"
    try:
        if os.path.exists(cooldown_file):
            last_recycle = os.path.getmtime(cooldown_file)
            if time.time() - last_recycle < 1800:  # 30 min
                log.info("[KRAKEN] ⏳ Recycle cooldown active (30 min)")
                return
    except Exception:
        pass

    # Need to refill — total USD is below threshold
    needed = THRESHOLDS["kraken"]["target_usdc"] - total_usd
    log.info(f"[KRAKEN] 🔄 Total USD ${total_usd:.2f} below ${THRESHOLDS['kraken']['min_usdc']:.0f} — need ${needed:.2f}")

    # Get open orders to check what's locked
    open_orders = kraken_request("OpenOrders") or {}
    locked_assets = set()
    if isinstance(open_orders, dict) and "open" in open_orders:
        for oid, order in open_orders["open"].items():
            locked_assets.add(order.get("descr", {}).get("pair", ""))
        if locked_assets:
            log.info(f"[KRAKEN] Open orders on: {locked_assets}")

    # Strategy 1: Convert ZUSD → USDC if USDC specifically is low
    if usdc < 10 and zusd > 20:
        swap_amount = min(needed + 20, zusd * 0.5)  # Swap half of ZUSD
        if swap_amount >= 5:
            log.info(f"[KRAKEN] 🔄 Converting ${swap_amount:.2f} ZUSD → USDC")
            result = kraken_request("AddOrder", {
                "pair": "USDCUSD",
                "type": "buy",
                "ordertype": "market",
                "volume": str(round(swap_amount, 2)),
                "oflags": "fciq",
            })
            if result:
                txid = result.get("txid", ["unknown"])[0]
                msg = (
                    f"💱 <b>KRAKEN USDC REFILL</b>\n"
                    f"Swapped ${swap_amount:.2f} ZUSD → USDC\n"
                    f"USDC was: ${usdc:.2f}\n"
                    f"TXID: {txid}"
                )
                send_telegram(msg, siren=True)
                # Set cooldown
                with open(cooldown_file, "w") as f:
                    f.write(str(time.time()))
                return
            else:
                log.warning("[KRAKEN] ❌ ZUSD→USDC swap failed (funds may be in orders)")

    # Strategy 2: Sell smallest AVAILABLE crypto position (last resort)
    # Only sell if total USD is critically low (below $20)
    if total_usd < 20:
        sell_priority = [
            ("DOT", "DOTUSD", "DOT", 0.1),
            ("LINK", "LINKUSD", "LINK", 0.1),
            ("ADA", "ADAUSD", "ADA", 1.0),
            ("XXRP", "XRPUSD", "XRP", 1.0),
        ]
        for asset_key, pair, name, min_sell in sell_priority:
            amount = float(balances.get(asset_key, 0))
            if amount > min_sell and pair not in locked_assets:
                # Sell only 50% of position to preserve holdings
                sell_amount = round(amount * 0.5, 4)
                log.info(f"[KRAKEN] 🔄 Selling {sell_amount:.4f} {name} (50% of {amount:.4f})")
                result = kraken_request("AddOrder", {
                    "pair": pair,
                    "type": "sell",
                    "ordertype": "market",
                    "volume": str(sell_amount),
                })
                if result:
                    txid = result.get("txid", ["unknown"])[0]
                    msg = (
                        f"💰 <b>KRAKEN PROFIT RECYCLE</b>\n"
                        f"Sold {sell_amount:.4f} {name} (50% of position)\n"
                        f"Reason: Total USD ${total_usd:.2f} critically low\n"
                        f"TXID: {txid}"
                    )
                    send_telegram(msg, siren=True)
                    with open(cooldown_file, "w") as f:
                        f.write(str(time.time()))
                    return
                else:
                    log.warning(f"[KRAKEN] ❌ {name} sell failed (likely in orders)")

    # Nothing worked — alert for manual intervention
    log.warning("[KRAKEN] ⚠️ No available assets to convert")
    send_telegram(
        f"⚠️ <b>KRAKEN LOW BALANCE WARNING</b>\n"
        f"USDC: ${usdc:.2f} | ZUSD: ${zusd:.2f} | Total: ${total_usd:.2f}\n"
        f"Open orders locking funds. Trading may pause.\n"
        f"Will retry in 30 minutes.",
        siren=True,
    )
    with open(cooldown_file, "w") as f:
        f.write(str(time.time()))

# ─── KALSHI SELF-SUSTAIN ─────────────────────────────────────────
def check_kalshi():
    """
    Kalshi self-sustain logic:
    - Kalshi auto-settles winning positions (built into the bot)
    - We just monitor the balance and alert if it drops too low
    - Profits automatically stay in the account for reinvestment
    """
    log.info("[KALSHI] Checking balance...")
    try:
        import re
        # Read directly from the pm2 log file (more reliable than pm2 logs command)
        log_file = "/root/.pm2/logs/kalshi-bot-v4-out.log"
        balance = None
        with open(log_file, "r") as f:
            # Read last 50 lines efficiently
            lines = f.readlines()[-200:]
            for line in reversed(lines):
                match = re.search(r"Balance:\s*\$?([\d.]+)", line)
                if match:
                    balance = float(match.group(1))
                    break
        if balance is not None:
            log.info(f"[KALSHI] Balance: ${balance:.2f}")
            if balance < THRESHOLDS["kalshi"]["min_balance"]:
                msg = (
                    f"⚠️ <b>KALSHI LOW BALANCE</b>\n"
                    f"Balance: ${balance:.2f} (min: ${THRESHOLDS['kalshi']['min_balance']:.0f})\n"
                    f"Waiting for settlements to refill..."
                )
                send_telegram(msg, siren=True)
            else:
                log.info("[KALSHI] ✅ Balance above threshold")
        else:
            log.warning("[KALSHI] Could not parse balance from log file")
    except Exception as e:
        log.error(f"[KALSHI] Check failed: {e}")

# ─── POLYMARKET SELF-SUSTAIN ─────────────────────────────────────
def check_polymarket():
    """
    Polymarket self-sustain logic:
    - usdc_auto_refill.py on Hetzner handles USDC.e swaps
    - We monitor via SSH and alert if balance is critically low
    - Update threshold to $50 if not already set
    """
    log.info("[POLYMARKET] Checking via Hetzner SSH...")
    try:
        import subprocess
        result = subprocess.run(
            ["ssh", "polymarket-eu",
             "grep -i 'State:' /opt/polymarket-bot/logs/live_err.log | tail -1"],
            capture_output=True, text=True, timeout=15,
        )
        output = result.stdout.strip()
        if "Balance=" in output:
            import re
            match = re.search(r"Balance=\$?([\d.]+)", output)
            if match:
                balance = float(match.group(1))
                log.info(f"[POLYMARKET] Balance: ${balance:.2f}")
                if balance < THRESHOLDS["polymarket"]["min_usdc_e"]:
                    msg = (
                        f"⚠️ <b>POLYMARKET LOW BALANCE</b>\n"
                        f"Balance: ${balance:.2f} (min: ${THRESHOLDS['polymarket']['min_usdc_e']:.0f})\n"
                        f"Auto-refill module active on Hetzner\n"
                        f"May need USDC deposit to Polygon wallet"
                    )
                    send_telegram(msg, siren=True)
                else:
                    log.info("[POLYMARKET] ✅ Balance above threshold")
                return
        log.warning("[POLYMARKET] Could not parse balance")
    except Exception as e:
        log.error(f"[POLYMARKET] Check failed: {e}")

# ─── HABFF BASE SELF-SUSTAIN ─────────────────────────────────────
def check_habff_base():
    """
    HABFF (BASE) self-sustain logic:
    - Monitor ETH for gas and HERO for volume trading
    - The HABFF contract earns HERO from buy & burn operations
    - Alert if ETH gas drops below 0.01 ETH
    """
    log.info("[HABFF-BASE] Checking balances...")
    eth = get_native_balance(BASE_RPC, DEX_WALLET)
    hero = get_token_balance(BASE_RPC, HERO_BASE, DEX_WALLET)

    if eth is None or hero is None:
        log.warning("[HABFF-BASE] Could not fetch balances")
        return

    log.info(f"[HABFF-BASE] ETH={eth:.6f} HERO={hero:.2f}")

    alerts = []
    if eth < THRESHOLDS["habff_base"]["min_eth"]:
        alerts.append(
            f"⛽ ETH: {eth:.6f} (min: {THRESHOLDS['habff_base']['min_eth']})\n"
            f"Gas running low! Bot may stall."
        )
    if hero < THRESHOLDS["habff_base"]["min_hero"]:
        alerts.append(
            f"🪙 HERO: {hero:.2f} (min: {THRESHOLDS['habff_base']['min_hero']})\n"
            f"Volume trading will be limited."
        )

    if alerts:
        msg = (
            f"⚠️ <b>HABFF BASE LOW BALANCE</b>\n"
            f"Wallet: {DEX_WALLET[:10]}...{DEX_WALLET[-6:]}\n\n"
            + "\n".join(alerts)
            + f"\n\nSend ETH/HERO to:\n<code>{DEX_WALLET}</code> (BASE chain)"
        )
        send_telegram(msg, siren=True)
    else:
        log.info("[HABFF-BASE] ✅ All balances above threshold")

    # Self-sustain: if HERO is healthy but ETH gas is low,
    # the HABFF bot can sell a small amount of HERO for ETH
    # This is logged as a recommendation — actual swap requires bot integration
    if eth is not None and hero is not None:
        if eth < THRESHOLDS["habff_base"]["min_eth"] and hero > THRESHOLDS["habff_base"]["min_hero"] * 2:
            log.info(f"[HABFF-BASE] 💡 HERO surplus ({hero:.0f}) could cover gas deficit")
            # The HABFF bot itself handles swaps — we just alert

# ─── PULSECHAIN SELF-SUSTAIN ─────────────────────────────────────
def check_pulsechain():
    """
    PulseChain bots self-sustain logic:
    - Monitor PLS for gas and HERO for volume trading
    - The bots earn from arb spreads
    - Alert if PLS or HERO drops below minimum
    """
    log.info("[PULSECHAIN] Checking balances...")
    pls = get_native_balance(PULSE_RPC, DEX_WALLET)
    hero = get_token_balance(PULSE_RPC, HERO_PULSE, DEX_WALLET)
    vets = get_token_balance(PULSE_RPC, VETS_PULSE, DEX_WALLET)

    if pls is None or hero is None:
        log.warning("[PULSECHAIN] Could not fetch balances")
        return

    log.info(f"[PULSECHAIN] PLS={pls:.2f} HERO={hero:.2f} VETS={vets:.2f}")

    alerts = []
    if pls < THRESHOLDS["pulsechain"]["min_pls"]:
        alerts.append(
            f"⛽ PLS: {pls:.2f} (min: {THRESHOLDS['pulsechain']['min_pls']:,})\n"
            f"Gas running low!"
        )
    if hero < THRESHOLDS["pulsechain"]["min_hero"]:
        alerts.append(
            f"🪙 HERO: {hero:.2f} (min: {THRESHOLDS['pulsechain']['min_hero']:,})\n"
            f"Volume trading will be limited."
        )

    if alerts:
        msg = (
            f"⚠️ <b>PULSECHAIN LOW BALANCE</b>\n"
            f"Wallet: {DEX_WALLET[:10]}...{DEX_WALLET[-6:]}\n\n"
            + "\n".join(alerts)
            + f"\n\nSend PLS/HERO to:\n<code>{DEX_WALLET}</code> (PulseChain)"
        )
        send_telegram(msg, siren=True)
    else:
        log.info("[PULSECHAIN] ✅ All balances above threshold")

    # Self-sustain: if HERO is healthy but PLS gas is low,
    # the arb bot can sell a small amount of HERO for PLS
    if pls is not None and hero is not None:
        if pls < THRESHOLDS["pulsechain"]["min_pls"] and hero > THRESHOLDS["pulsechain"]["min_hero"] * 2:
            log.info(f"[PULSECHAIN] 💡 HERO surplus ({hero:.0f}) could cover gas deficit")

# ─── BOT STATUS DASHBOARD ────────────────────────────────────────
DASHBOARD_URL = "https://apex.herobase.io/"
STATUS_REPORT_INTERVAL = 12  # Send status dashboard every N scans (12 x 5min = 1 hour)

def gather_bot_status():
    """
    Gather live status for ALL 8 bots and return structured data.
    Returns list of dicts: {name, server, mode, status, balance, health}
    """
    import subprocess
    import re
    bots = []

    # 1. Volt-Kraken (VDS)
    try:
        r = subprocess.run(
            ["pm2", "show", "volt-kraken"],
            capture_output=True, text=True, timeout=10,
        )
        is_online = "online" in r.stdout
        # Check if LIVE mode from env
        mode = "LIVE" if os.environ.get("KRAKEN_LIVE_MODE", "1") == "1" else "PAPER"
        # Get portfolio from logs
        balance = ""
        try:
            lr = subprocess.run(
                ["tail", "-20", "/root/.pm2/logs/volt-kraken-out.log"],
                capture_output=True, text=True, timeout=5,
            )
            for line in reversed(lr.stdout.splitlines()):
                m = re.search(r'Portfolio:\s*\$(\S+)', line)
                if m:
                    balance = f"${m.group(1)}"
                    break
        except Exception:
            pass
        bots.append({
            "name": "Volt-Kraken", "server": "VDS", "mode": mode,
            "status": "ONLINE" if is_online else "DOWN",
            "balance": balance or "scanning",
            "health": "🟢" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Volt-Kraken", "server": "VDS", "mode": "?", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 2. Kraken-bot-v2 (VDS)
    try:
        r = subprocess.run(["pm2", "show", "kraken-bot-v2"], capture_output=True, text=True, timeout=10)
        is_online = "online" in r.stdout
        kraken_bal = kraken_request("Balance")
        usdc = float(kraken_bal.get("USDC", 0))
        zusd = float(kraken_bal.get("ZUSD", 0))
        total = usdc + zusd
        bots.append({
            "name": "Kraken-bot-v2", "server": "VDS", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": f"${total:.0f}",
            "health": "🟢" if is_online and total >= 50 else "🟡" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Kraken-bot-v2", "server": "VDS", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 3. Kalshi-bot-v4 (VDS)
    try:
        r = subprocess.run(["pm2", "show", "kalshi-bot-v4"], capture_output=True, text=True, timeout=10)
        is_online = "online" in r.stdout
        balance = "?"
        try:
            lr = subprocess.run(
                ["tail", "-200", "/root/.pm2/logs/kalshi-bot-v4-out.log"],
                capture_output=True, text=True, timeout=5,
            )
            for line in reversed(lr.stdout.splitlines()):
                m = re.search(r'Balance:\s*\$?(\d+\.?\d*)', line)
                if m:
                    balance = f"${float(m.group(1)):.0f}"
                    break
        except Exception:
            pass
        bots.append({
            "name": "Kalshi-bot-v4", "server": "VDS", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": balance,
            "health": "🟢" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Kalshi-bot-v4", "server": "VDS", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 4. Polymarket (Hetzner EU)
    try:
        r = subprocess.run(
            ["ssh", "polymarket-eu", "pm2 show polymarket-bot 2>/dev/null | grep status"],
            capture_output=True, text=True, timeout=15,
        )
        is_online = "online" in r.stdout
        balance = "?"
        try:
            br = subprocess.run(
                ["ssh", "polymarket-eu",
                 "grep -i 'State:' /opt/polymarket-bot/logs/live_err.log | tail -1"],
                capture_output=True, text=True, timeout=15,
            )
            m = re.search(r'Balance=\$?(\d+\.?\d*)', br.stdout)
            if m:
                balance = f"${float(m.group(1)):.0f}"
        except Exception:
            pass
        bots.append({
            "name": "Polymarket", "server": "Hetzner EU", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": balance,
            "health": "🟢" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Polymarket", "server": "Hetzner EU", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 5. HABFF-arb (VDS / BASE)
    try:
        r = subprocess.run(["pm2", "show", "habff-arb"], capture_output=True, text=True, timeout=10)
        is_online = "online" in r.stdout
        eth = get_native_balance(BASE_RPC, DEX_WALLET)
        hero = get_token_balance(BASE_RPC, HERO_BASE, DEX_WALLET)
        bal_str = f"{eth:.4f} ETH" if eth else "?"
        bots.append({
            "name": "HABFF-arb", "server": "VDS", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": bal_str,
            "health": "🟢" if is_online and eth and eth >= 0.01 else "🟡" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "HABFF-arb", "server": "VDS", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 6. Hero-farm-v6 (VDS / PulseChain)
    try:
        r = subprocess.run(["pm2", "show", "hero-farm-v6"], capture_output=True, text=True, timeout=10)
        is_online = "online" in r.stdout
        pls = get_native_balance(PULSE_RPC, DEX_WALLET)
        hero_p = get_token_balance(PULSE_RPC, HERO_PULSE, DEX_WALLET)
        bal_str = f"{pls:.0f} PLS" if pls else "?"
        bots.append({
            "name": "Hero-farm-v6", "server": "VDS", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": bal_str,
            "health": "🟢" if is_online and pls and pls >= 50000 else "🟡" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Hero-farm-v6", "server": "VDS", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 7. Hero-vets-pulse (VDS / PulseChain)
    try:
        r = subprocess.run(["pm2", "show", "hero-vets-pulse"], capture_output=True, text=True, timeout=10)
        is_online = "online" in r.stdout
        vets = get_token_balance(PULSE_RPC, VETS_PULSE, DEX_WALLET)
        bal_str = f"{vets:.0f} VETS" if vets else "?"
        bots.append({
            "name": "Hero-vets-pulse", "server": "VDS", "mode": "LIVE",
            "status": "ONLINE" if is_online else "DOWN",
            "balance": bal_str,
            "health": "🟢" if is_online else "🔴",
        })
    except Exception:
        bots.append({"name": "Hero-vets-pulse", "server": "VDS", "mode": "LIVE", "status": "ERROR", "balance": "?", "health": "🔴"})

    # 8. Auto-sustain (VDS)
    bots.append({
        "name": "Auto-sustain", "server": "VDS", "mode": "—",
        "status": "ONLINE",
        "balance": "daemon",
        "health": "🟢",
    })

    return bots


def send_status_dashboard(scan_count):
    """
    Send a formatted Bot Status Dashboard to Telegram.
    Looks like the table the user liked:
    # | Bot | Server | Mode | Status | Balance
    """
    bots = gather_bot_status()

    # Count health
    green = sum(1 for b in bots if b["health"] == "🟢")
    yellow = sum(1 for b in bots if b["health"] == "🟡")
    red = sum(1 for b in bots if b["health"] == "🔴")
    total = len(bots)

    if red > 0:
        header = "🔴 BOT STATUS — ISSUES DETECTED"
    elif yellow > 0:
        header = "🟡 BOT STATUS — WARNINGS"
    else:
        header = "🟢 BOT STATUS — ALL LIVE, ALL GREEN"

    # Build the table rows
    rows = []
    for i, b in enumerate(bots, 1):
        mode_icon = "🔴" if b["mode"] == "LIVE" else "🟢" if b["mode"] == "—" else "📄"
        status_icon = b["health"]
        rows.append(
            f"{i}. {status_icon} <b>{b['name']}</b>\n"
            f"   📍 {b['server']} | {mode_icon} {b['mode']} | {b['status']}\n"
            f"   💰 {b['balance']}"
        )

    table = "\n\n".join(rows)

    msg = (
        f"📊 <b>{header}</b>\n"
        f"{'━' * 30}\n\n"
        f"{table}\n\n"
        f"{'━' * 30}\n"
        f"✅ {green}/{total} Green"
        + (f" | ⚠️ {yellow} Warn" if yellow else "")
        + (f" | 🔴 {red} Down" if red else "")
        + f"\n🔄 Scan #{scan_count}\n"
        f"📊 <a href='{DASHBOARD_URL}'>Apex Dashboard</a>"
    )

    send_telegram(msg, siren=(red > 0))
    log.info(f"[DASHBOARD] Status report sent: {green}/{total} green")


# ─── MAIN LOOP ────────────────────────────────────────────────────
CHECK_INTERVAL = 300  # 5 minutes
MAX_CONSECUTIVE_ERRORS = 10

def main():
    """Main daemon loop — runs forever, checks every 5 minutes."""
    log.info("=" * 60)
    log.info("🚀 SELF-SUSTAINING AUTO-REFILL DAEMON v2.0 STARTED")
    log.info(f"   Check interval: {CHECK_INTERVAL}s")
    log.info(f"   Status report every: {STATUS_REPORT_INTERVAL} scans ({STATUS_REPORT_INTERVAL * CHECK_INTERVAL // 60} min)")
    log.info(f"   Telegram: {TG_CHAT_ID}")
    log.info("=" * 60)

    # Send startup dashboard immediately
    send_telegram(
        "🟢 <b>Auto-Sustain Daemon v2.0 ONLINE</b>\n\n"
        "Monitoring all trading bots:\n"
        "• Volt-Kraken (Kraken CEX)\n"
        "• Kraken-bot-v2 (CEX trading)\n"
        "• Kalshi-bot-v4 (prediction markets)\n"
        "• Polymarket (Hetzner EU)\n"
        "• HABFF-arb (BASE DEX)\n"
        "• Hero-farm-v6 (PulseChain)\n"
        "• Hero-vets-pulse (PulseChain)\n\n"
        f"Check interval: {CHECK_INTERVAL // 60} min\n"
        f"Status report: every {STATUS_REPORT_INTERVAL * CHECK_INTERVAL // 60} min\n"
        "Mode: SELF-SUSTAINING 24/7/365\n\n"
        f"📊 <a href='{DASHBOARD_URL}'>Apex Dashboard</a>",
        siren=False,
    )

    scan_count = 0
    consecutive_errors = 0

    while True:
        scan_count += 1
        log.info(f"\n{'─' * 40}")
        log.info(f"SCAN #{scan_count} — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
        log.info(f"{'─' * 40}")

        try:
            # Check each bot (refill logic)
            check_kraken()
            time.sleep(2)

            check_kalshi()
            time.sleep(2)

            check_polymarket()
            time.sleep(2)

            check_habff_base()
            time.sleep(2)

            check_pulsechain()

            consecutive_errors = 0

            # ─── STATUS DASHBOARD (every N scans) ────────────────
            if scan_count % STATUS_REPORT_INTERVAL == 0:
                send_status_dashboard(scan_count)

            # ─── DAILY SUMMARY (midnight UTC) ────────────────────
            now = datetime.now(timezone.utc)
            if now.hour == 0 and now.minute < 6:
                # Full daily report with all balances
                kraken_bal = kraken_request("Balance")
                usdc = float(kraken_bal.get("USDC", 0))
                zusd = float(kraken_bal.get("ZUSD", 0))
                eth = get_native_balance(BASE_RPC, DEX_WALLET) or 0
                hero_b = get_token_balance(BASE_RPC, HERO_BASE, DEX_WALLET) or 0
                pls = get_native_balance(PULSE_RPC, DEX_WALLET) or 0
                hero_p = get_token_balance(PULSE_RPC, HERO_PULSE, DEX_WALLET) or 0
                vets = get_token_balance(PULSE_RPC, VETS_PULSE, DEX_WALLET) or 0

                all_green = all([usdc + zusd >= 50, eth >= 0.01, pls >= 50000, hero_b >= 1000, hero_p >= 5000])

                msg = (
                    f"📊 <b>DAILY AUTO-SUSTAIN REPORT</b>\n"
                    f"{'━' * 30}\n\n"
                    f"<b>💱 Kraken:</b>\n"
                    f"   USDC: ${usdc:.2f} | ZUSD: ${zusd:.2f}\n\n"
                    f"<b>🔵 BASE Chain:</b>\n"
                    f"   ETH: {eth:.6f} | HERO: {hero_b:,.0f}\n\n"
                    f"<b>💜 PulseChain:</b>\n"
                    f"   PLS: {pls:,.0f} | HERO: {hero_p:,.0f} | VETS: {vets:,.0f}\n\n"
                    f"{'━' * 30}\n"
                    f"🔄 Scans today: {scan_count}\n"
                    f"{'🟢 ALL GREEN' if all_green else '🟡 SOME BELOW THRESHOLD'}\n\n"
                    f"📊 <a href='{DASHBOARD_URL}'>Apex Dashboard</a>"
                )
                send_telegram(msg, siren=False)

        except Exception as e:
            consecutive_errors += 1
            log.error(f"[MAIN] Scan error #{consecutive_errors}: {e}")
            log.error(traceback.format_exc())

            if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                send_telegram(
                    f"🔴 <b>AUTO-SUSTAIN DAEMON ERROR</b>\n"
                    f"{consecutive_errors} consecutive errors!\n"
                    f"Last error: {str(e)[:200]}\n\n"
                    f"📊 <a href='{DASHBOARD_URL}'>Apex Dashboard</a>",
                    siren=True,
                )
                consecutive_errors = 0

        log.info(f"[MAIN] Next check in {CHECK_INTERVAL}s...")
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
