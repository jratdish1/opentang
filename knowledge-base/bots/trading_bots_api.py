#!/usr/bin/env python3
"""
Trading Bots Data API — Serves live bot data for the mining dashboard
=====================================================================
Endpoints (added to mining_telemetry_api.py):
  GET /api/bots              → All bot statuses, balances, P&L
  GET /api/bots/history      → P&L history for charts (daily/weekly/monthly)
  GET /api/bots/trades       → Recent trades across all bots
  GET /api/bots/alerts       → Active alerts and warnings

Reads data from:
  - pm2 process list (uptime, restarts, status)
  - On-chain balances (ETH, PLS, HERO, AERO via RPC)
  - Kraken API (USD balance, positions)
  - Log files (trade history, P&L tracking)
  - Auto-sustain daemon state files

Author: Manus AI for VETS
"""
import json
import os
import time
import subprocess
import logging
from datetime import datetime, timezone, timedelta

# Load env vars from .env_architecture
import os as _os
_env_file = "/root/.env_architecture"
if _os.path.exists(_env_file):
    with open(_env_file) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                _v = _v.strip(chr(34)).strip("'")
                _os.environ.setdefault(_k.strip(), _v)


log = logging.getLogger("trading_bots")

# ─── CONFIG ──────────────────────────────────────────────────
CACHE_TTL = 60  # Cache bot data for 60 seconds
_cache = {}

# Bot definitions
BOTS = {
    "kraken": {
        "name": "Kraken Bot v2",
        "platform": "Kraken",
        "chain": "CEX",
        "pm2_name": "kraken-bot-v2",
        "type": "market_maker",
    },
    "volt_kraken": {
        "name": "Volt-Kraken",
        "platform": "Kraken",
        "chain": "CEX",
        "pm2_name": "volt-kraken",
        "type": "volatility",
    },
    "kalshi": {
        "name": "Kalshi Bot v4",
        "platform": "Kalshi",
        "chain": "CEX",
        "pm2_name": "kalshi-bot-v4",
        "type": "prediction",
    },
    "polymarket": {
        "name": "Polymarket Bot",
        "platform": "Polymarket",
        "chain": "Polygon",
        "pm2_name": "polymarket-bot",
        "type": "prediction",
    },
    "habff_arb": {
        "name": "HABFF Arb",
        "platform": "Aerodrome/Uniswap",
        "chain": "BASE",
        "pm2_name": "habff-arb",
        "type": "arbitrage",
    },
    "hero_farm": {
        "name": "HERO Farm v6",
        "platform": "PulseX/Uniswap",
        "chain": "PulseChain/BASE",
        "pm2_name": "hero-farm-v6",
        "type": "farming",
    },
    "hero_vets_pulse": {
        "name": "HERO-VETS Pulse",
        "platform": "PulseX",
        "chain": "PulseChain",
        "pm2_name": "hero-vets-pulse",
        "type": "liquidity",
    },
}

# P&L history file
PNL_HISTORY_FILE = "/opt/apex-agent/data/pnl_history.json"
TRADES_LOG_FILE = "/opt/apex-agent/data/trades_log.json"


def _get_cached(key, ttl=CACHE_TTL):
    """Get cached data if still valid."""
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < ttl:
            return data
    return None


def _set_cache(key, data):
    """Cache data with timestamp."""
    _cache[key] = (time.time(), data)


def _get_pm2_status():
    """Get pm2 process status for all bots."""
    try:
        result = subprocess.run(
            ["pm2", "jlist"], capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            processes = json.loads(result.stdout)
            return {p["name"]: p for p in processes}
    except Exception as e:
        log.error(f"pm2 error: {e}")
    return {}


def _get_onchain_balances():
    """Get on-chain balances for BASE and PulseChain wallets."""
    cached = _get_cached("onchain_balances", ttl=120)
    if cached:
        return cached

    wallet = "0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6"
    balances = {}

    try:
        from web3 import Web3

        # BASE chain
        for rpc in ["https://base-rpc.publicnode.com", "https://mainnet.base.org"]:
            try:
                w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 10}))
                if w3.is_connected():
                    eth_bal = w3.eth.get_balance(Web3.to_checksum_address(wallet)) / 1e18
                    balances["base_eth"] = round(eth_bal, 6)

                    # AERO balance
                    erc20_abi = json.loads('[{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')
                    aero = w3.eth.contract(
                        address=Web3.to_checksum_address("0x940181a94A35A4569E4529A3CDfB74e38FD98631"),
                        abi=erc20_abi
                    )
                    balances["base_aero"] = round(aero.functions.balanceOf(Web3.to_checksum_address(wallet)).call() / 1e18, 2)

                    hero = w3.eth.contract(
                        address=Web3.to_checksum_address("0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8"),
                        abi=erc20_abi
                    )
                    balances["base_hero"] = round(hero.functions.balanceOf(Web3.to_checksum_address(wallet)).call() / 1e18, 0)
                    break
            except Exception:
                continue

        time.sleep(0.5)

        # PulseChain
        for rpc in ["https://rpc.pulsechain.com", "https://pulsechain-rpc.publicnode.com"]:
            try:
                w3p = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 10}))
                if w3p.is_connected():
                    pls_bal = w3p.eth.get_balance(Web3.to_checksum_address(wallet)) / 1e18
                    balances["pulse_pls"] = round(pls_bal, 2)

                    erc20_abi = json.loads('[{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')
                    hero_pulse = w3p.eth.contract(
                        address=Web3.to_checksum_address("0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27"),
                        abi=erc20_abi
                    )
                    balances["pulse_hero"] = round(hero_pulse.functions.balanceOf(Web3.to_checksum_address(wallet)).call() / 1e18, 0)
                    break
            except Exception:
                continue

    except ImportError:
        log.warning("web3 not available for on-chain balances")
    except Exception as e:
        log.error(f"On-chain balance error: {e}")

    _set_cache("onchain_balances", balances)
    return balances


def _get_kraken_balance():
    """Get Kraken account balance."""
    cached = _get_cached("kraken_balance", ttl=120)
    if cached:
        return cached

    try:
        import urllib.request
        import hashlib
        import hmac
        import base64

        api_key = api_secret = None
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
            return {"usd": 0, "error": "No API keys"}

        nonce = str(int(time.time() * 1000))
        uri_path = "/0/private/Balance"
        postdata = f"nonce={nonce}"
        encoded = (nonce + postdata).encode()
        message = uri_path.encode() + __import__("hashlib").sha256(encoded).digest()
        secret_padded = api_secret + "=" * (4 - len(api_secret) % 4) if len(api_secret) % 4 else api_secret
        mac = hmac.new(base64.b64decode(secret_padded), message, hashlib.sha512)
        sigdigest = base64.b64encode(mac.digest()).decode()

        req = urllib.request.Request(
            f"https://api.kraken.com{uri_path}",
            data=postdata.encode(),
            headers={"API-Key": api_key, "API-Sign": sigdigest, "Content-Type": "application/x-www-form-urlencoded"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())

        balances = result.get("result", {})
        usd = float(balances.get("ZUSD", 0))
        total = usd
        # Add crypto values (rough estimates)
        for asset, bal in balances.items():
            if asset != "ZUSD" and float(bal) > 0:
                total += float(bal) * 0.01  # Placeholder

        data = {"usd": round(usd, 2), "total_usd": round(total, 2), "assets": balances}
        _set_cache("kraken_balance", data)
        return data
    except Exception as e:
        log.error(f"Kraken balance error: {e}")
        return {"usd": 0, "error": str(e)}


def get_all_bots():
    """Get comprehensive status for all trading bots."""
    cached = _get_cached("all_bots", ttl=30)
    if cached:
        return cached

    pm2 = _get_pm2_status()
    onchain = _get_onchain_balances()
    kraken = _get_kraken_balance()

    bots = []
    for bot_id, config in BOTS.items():
        pm2_info = pm2.get(config["pm2_name"], {})
        pm2_env = pm2_info.get("pm2_env", {})

        status = "offline"
        uptime = 0
        restarts = 0
        if pm2_info:
            status = pm2_env.get("status", "unknown")
            uptime_ms = pm2_env.get("pm_uptime", 0)
            if uptime_ms:
                uptime = int((time.time() * 1000 - uptime_ms) / 1000)
            restarts = pm2_env.get("restart_time", 0)

        bot_data = {
            "id": bot_id,
            "name": config["name"],
            "platform": config["platform"],
            "chain": config["chain"],
            "type": config["type"],
            "status": "online" if status == "online" else "offline",
            "uptime_seconds": uptime,
            "restarts": restarts,
            "balances": {},
            "gas_status": "ok",
            "gas_level": 1.0,
        }

        # Add specific balances
        if bot_id == "kraken" or bot_id == "volt_kraken":
            bot_data["balances"]["usd"] = kraken.get("usd", 0)
            bot_data["gas_status"] = "ok" if kraken.get("usd", 0) >= 60 else "low"
            bot_data["gas_level"] = min(1.0, kraken.get("usd", 0) / 60)

        elif bot_id == "habff_arb":
            bot_data["balances"]["eth"] = onchain.get("base_eth", 0)
            bot_data["balances"]["aero"] = onchain.get("base_aero", 0)
            bot_data["balances"]["hero"] = onchain.get("base_hero", 0)
            eth = onchain.get("base_eth", 0)
            bot_data["gas_status"] = "ok" if eth >= 0.01 else ("low" if eth >= 0.005 else "critical")
            bot_data["gas_level"] = min(1.0, eth / 0.02)

        elif bot_id in ("hero_farm", "hero_vets_pulse"):
            bot_data["balances"]["pls"] = onchain.get("pulse_pls", 0)
            bot_data["balances"]["hero"] = onchain.get("pulse_hero", 0)
            pls = onchain.get("pulse_pls", 0)
            bot_data["gas_status"] = "ok" if pls >= 50000 else ("low" if pls >= 25000 else "critical")
            bot_data["gas_level"] = min(1.0, pls / 100000)

        bots.append(bot_data)

    result = {
        "bots": bots,
        "summary": {
            "total_bots": len(bots),
            "online": sum(1 for b in bots if b["status"] == "online"),
            "offline": sum(1 for b in bots if b["status"] == "offline"),
            "gas_warnings": sum(1 for b in bots if b["gas_status"] != "ok"),
        },
        "onchain": onchain,
        "kraken": {"usd": kraken.get("usd", 0)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    _set_cache("all_bots", result)
    return result


def get_pnl_history(period="daily"):
    """Get P&L history for charts."""
    try:
        if os.path.exists(PNL_HISTORY_FILE):
            with open(PNL_HISTORY_FILE) as f:
                history = json.load(f)
            return history.get(period, [])
    except Exception as e:
        log.error(f"P&L history error: {e}")
    return []


def get_recent_trades(limit=50):
    """Get recent trades across all bots."""
    try:
        if os.path.exists(TRADES_LOG_FILE):
            with open(TRADES_LOG_FILE) as f:
                trades = json.load(f)
            return trades[-limit:]
    except Exception as e:
        log.error(f"Trades log error: {e}")
    return []


def get_active_alerts():
    """Get active alerts from auto-sustain daemon."""
    alerts = []
    onchain = _get_onchain_balances()
    kraken = _get_kraken_balance()

    # Check gas levels
    base_eth = onchain.get("base_eth", 0)
    if base_eth < 0.01:
        alerts.append({
            "level": "critical" if base_eth < 0.005 else "warning",
            "bot": "HABFF Arb",
            "message": f"BASE ETH low: {base_eth:.6f} (min: 0.01)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    pulse_pls = onchain.get("pulse_pls", 0)
    if pulse_pls < 50000:
        alerts.append({
            "level": "critical" if pulse_pls < 25000 else "warning",
            "bot": "PulseChain",
            "message": f"PLS low: {pulse_pls:.0f} (min: 50,000)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    kraken_usd = kraken.get("usd", 0)
    if kraken_usd < 60:
        alerts.append({
            "level": "warning",
            "bot": "Kraken",
            "message": f"USD low: ${kraken_usd:.2f} (min: $60)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    return alerts


def record_pnl_snapshot():
    """Record a P&L snapshot for historical tracking. Called periodically."""
    try:
        os.makedirs(os.path.dirname(PNL_HISTORY_FILE), exist_ok=True)

        history = {}
        if os.path.exists(PNL_HISTORY_FILE):
            with open(PNL_HISTORY_FILE) as f:
                history = json.load(f)

        if "daily" not in history:
            history["daily"] = []

        bots = get_all_bots()
        snapshot = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_bots_online": bots["summary"]["online"],
            "kraken_usd": bots["kraken"]["usd"],
            "base_eth": bots["onchain"].get("base_eth", 0),
            "pulse_pls": bots["onchain"].get("pulse_pls", 0),
            "gas_warnings": bots["summary"]["gas_warnings"],
        }

        history["daily"].append(snapshot)
        # Keep last 90 days
        history["daily"] = history["daily"][-90:]

        with open(PNL_HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)

        log.info("[PNL] Snapshot recorded")
    except Exception as e:
        log.error(f"PNL snapshot error: {e}")
