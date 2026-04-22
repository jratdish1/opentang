#!/usr/bin/env python3
"""
HABFF P&L Tracker — Tracks daily profit/loss for the HABFF arb bot on BASE.
Runs via cron every 4 hours, sends summary to Telegram.
Deployment: /opt/apex-agent/habff_pnl_tracker.py on VDS
Cron: 0 */4 * * * cd /opt/apex-agent && python3 habff_pnl_tracker.py >> /var/log/habff_pnl.log 2>&1
"""
import os, sys, json, time, requests
from datetime import datetime, timezone
from web3 import Web3

# ============================================================
# CONFIG
# ============================================================
HABFF_CONTRACT = "0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55"
HERO = "0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8"
WETH = "0x4200000000000000000000000000000000000006"
WALLET = "0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6"

RPCS = [
    "https://base-rpc.publicnode.com",
    "https://base.meowrpc.com",
    "https://mainnet.base.org",
]

STATE_FILE = "/opt/apex-agent/habff_pnl_state.json"

# Telegram
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# Load from env_architecture if not in env
if not TELEGRAM_BOT_TOKEN:
    for env_file in ["/root/.env_architecture", "/root/.env"]:
        if os.path.exists(env_file):
            with open(env_file) as f:
                for line in f:
                    if "TELEGRAM_BOT_TOKEN" in line and not line.strip().startswith("#"):
                        TELEGRAM_BOT_TOKEN = line.split("=", 1)[1].strip().strip('"')
                    if "TELEGRAM_CHAT_ID" in line and not line.strip().startswith("#"):
                        TELEGRAM_CHAT_ID = line.split("=", 1)[1].strip().strip('"')

ERC20_ABI = json.loads('[{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')

HABFF_STATS_ABI = json.loads('[{"inputs":[],"name":"getStats","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]')

def connect():
    for rpc in RPCS:
        try:
            w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 15}))
            if w3.is_connected():
                return w3
        except:
            continue
    return None

def get_hero_price_usd(w3):
    """Get HERO price in USD via HERO->WETH->USD path."""
    try:
        # Get HERO/WETH price from Uniswap V2
        router_abi = json.loads('[{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}]')
        router = w3.eth.contract(
            address=Web3.to_checksum_address("0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24"),
            abi=router_abi
        )
        hero_addr = Web3.to_checksum_address(HERO)
        weth_addr = Web3.to_checksum_address(WETH)
        amounts = router.functions.getAmountsOut(int(1e18), [hero_addr, weth_addr]).call()
        hero_in_weth = amounts[-1] / 1e18
        
        # Get ETH price from CoinGecko
        try:
            cg_key = os.environ.get("COINGECKO_API_KEY", "")
            if not cg_key:
                for env_file in ["/root/.env_architecture", "/root/.env"]:
                    if os.path.exists(env_file):
                        with open(env_file) as f:
                            for line in f:
                                if "COINGECKO" in line and not line.strip().startswith("#"):
                                    cg_key = line.split("=", 1)[1].strip().strip('"')
            headers = {"x-cg-demo-api-key": cg_key} if cg_key else {}
            r = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", headers=headers, timeout=10)
            eth_usd = r.json()["ethereum"]["usd"]
        except:
            eth_usd = 1800  # Fallback
        
        return hero_in_weth * eth_usd
    except:
        return 0.0

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"initial_hero": 0, "initial_weth": 0, "initial_eth": 0, "history": []}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def send_telegram(msg):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print(f"[WARN] No Telegram config — skipping notification")
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": msg,
            "parse_mode": "HTML"
        }, timeout=10)
    except Exception as e:
        print(f"[WARN] Telegram send failed: {e}")

def main():
    now = datetime.now(timezone.utc)
    ts = now.strftime("%Y-%m-%d %H:%M UTC")
    
    w3 = connect()
    if not w3:
        print(f"[{ts}] ERROR: Cannot connect to BASE RPC")
        return
    
    # Get current balances
    hero_contract = w3.eth.contract(address=Web3.to_checksum_address(HERO), abi=ERC20_ABI)
    weth_contract = w3.eth.contract(address=Web3.to_checksum_address(WETH), abi=ERC20_ABI)
    
    hero_in_habff = hero_contract.functions.balanceOf(Web3.to_checksum_address(HABFF_CONTRACT)).call() / 1e18
    weth_in_habff = weth_contract.functions.balanceOf(Web3.to_checksum_address(HABFF_CONTRACT)).call() / 1e18
    hero_in_wallet = hero_contract.functions.balanceOf(Web3.to_checksum_address(WALLET)).call() / 1e18
    eth_balance = w3.eth.get_balance(Web3.to_checksum_address(WALLET)) / 1e18
    
    total_hero = hero_in_habff + hero_in_wallet
    
    # Get contract stats
    try:
        habff = w3.eth.contract(address=Web3.to_checksum_address(HABFF_CONTRACT), abi=HABFF_STATS_ABI)
        stats = habff.functions.getStats().call()
        hero_gained = stats[0] / 1e18
        total_burn = stats[1] / 1e18
        total_reward = stats[2] / 1e18
        total_lp = stats[3] / 1e18
    except:
        hero_gained = total_burn = total_reward = total_lp = 0
    
    # Get HERO price
    hero_price = get_hero_price_usd(w3)
    total_value_usd = total_hero * hero_price + weth_in_habff * 1800  # rough ETH price
    
    # Load state
    state = load_state()
    
    # Initialize if first run
    if state["initial_hero"] == 0:
        state["initial_hero"] = total_hero
        state["initial_weth"] = weth_in_habff
        state["initial_eth"] = eth_balance
    
    # Calculate P&L
    hero_pnl = total_hero - state["initial_hero"]
    hero_pnl_pct = (hero_pnl / state["initial_hero"] * 100) if state["initial_hero"] > 0 else 0
    
    # Determine status emoji
    if hero_pnl > 0:
        status = "🟢"
    elif hero_pnl < -state["initial_hero"] * 0.02:
        status = "🔴"
    else:
        status = "🟡"
    
    # Save snapshot
    snapshot = {
        "timestamp": ts,
        "hero_contract": round(hero_in_habff, 2),
        "hero_wallet": round(hero_in_wallet, 2),
        "weth": round(weth_in_habff, 6),
        "eth": round(eth_balance, 6),
        "hero_price": round(hero_price, 6),
        "total_usd": round(total_value_usd, 2),
        "hero_pnl": round(hero_pnl, 2),
    }
    state["history"].append(snapshot)
    # Keep last 180 entries (30 days at 4h intervals)
    state["history"] = state["history"][-180:]
    save_state(state)
    
    # Build report
    msg = f"""<b>{status} HABFF P&L Report</b>
<b>Time:</b> {ts}

<b>📊 Balances:</b>
  Contract HERO: {hero_in_habff:,.0f}
  Wallet HERO: {hero_in_wallet:,.0f}
  Contract WETH: {weth_in_habff:.6f}
  Wallet ETH: {eth_balance:.6f}

<b>💰 Value:</b>
  HERO Price: ${hero_price:.6f}
  Total HERO: {total_hero:,.0f}
  Total Value: ${total_value_usd:,.2f}

<b>📈 P&L (since tracking):</b>
  HERO: {hero_pnl:+,.0f} ({hero_pnl_pct:+.2f}%)

<b>🔥 Contract Stats:</b>
  HERO Gained: {hero_gained:,.0f}
  HERO Burned: {total_burn:,.0f}
  HERO Rewards: {total_reward:,.0f}
  HERO LP Added: {total_lp:,.0f}

<b>Network:</b> BASE | <b>Contract:</b> <code>{HABFF_CONTRACT[:10]}...{HABFF_CONTRACT[-6:]}</code>"""
    
    print(f"[{ts}] HABFF P&L: HERO={total_hero:,.0f} WETH={weth_in_habff:.6f} ETH={eth_balance:.6f} Value=${total_value_usd:.2f} PnL={hero_pnl:+,.0f}")
    
    send_telegram(msg)

if __name__ == "__main__":
    main()
