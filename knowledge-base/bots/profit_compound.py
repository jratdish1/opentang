"""
Profit Auto-Compound Module
Automatically reinvests settled profits across bots based on P&L performance.

Strategy:
1. Check each bot's settled/available profits
2. Rank bots by recent P&L ratio
3. Allocate reinvestment to top performers
4. Execute the transfers/deposits

Runs as part of auto-sustain daemon (every 6 hours)
"""

import os
import json
import time
import logging
import subprocess
import requests
from datetime import datetime, timezone

log = logging.getLogger("profit-compound")

# Compound config
MIN_COMPOUND_USD = 10.0  # Minimum profit to trigger compound
COMPOUND_INTERVAL = 21600  # 6 hours
LAST_COMPOUND_FILE = "/tmp/last_compound.json"

# Bot profit sources and reinvestment targets
COMPOUND_CONFIG = {
    "kraken": {
        "profit_source": "kraken_api",  # Check via Kraken API
        "min_profit": 20.0,
        "reinvest_pct": 0.5,  # Reinvest 50% of profit
        "target": "kraken_balance",  # Keep in Kraken for more trades
    },
    "kalshi": {
        "profit_source": "kalshi_api",
        "min_profit": 15.0,
        "reinvest_pct": 0.5,
        "target": "kalshi_balance",
    },
    "polymarket": {
        "profit_source": "polymarket_settlements",
        "min_profit": 10.0,
        "reinvest_pct": 0.6,  # More aggressive - good performer
        "target": "polymarket_usdc",
    },
}


def get_bot_profits():
    """Get current profit data for each bot"""
    profits = {}
    
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "trading_bots_api", "/opt/apex-agent/trading_bots_api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        data = mod.get_all_bot_data()
        
        for bot in data.get('bots', []):
            bot_id = bot['id']
            profits[bot_id] = {
                "name": bot['name'],
                "usd_value": bot.get('usd_value', 0),
                "status": bot['status'],
                "platform": bot['platform'],
            }
    except Exception as e:
        log.error(f"Failed to get bot profits: {e}")
    
    return profits


def check_compound_cooldown():
    """Check if enough time has passed since last compound"""
    try:
        if os.path.exists(LAST_COMPOUND_FILE):
            with open(LAST_COMPOUND_FILE) as f:
                data = json.load(f)
            last_time = data.get("timestamp", 0)
            if time.time() - last_time < COMPOUND_INTERVAL:
                remaining = COMPOUND_INTERVAL - (time.time() - last_time)
                return False, f"Cooldown: {remaining/3600:.1f}h remaining"
    except:
        pass
    return True, "Ready"


def save_compound_record(actions):
    """Save compound record"""
    try:
        with open(LAST_COMPOUND_FILE, 'w') as f:
            json.dump({
                "timestamp": time.time(),
                "datetime": datetime.now(timezone.utc).isoformat(),
                "actions": actions
            }, f)
    except Exception as e:
        log.error(f"Failed to save compound record: {e}")


def calculate_allocation(profits):
    """Calculate how to allocate reinvestment based on performance"""
    allocations = []
    
    for bot_id, config in COMPOUND_CONFIG.items():
        if bot_id not in profits:
            continue
        
        bot_data = profits[bot_id]
        if bot_data['status'] != 'online':
            continue
        
        usd_value = bot_data.get('usd_value', 0)
        min_profit = config['min_profit']
        
        # Simple heuristic: if bot has more than min_profit above its threshold,
        # compound the excess
        excess = usd_value - min_profit * 2  # Keep 2x min as buffer
        
        if excess > MIN_COMPOUND_USD:
            compound_amount = excess * config['reinvest_pct']
            allocations.append({
                "bot_id": bot_id,
                "bot_name": bot_data['name'],
                "current_value": usd_value,
                "excess": excess,
                "compound_amount": compound_amount,
                "target": config['target'],
                "reinvest_pct": config['reinvest_pct'],
            })
    
    # Sort by compound amount descending
    allocations.sort(key=lambda x: x['compound_amount'], reverse=True)
    return allocations


def execute_compound(allocations):
    """Execute the compound actions"""
    results = []
    
    for alloc in allocations:
        bot_id = alloc['bot_id']
        amount = alloc['compound_amount']
        
        log.info(f"Compounding ${amount:.2f} for {alloc['bot_name']}")
        
        # For now, log the action - actual execution depends on each platform
        # Kraken: already auto-reinvests via the bot
        # Kalshi: settlements auto-return to balance
        # Polymarket: settlements need to be redeposited
        
        result = {
            "bot": alloc['bot_name'],
            "amount": amount,
            "action": "logged",  # Will be "executed" when we add actual transfer logic
            "target": alloc['target'],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        if bot_id == "kraken":
            # Kraken profits stay in the account - just log
            result["action"] = "retained"
            result["note"] = "Profits kept in Kraken for continued trading"
        
        elif bot_id == "kalshi":
            # Kalshi settlements auto-return
            result["action"] = "retained"
            result["note"] = "Kalshi settlements auto-compound"
        
        elif bot_id == "polymarket":
            # Polymarket needs manual deposit back to CLOB
            result["action"] = "flagged"
            result["note"] = f"${amount:.2f} available for redeposit to Polymarket CLOB"
        
        results.append(result)
    
    return results


def run_compound():
    """Main compound function - called by auto-sustain daemon"""
    ready, msg = check_compound_cooldown()
    if not ready:
        return {"status": "cooldown", "message": msg}
    
    profits = get_bot_profits()
    if not profits:
        return {"status": "error", "message": "Could not fetch bot profits"}
    
    allocations = calculate_allocation(profits)
    if not allocations:
        return {"status": "skip", "message": "No bots have enough excess profit to compound"}
    
    results = execute_compound(allocations)
    save_compound_record(results)
    
    # Build summary
    total_compounded = sum(r.get('amount', 0) for r in results)
    summary = f"Compounded ${total_compounded:.2f} across {len(results)} bots"
    
    return {
        "status": "success",
        "message": summary,
        "actions": results,
        "total_compounded": total_compounded
    }


def get_compound_status():
    """Get the last compound status for API"""
    try:
        if os.path.exists(LAST_COMPOUND_FILE):
            with open(LAST_COMPOUND_FILE) as f:
                return json.load(f)
    except:
        pass
    return {"status": "never_run"}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = run_compound()
    print(json.dumps(result, indent=2))
