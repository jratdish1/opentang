"""
APEX PreReason Client — Market Intelligence Module
Pulls structured market briefings for autonomous trading decisions.
"""

import os
import json
import requests
from datetime import datetime

PREREASON_API_KEY = os.environ.get("PREREASON_API_KEY", "pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_")
PREREASON_BASE_URL = os.environ.get("PREREASON_URL", "https://api.prereason.com")

# Free tier briefings
FREE_BRIEFINGS = [
    "btc.quick-check",   # Quick directional read
    "btc.context",       # BTC price, mining health, liquidity overview
    "macro.snapshot",    # Fed balance sheet, M2, yield curve, net liquidity
    "cross.correlations",# 9 cross-asset correlation pairs
    "btc.pulse",         # Quick price action (price, 24h change, dominance)
    "btc.grid-stress",   # Mining network health, difficulty forecast
]

# Basic tier ($19.99/mo) adds:
BASIC_BRIEFINGS = FREE_BRIEFINGS + [
    "btc.momentum",      # BTC momentum indicators
    "macro.liquidity",   # Liquidity momentum
    "btc.onchain",       # On-chain health
    "cross.breadth",     # Market breadth
    "btc.miners",        # Miner survival index
]

# Pro tier ($49.99/mo) adds:
PRO_BRIEFINGS = BASIC_BRIEFINGS + [
    "btc.full",          # Full context with narrative
    "btc.factors",       # Factor attribution
    "cross.regime",      # Regime classification
    "fx",                # FX liquidity
    "btc.energy",        # Energy cost index
    "btc.treasury",      # Treasury holdings
]


class PreReasonClient:
    """Client for PreReason market intelligence API."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or PREREASON_API_KEY
        self.base_url = PREREASON_BASE_URL
        self.headers = {"Authorization": f"Bearer {self.api_key}"}
    
    def get_briefing(self, briefing_id, format="json"):
        """Get a market briefing by ID.
        
        Args:
            briefing_id: One of the briefing IDs (e.g., 'btc.quick-check')
            format: 'json' or 'markdown'
        
        Returns:
            dict (json) or str (markdown)
        """
        url = f"{self.base_url}/api/context?briefing={briefing_id}&format={format}"
        r = requests.get(url, headers=self.headers, timeout=10)
        r.raise_for_status()
        return r.json() if format == "json" else r.text
    
    def get_all_free_briefings(self):
        """Pull all free tier briefings and return consolidated intel."""
        results = {}
        for briefing_id in FREE_BRIEFINGS:
            try:
                results[briefing_id] = self.get_briefing(briefing_id, "json")
            except Exception as e:
                results[briefing_id] = {"error": str(e)}
        return results
    
    def get_market_signal(self):
        """Get a quick market signal for trading decisions.
        
        Returns:
            dict with 'signal', 'btc_price', 'btc_7d_change', 'net_liquidity', 'correlation'
        """
        data = self.get_briefing("btc.quick-check", "json")
        # Parse the structured JSON response
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "raw": data,
            "source": "prereason"
        }
    
    def get_mining_health(self):
        """Get mining network health for miner management decisions."""
        return self.get_briefing("btc.grid-stress", "json")
    
    def get_macro_context(self):
        """Get macro environment for broader market context."""
        return self.get_briefing("macro.snapshot", "json")
    
    def get_correlations(self):
        """Get cross-asset correlations for risk management."""
        return self.get_briefing("cross.correlations", "json")
    
    def health_check(self):
        """Check if PreReason API is healthy."""
        try:
            r = requests.get(f"{self.base_url}/api/health", timeout=5)
            return r.json()
        except:
            return {"status": "unreachable"}
    
    def get_available_metrics(self):
        """List all available metrics (no auth needed)."""
        r = requests.get(f"{self.base_url}/api/metrics", timeout=5)
        return r.json()


# Quick usage
if __name__ == "__main__":
    client = PreReasonClient()
    
    # Health check
    health = client.health_check()
    print(f"API Status: {health.get('status', 'unknown')}")
    
    # Pull quick check
    print("\n=== BTC Quick Check ===")
    signal = client.get_briefing("btc.quick-check", "markdown")
    print(signal)
    
    # Pull all free briefings
    print("\n=== All Free Briefings ===")
    all_data = client.get_all_free_briefings()
    for k, v in all_data.items():
        status = "OK" if "error" not in v else f"ERROR: {v['error']}"
        print(f"  {k}: {status}")
