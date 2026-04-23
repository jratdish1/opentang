#!/usr/bin/env python3
"""
Goldsky Subgraph Whale Analysis Module
========================================
Integrates Polymarket's Goldsky orderbook subgraph with the whale scanner
for deeper wallet analysis: trade history, PnL verification, trade frequency,
market preferences, and smart-money flow detection.

Goldsky Endpoint: Polymarket orderbook-subgraph (orderFilledEvents)
Integrates with: poly_upgrades.py whale scanner + whale_copy_trader.py

Author: Manus AI for VETS
Version: 1.0.0
"""
import os
import json
import time
import logging
import requests
from datetime import datetime, timezone, timedelta
from collections import defaultdict

log = logging.getLogger("goldsky_whale")

# ─── CONFIG ─────────────────────────────────────────────────────────
GOLDSKY_URL = "https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/orderbook-subgraph/0.0.1/gn"
CACHE_DIR = "/opt/polymarket-bot/state"
GOLDSKY_CACHE_FILE = os.path.join(CACHE_DIR, "goldsky_whale_analysis.json")
GOLDSKY_CACHE_TTL = 7200  # 2 hours

# ─── GOLDSKY GRAPHQL QUERIES ───────────────────────────────────────

def query_goldsky(where_clause, first=1000, timeout=30):
    """Execute a Goldsky GraphQL query for orderFilledEvents."""
    query = f'''{{
        orderFilledEvents(
            orderBy: timestamp, orderDirection: desc,
            first: {first},
            where: {{{where_clause}}}
        ) {{
            id timestamp maker makerAmountFilled makerAssetId
            taker takerAmountFilled takerAssetId transactionHash
        }}
    }}'''
    
    for attempt in range(3):
        try:
            resp = requests.post(GOLDSKY_URL, json={"query": query}, timeout=timeout)
            resp.raise_for_status()
            data = resp.json()
            if "errors" in data:
                log.warning(f"Goldsky query error: {data['errors']}")
                return []
            return data.get("data", {}).get("orderFilledEvents", [])
        except Exception as e:
            log.warning(f"Goldsky query attempt {attempt+1}/3 failed: {e}")
            time.sleep(2 ** attempt)
    return []


def get_wallet_trades(wallet_address, lookback_hours=168, limit=1000):
    """
    Fetch recent trades for a wallet from Goldsky subgraph.
    Returns trades where wallet is either maker or taker.
    Default lookback: 7 days (168 hours).
    """
    cutoff_ts = int((datetime.now(timezone.utc) - timedelta(hours=lookback_hours)).timestamp())
    
    # Query as maker
    maker_trades = query_goldsky(
        f'maker: "{wallet_address.lower()}", timestamp_gte: "{cutoff_ts}"',
        first=limit
    )
    
    # Query as taker
    taker_trades = query_goldsky(
        f'taker: "{wallet_address.lower()}", timestamp_gte: "{cutoff_ts}"',
        first=limit
    )
    
    return {
        "maker_trades": maker_trades,
        "taker_trades": taker_trades,
        "total_trades": len(maker_trades) + len(taker_trades),
        "as_maker": len(maker_trades),
        "as_taker": len(taker_trades),
    }


def analyze_wallet_activity(wallet_address, lookback_hours=168):
    """
    Deep analysis of a whale wallet's trading activity via Goldsky.
    
    Returns:
    - trade_frequency: trades per day
    - avg_trade_size: average USDC per trade
    - market_concentration: how many unique markets they trade
    - maker_ratio: % of trades where they're the maker (market maker behavior)
    - recent_momentum: are they buying or selling more recently?
    - active_hours: what hours (UTC) they're most active
    """
    trades = get_wallet_trades(wallet_address, lookback_hours)
    
    if trades["total_trades"] == 0:
        return {
            "wallet": wallet_address[:10] + "...",
            "status": "no_trades_found",
            "trade_frequency": 0,
            "confidence_score": 0,
        }
    
    all_trades = trades["maker_trades"] + trades["taker_trades"]
    
    # Parse timestamps
    timestamps = []
    trade_sizes = []
    asset_ids = set()
    hourly_activity = defaultdict(int)
    buy_volume = 0
    sell_volume = 0
    
    for t in all_trades:
        try:
            ts = int(t.get("timestamp", 0))
            timestamps.append(ts)
            
            # Track trade sizes (taker amount = USDC side typically)
            taker_amt = float(t.get("takerAmountFilled", 0)) / 1e6  # USDC has 6 decimals
            maker_amt = float(t.get("makerAmountFilled", 0)) / 1e6
            trade_size = max(taker_amt, maker_amt)
            trade_sizes.append(trade_size)
            
            # Track unique markets (asset IDs)
            asset_ids.add(t.get("makerAssetId", ""))
            asset_ids.add(t.get("takerAssetId", ""))
            
            # Track hourly activity
            hour = datetime.fromtimestamp(ts, tz=timezone.utc).hour
            hourly_activity[hour] += 1
            
            # Track buy/sell momentum (simplified: maker = selling, taker = buying)
            if t.get("maker", "").lower() == wallet_address.lower():
                sell_volume += trade_size
            else:
                buy_volume += trade_size
                
        except (ValueError, TypeError):
            continue
    
    if not timestamps:
        return {
            "wallet": wallet_address[:10] + "...",
            "status": "parse_error",
            "confidence_score": 0,
        }
    
    # Calculate metrics
    time_span_days = max((max(timestamps) - min(timestamps)) / 86400, 1)
    trade_frequency = len(all_trades) / time_span_days
    avg_trade_size = sum(trade_sizes) / len(trade_sizes) if trade_sizes else 0
    maker_ratio = trades["as_maker"] / trades["total_trades"]
    
    # Market concentration (unique asset IDs, excluding empty)
    unique_markets = len([a for a in asset_ids if a])
    
    # Peak trading hours
    peak_hours = sorted(hourly_activity.items(), key=lambda x: -x[1])[:3]
    
    # Recent momentum (last 24h vs previous period)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    recent_cutoff = now_ts - 86400
    recent_trades = [t for t in all_trades if int(t.get("timestamp", 0)) > recent_cutoff]
    older_trades = [t for t in all_trades if int(t.get("timestamp", 0)) <= recent_cutoff]
    
    recent_rate = len(recent_trades)  # trades in last 24h
    older_rate = len(older_trades) / max(time_span_days - 1, 1)  # avg daily before
    
    momentum = "accelerating" if recent_rate > older_rate * 1.5 else \
               "decelerating" if recent_rate < older_rate * 0.5 else "steady"
    
    # Net direction
    total_volume = buy_volume + sell_volume
    net_direction = "net_buyer" if buy_volume > sell_volume * 1.1 else \
                    "net_seller" if sell_volume > buy_volume * 1.1 else "neutral"
    
    # Confidence score (0-1): higher = more reliable whale signal
    confidence = 0.0
    if trade_frequency > 5:  # Active trader
        confidence += 0.3
    elif trade_frequency > 1:
        confidence += 0.15
    if avg_trade_size > 100:  # Significant size
        confidence += 0.3
    elif avg_trade_size > 10:
        confidence += 0.15
    if unique_markets > 5:  # Diversified
        confidence += 0.2
    if maker_ratio > 0.3:  # Market maker behavior = sophisticated
        confidence += 0.2
    
    return {
        "wallet": wallet_address[:10] + "...",
        "status": "analyzed",
        "trade_frequency": round(trade_frequency, 1),
        "avg_trade_size_usdc": round(avg_trade_size, 2),
        "total_trades": trades["total_trades"],
        "unique_markets": unique_markets,
        "maker_ratio": round(maker_ratio, 3),
        "peak_hours_utc": [h[0] for h in peak_hours],
        "momentum": momentum,
        "net_direction": net_direction,
        "buy_volume_usdc": round(buy_volume, 2),
        "sell_volume_usdc": round(sell_volume, 2),
        "confidence_score": round(min(confidence, 1.0), 2),
    }


def get_market_whale_flow(asset_id, lookback_hours=24, limit=500):
    """
    Analyze whale flow for a specific market/asset.
    Shows if smart money is buying or selling.
    
    Returns:
    - total_volume: total USDC volume
    - unique_traders: number of unique addresses
    - large_trades: trades > $500 USDC
    - net_flow: buy vs sell pressure
    """
    cutoff_ts = int((datetime.now(timezone.utc) - timedelta(hours=lookback_hours)).timestamp())
    
    # Get trades involving this asset
    maker_side = query_goldsky(
        f'makerAssetId: "{asset_id}", timestamp_gte: "{cutoff_ts}"',
        first=limit
    )
    taker_side = query_goldsky(
        f'takerAssetId: "{asset_id}", timestamp_gte: "{cutoff_ts}"',
        first=limit
    )
    
    all_trades = maker_side + taker_side
    
    if not all_trades:
        return {
            "asset_id": asset_id[:10] + "...",
            "status": "no_activity",
            "total_volume": 0,
        }
    
    unique_makers = set()
    unique_takers = set()
    total_volume = 0
    large_trades = 0
    
    for t in all_trades:
        unique_makers.add(t.get("maker", ""))
        unique_takers.add(t.get("taker", ""))
        
        taker_amt = float(t.get("takerAmountFilled", 0)) / 1e6
        maker_amt = float(t.get("makerAmountFilled", 0)) / 1e6
        trade_vol = max(taker_amt, maker_amt)
        total_volume += trade_vol
        
        if trade_vol > 500:
            large_trades += 1
    
    unique_traders = len(unique_makers | unique_takers)
    
    return {
        "asset_id": asset_id[:10] + "...",
        "status": "active",
        "total_volume_usdc": round(total_volume, 2),
        "trade_count": len(all_trades),
        "unique_traders": unique_traders,
        "large_trades_gt500": large_trades,
        "large_trade_pct": round(large_trades / max(len(all_trades), 1) * 100, 1),
        "avg_trade_size": round(total_volume / max(len(all_trades), 1), 2),
    }


# ─── ENHANCED WHALE SCANNER (replaces basic scan) ──────────────────

def enhanced_whale_scan(whale_wallets, top_n=20):
    """
    Enhanced whale scan using Goldsky subgraph for deeper analysis.
    Takes a list of whale wallet addresses and returns enriched profiles.
    
    Integrates with poly_upgrades.py scan_top_whales().
    """
    log.info(f"Running Goldsky-enhanced whale scan on {len(whale_wallets)} wallets...")
    
    results = {}
    for i, wallet in enumerate(whale_wallets[:top_n]):
        try:
            analysis = analyze_wallet_activity(wallet, lookback_hours=168)
            results[wallet] = analysis
            log.info(f"  [{i+1}/{min(len(whale_wallets), top_n)}] {analysis.get('wallet', '?')} "
                     f"— {analysis.get('total_trades', 0)} trades, "
                     f"confidence={analysis.get('confidence_score', 0)}")
            time.sleep(1)  # Rate limit Goldsky
        except Exception as e:
            log.warning(f"  [{i+1}] Error analyzing {wallet[:10]}...: {e}")
            results[wallet] = {"wallet": wallet[:10] + "...", "status": "error", "confidence_score": 0}
    
    # Save to cache
    cache = {
        "analyses": results,
        "scan_time": datetime.now(timezone.utc).isoformat(),
        "updated": time.time(),
    }
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(GOLDSKY_CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
        log.info(f"Goldsky analysis cached: {len(results)} wallets")
    except Exception as e:
        log.warning(f"Cache save error: {e}")
    
    return results


def get_goldsky_confidence(wallet_address):
    """
    Quick lookup: get Goldsky-derived confidence score for a whale.
    Used by consensus_filter in poly_upgrades.py to weight whale signals.
    
    Returns float 0-1, or None if not cached.
    """
    try:
        if os.path.exists(GOLDSKY_CACHE_FILE):
            with open(GOLDSKY_CACHE_FILE) as f:
                cache = json.load(f)
            if time.time() - cache.get("updated", 0) < GOLDSKY_CACHE_TTL:
                analysis = cache.get("analyses", {}).get(wallet_address, {})
                return analysis.get("confidence_score")
    except Exception:
        pass
    return None


def get_market_smart_money_signal(asset_id):
    """
    Quick check: is smart money flowing into or out of a market?
    Used by the bot before placing trades.
    
    Returns: "bullish", "bearish", or "neutral"
    """
    flow = get_market_whale_flow(asset_id, lookback_hours=6)
    
    if flow.get("status") != "active":
        return "neutral"
    
    # If >30% of trades are large ($500+), smart money is active
    if flow.get("large_trade_pct", 0) > 30:
        if flow.get("avg_trade_size", 0) > 200:
            return "bullish"  # Big money flowing in
    
    if flow.get("trade_count", 0) < 5:
        return "neutral"  # Not enough data
    
    return "neutral"


# ─── STANDALONE TEST ────────────────────────────────────────────────

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    
    print("=" * 60)
    print("Goldsky Whale Analysis Module — Test Run")
    print("=" * 60)
    
    # Test with a known whale wallet (kch123)
    test_wallet = "0x6a72f61820b26b1fe4d956e17b6dc2a1ea3033ee"
    print(f"\nAnalyzing wallet: {test_wallet[:10]}...")
    
    result = analyze_wallet_activity(test_wallet, lookback_hours=48)
    print(json.dumps(result, indent=2))
    
    print("\n✅ Goldsky integration module ready")
    print("Endpoint:", GOLDSKY_URL[:60] + "...")
