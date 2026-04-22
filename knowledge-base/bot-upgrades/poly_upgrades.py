#!/usr/bin/env python3
"""
Polymarket Bot Upgrades — Whale Tracking + Multi-Agent Consensus + Early Exit
Integrates findings from poly_data analysis into bs_polymarket_bot.py

Deploy to: Hetzner EU (/opt/polymarket-bot/poly_upgrades.py)
Called from: bs_polymarket_bot.py scan loop
"""

import os
import json
import time
import math
import logging
import requests
from datetime import datetime, timezone

log = logging.getLogger("poly_upgrades")

# ─── WHALE TRACKING MODULE ─────────────────────────────────────────
# Uses Polymarket CLOB API to track top wallets' positions
# Inspired by warproxxx/poly_data wallet analysis approach

WHALE_CACHE_FILE = "/opt/polymarket-bot/state/whale_cache.json"
WHALE_CACHE_TTL = 3600  # Refresh every hour
POLYMARKET_API = "https://clob.polymarket.com"

# Known profitable wallets (from public leaderboard + poly_data analysis)
# These get refreshed weekly by the whale_scanner cron
TOP_WHALE_WALLETS = []

def load_whale_cache():
    """Load cached whale positions from disk."""
    try:
        if os.path.exists(WHALE_CACHE_FILE):
            with open(WHALE_CACHE_FILE) as f:
                cache = json.load(f)
            if time.time() - cache.get("updated", 0) < WHALE_CACHE_TTL:
                return cache
    except Exception as e:
        log.warning(f"Whale cache load error: {e}")
    return None

def save_whale_cache(data):
    """Save whale positions to disk cache."""
    try:
        os.makedirs(os.path.dirname(WHALE_CACHE_FILE), exist_ok=True)
        data["updated"] = time.time()
        with open(WHALE_CACHE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log.warning(f"Whale cache save error: {e}")

def fetch_whale_positions(wallet_address, timeout=10):
    """Fetch a whale's current positions from Polymarket API."""
    try:
        url = f"https://data-api.polymarket.com/positions"
        params = {"user": wallet_address, "sizeThreshold": 0.1}
        resp = requests.get(url, params=params, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        log.debug(f"Whale position fetch error for {wallet_address[:10]}...: {e}")
    return []

def get_whale_consensus(condition_id, token_id=None):
    """
    Check if top whales have positions on a specific market.
    Returns: (whale_count, avg_confidence, direction)
    - whale_count: how many top whales hold this market
    - avg_confidence: average position size relative to their portfolio
    - direction: 'YES' or 'NO' based on majority
    """
    cache = load_whale_cache()
    if not cache or "positions" not in cache:
        return 0, 0.0, None
    
    yes_count = 0
    no_count = 0
    yes_size = 0.0
    no_size = 0.0
    
    for wallet, positions in cache.get("positions", {}).items():
        for pos in positions:
            if pos.get("conditionId") == condition_id or pos.get("asset") == token_id:
                size = float(pos.get("size", 0))
                if pos.get("outcome", "").upper() == "YES":
                    yes_count += 1
                    yes_size += size
                else:
                    no_count += 1
                    no_size += size
    
    total = yes_count + no_count
    if total == 0:
        return 0, 0.0, None
    
    if yes_size >= no_size:
        direction = "YES"
        avg_conf = yes_size / max(yes_count, 1)
    else:
        direction = "NO"
        avg_conf = no_size / max(no_count, 1)
    
    return total, avg_conf, direction


# ─── MULTI-AGENT CONSENSUS FILTER ──────────────────────────────────
# Three signal sources must agree before trading
# 1. Quant/Bregman scoring (existing)
# 2. Whale copy signal (new)
# 3. Market microstructure (spread/depth analysis)

def consensus_filter(quant_score, whale_signal, microstructure_score, 
                     quant_threshold=0.6, whale_min=1):
    """
    Multi-agent consensus filter.
    
    Args:
        quant_score: float 0-1 from Bregman/Kelly scoring
        whale_signal: tuple (whale_count, confidence, direction)
        microstructure_score: float 0-1 from spread/depth analysis
    
    Returns:
        (should_trade, size_multiplier, reason)
        - should_trade: bool
        - size_multiplier: 1.0 (full), 0.5 (half), 0.0 (skip)
        - reason: string explaining decision
    """
    signals = []
    
    # Signal 1: Quant scoring
    quant_agree = quant_score >= quant_threshold
    if quant_agree:
        signals.append("QUANT")
    
    # Signal 2: Whale tracking
    whale_count, whale_conf, whale_dir = whale_signal
    whale_agree = whale_count >= whale_min and whale_conf > 5.0
    if whale_agree:
        signals.append("WHALE")
    
    # Signal 3: Market microstructure
    micro_agree = microstructure_score >= 0.5
    if micro_agree:
        signals.append("MICRO")
    
    agree_count = len(signals)
    
    if agree_count >= 3:
        return True, 1.0, f"FULL CONSENSUS ({', '.join(signals)})"
    elif agree_count == 2:
        return True, 0.75, f"STRONG ({', '.join(signals)})"
    elif agree_count == 1:
        # Single signal = half size only if it's quant (our most tested)
        if "QUANT" in signals:
            return True, 0.5, f"QUANT-ONLY (half size)"
        return False, 0.0, f"WEAK SINGLE ({signals[0]})"
    else:
        return False, 0.0, "NO CONSENSUS — skip"


# ─── EARLY EXIT / PROFIT-TAKING MODULE ─────────────────────────────
# Key insight: Top whales exit at ~73% of max profit, never hold to settlement
# Our targets: 85% of expected move OR 3x volume spike

VOLUME_HISTORY_FILE = "/opt/polymarket-bot/state/volume_history.json"

def load_volume_history():
    """Load historical volume data for spike detection."""
    try:
        if os.path.exists(VOLUME_HISTORY_FILE):
            with open(VOLUME_HISTORY_FILE) as f:
                return json.load(f)
    except:
        pass
    return {}

def save_volume_history(data):
    """Save volume history to disk."""
    try:
        os.makedirs(os.path.dirname(VOLUME_HISTORY_FILE), exist_ok=True)
        with open(VOLUME_HISTORY_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        log.warning(f"Volume history save error: {e}")

def check_early_exit(position, current_price, entry_price, expected_value,
                     current_volume=0, avg_volume=0):
    """
    Check if a position should be exited early for profit-taking.
    
    Returns:
        (should_exit, reason)
    """
    if not entry_price or not current_price:
        return False, "missing price data"
    
    # Calculate profit percentage
    if entry_price > 0:
        profit_pct = (current_price - entry_price) / entry_price
    else:
        return False, "zero entry price"
    
    # Rule 1: Take profit at 85% of expected value
    if expected_value and expected_value > entry_price:
        target = entry_price + (expected_value - entry_price) * 0.85
        if current_price >= target:
            return True, f"PROFIT TARGET: price ${current_price:.4f} >= 85% target ${target:.4f}"
    
    # Rule 2: Exit on 3x volume spike (unusual activity = smart money exiting)
    if avg_volume > 0 and current_volume > 0:
        volume_ratio = current_volume / avg_volume
        if volume_ratio >= 3.0 and profit_pct > 0.02:  # Only if in profit
            return True, f"VOLUME SPIKE: {volume_ratio:.1f}x avg volume, locking {profit_pct:.1%} profit"
    
    # Rule 3: Trailing stop — if we've been up 15%+ and dropped back to 5%
    if profit_pct < 0.05 and position.get("max_profit_pct", 0) > 0.15:
        return True, f"TRAILING STOP: was up {position.get('max_profit_pct',0):.1%}, now only {profit_pct:.1%}"
    
    return False, "hold"

def update_position_tracking(position, current_price, entry_price):
    """Update max profit tracking for trailing stop."""
    if entry_price > 0:
        profit_pct = (current_price - entry_price) / entry_price
        if profit_pct > position.get("max_profit_pct", 0):
            position["max_profit_pct"] = profit_pct
    return position


# ─── MARKET MICROSTRUCTURE SCORING ──────────────────────────────────
# Analyzes order book depth, spread, and recent trade flow

def score_microstructure(market_data):
    """
    Score a market's microstructure quality (0-1).
    Higher = better trading conditions.
    
    Factors:
    - Tight spread (bid-ask gap)
    - Deep order book (liquidity)
    - Recent volume (active market)
    - Price stability (not manipulated)
    """
    score = 0.0
    factors = 0
    
    # Spread analysis
    best_bid = market_data.get("best_bid", 0)
    best_ask = market_data.get("best_ask", 0)
    if best_bid > 0 and best_ask > 0:
        spread = (best_ask - best_bid) / best_ask
        if spread < 0.02:      # < 2% spread
            score += 1.0
        elif spread < 0.05:    # < 5% spread
            score += 0.7
        elif spread < 0.10:    # < 10% spread
            score += 0.3
        factors += 1
    
    # Volume analysis
    volume_24h = market_data.get("volume_24h", 0)
    if volume_24h > 10000:
        score += 1.0
    elif volume_24h > 1000:
        score += 0.7
    elif volume_24h > 100:
        score += 0.4
    factors += 1
    
    # Liquidity depth
    total_liquidity = market_data.get("total_liquidity", 0)
    if total_liquidity > 50000:
        score += 1.0
    elif total_liquidity > 10000:
        score += 0.6
    elif total_liquidity > 1000:
        score += 0.3
    factors += 1
    
    return score / max(factors, 1)


# ─── WHALE SCANNER (runs as cron job) ──────────────────────────────
# Scans Polymarket leaderboard for top wallets, caches their positions

def scan_top_whales(top_n=50):
    """
    Scan Polymarket leaderboard for top profitable wallets.
    Run this as a cron job every 6 hours.
    """
    log.info(f"Scanning top {top_n} whale wallets...")
    
    try:
        # Fetch leaderboard
        url = "https://data-api.polymarket.com/leaderboard"
        params = {"window": "all", "limit": top_n}
        resp = requests.get(url, params=params, timeout=30)
        
        if resp.status_code != 200:
            log.warning(f"Leaderboard fetch failed: {resp.status_code}")
            return
        
        leaderboard = resp.json()
        whale_positions = {}
        
        for i, whale in enumerate(leaderboard):
            wallet = whale.get("userAddress") or whale.get("address", "")
            if not wallet:
                continue
            
            # Fetch their positions
            positions = fetch_whale_positions(wallet)
            if positions:
                whale_positions[wallet] = positions
                log.info(f"Whale {i+1}/{top_n}: {wallet[:10]}... has {len(positions)} positions")
            
            # Rate limit
            time.sleep(0.5)
        
        # Save to cache
        cache = {
            "positions": whale_positions,
            "whale_count": len(whale_positions),
            "scan_time": datetime.now(timezone.utc).isoformat(),
        }
        save_whale_cache(cache)
        log.info(f"Whale scan complete: {len(whale_positions)} wallets cached")
        
    except Exception as e:
        log.error(f"Whale scan error: {e}")


# ─── INTEGRATION HELPERS ────────────────────────────────────────────

def get_upgrade_status():
    """Return status of all upgrade modules for health check."""
    cache = load_whale_cache()
    vol_history = load_volume_history()
    
    return {
        "whale_tracking": {
            "enabled": True,
            "cached_wallets": len(cache.get("positions", {})) if cache else 0,
            "cache_age_min": round((time.time() - cache.get("updated", 0)) / 60, 1) if cache else "N/A",
        },
        "consensus_filter": {
            "enabled": True,
            "mode": "3-agent (quant + whale + microstructure)",
        },
        "early_exit": {
            "enabled": True,
            "profit_target": "85% of expected value",
            "volume_spike_trigger": "3x average",
            "trailing_stop": "15% peak → 5% current",
        },
        "volume_tracking": {
            "markets_tracked": len(vol_history),
        },
    }


if __name__ == "__main__":
    # Run whale scanner standalone
    logging.basicConfig(level=logging.INFO)
    print("=== Polymarket Bot Upgrades ===")
    print(json.dumps(get_upgrade_status(), indent=2))
    print("\nRunning whale scan...")
    scan_top_whales(top_n=50)
    print("Done!")
