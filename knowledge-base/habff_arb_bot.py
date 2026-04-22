#!/usr/bin/env python3
"""
HABFF Arb Bot — Routes cross-DEX arbitrage through the HABFF contract on BASE.
Upgrades the existing base_hero_volume_bot to use atomic contract-level arbs.

Deployment: /opt/apex-agent/habff_arb_bot.py on VDS
PM2: pm2 start habff_arb_bot.py --name habff-arb --interpreter python3
"""
import os, sys, json, time, traceback
from datetime import datetime, timezone
from web3 import Web3
from eth_account import Account

# ============================================================
# CONFIG
# ============================================================
HABFF_CONTRACT = Web3.to_checksum_address("0x1e8B3A00E6fD7A79F8E1a7F5eDb1bA652b288c55")
HERO = Web3.to_checksum_address("0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8")
WETH = Web3.to_checksum_address("0x4200000000000000000000000000000000000006")
USDC = Web3.to_checksum_address("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
BRETT = Web3.to_checksum_address("0x532f27101965dd16442E59d40670FaF5eBB142E4")
AERO_TOKEN = Web3.to_checksum_address("0x940181a94A35A4569E4529A3CDfB74e38FD98631")

# Routers
UNIV2_ROUTER = Web3.to_checksum_address("0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24")
AERO_ROUTER = Web3.to_checksum_address("0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43")
AERO_FACTORY = Web3.to_checksum_address("0x420DD381b31aEf6683db6B902084cB0FFECe40Da")

# RPCs (different order from base-hero-vol to reduce 429 collisions)
RPCS = [
    "https://base-rpc.publicnode.com",
    "https://base.meowrpc.com",
    "https://mainnet.base.org",
    "https://1rpc.io/base",
    "https://base.drpc.org",
]

# Thresholds
MIN_ARB_SPREAD_PCT = 1.5   # Minimum spread to trigger arb (%)
ARB_AMOUNT_HERO = 500      # HERO per arb trade
SCAN_INTERVAL = 20         # Seconds between scans (staggered from base-hero-vol)
VOLUME_INTERVAL = 600      # Volume trade every 10 min (reduce RPC load)
MAX_GAS_GWEI = 0.5         # Max gas price on BASE

# ABIs
ERC20_ABI = json.loads('[{"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]')

UNIV2_ROUTER_ABI = json.loads('[{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

AERO_ROUTER_ABI = json.loads('[{"inputs":[{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"amountIn","type":"uint256"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]')

# HABFF Contract ABI — MUST match actual deployed contract exactly
HABFF_ABI = json.loads("""
[
  {"inputs":[{"name":"tokenIn","type":"address"},{"name":"tokenMid","type":"address"},{"name":"amountIn","type":"uint256"},{"name":"minGainAmount","type":"uint256"},{"name":"buyOnAerodrome","type":"bool"},{"name":"buyStable","type":"bool"},{"name":"sellStable","type":"bool"}],"name":"crossDexArb","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"swapPaths","type":"address[][]"},{"name":"amountIn","type":"uint256"},{"name":"minAmountsOut","type":"uint256[]"},{"name":"useAerodrome","type":"bool[]"},{"name":"isStable","type":"bool[]"}],"name":"multiSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"token","type":"address"},{"name":"router","type":"address"}],"name":"approveToken","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getStats","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"token","type":"address"}],"name":"rescueToken","outputs":[],"stateMutability":"nonpayable","type":"function"}
]""")
# ============================================================
# GLOBALS
# ============================================================
w3 = None
wallet = None
private_key = None
habff = None
scan_count = 0
arb_count = 0
volume_count = 0
last_volume_time = 0
start_time = time.time()

def log(msg, level="INFO"):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] [{level}] {msg}", flush=True)

# ============================================================
# SETUP
# ============================================================
def connect():
    global w3, habff
    for rpc in RPCS:
        try:
            w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 15}))
            if w3.is_connected():
                block = w3.eth.block_number
                habff = w3.eth.contract(address=HABFF_CONTRACT, abi=HABFF_ABI)
                log(f"Connected to {rpc} | block {block}")
                return True
        except:
            continue
    return False

def load_wallet():
    global wallet, private_key
    pk = ""
    key_names = ["ARB_BOT_BASE_PRIVATE_KEY", "HERO_FARM_PRIVATE_KEY", "WALLET_PRIVATE_KEY"]
    for env_file in ["/root/.env_architecture", "/root/.env"]:
        if not os.path.exists(env_file):
            continue
        with open(env_file) as f:
            for line in f:
                for kn in key_names:
                    if kn in line and not line.strip().startswith("#"):
                        pk = line.split("=", 1)[1].strip().strip('"')
                        if pk: break
                if pk: break
        if pk: break
    if not pk:
        log("No private key found!", "FATAL")
        sys.exit(1)
    private_key = pk
    wallet = Account.from_key(pk).address
    log(f"Wallet: {wallet}")

def get_balances():
    """Get HERO balance in contract + wallet ETH for gas."""
    try:
        hero_contract = w3.eth.contract(address=HERO, abi=ERC20_ABI)
        hero_in_habff = hero_contract.functions.balanceOf(HABFF_CONTRACT).call() / 1e18
        weth_contract = w3.eth.contract(address=WETH, abi=ERC20_ABI)
        weth_in_habff = weth_contract.functions.balanceOf(HABFF_CONTRACT).call() / 1e18
        eth_balance = w3.eth.get_balance(wallet) / 1e18
        return {"HERO": hero_in_habff, "WETH": weth_in_habff, "ETH": eth_balance}
    except Exception as e:
        log(f"Balance check error: {e}", "ERROR")
        return None

def ensure_approvals():
    """Approvals are handled by the separate approve_habff_spaced.py script.
    This function is a no-op to avoid nonce collisions with other bots."""
    log("Approvals managed externally (approve_habff_spaced.py) — skipping")

# ============================================================
# PRICE SCANNING
# ============================================================
def get_univ2_price(token_in, token_out, amount_wei):
    """Get quote from Uniswap V2 router."""
    try:
        router = w3.eth.contract(address=UNIV2_ROUTER, abi=UNIV2_ROUTER_ABI)
        amounts = router.functions.getAmountsOut(amount_wei, [token_in, token_out]).call()
        return amounts[-1]
    except:
        return 0

def get_aero_price(token_in, token_out, amount_wei):
    """Get quote from Aerodrome router."""
    try:
        router = w3.eth.contract(address=AERO_ROUTER, abi=AERO_ROUTER_ABI)
        routes = [(token_in, token_out, False, AERO_FACTORY)]
        amounts = router.functions.getAmountsOut(routes, amount_wei).call()
        return amounts[-1]
    except:
        return 0

def scan_cross_dex_arb():
    """Scan for cross-DEX arb between Uniswap V2 and Aerodrome.
    VERIFIED POOLS (2026-04-22):
    - Aerodrome HERO/WETH: 0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20 ($4.7K liq)
    - Uniswap V2 HERO/WETH: 0x3Bb159de8604ab7E0148EDC24F2A568c430476CF ($4.0K liq)
    Cross-DEX arb is ACTIVE."""
    amount_wei = int(ARB_AMOUNT_HERO * 1e18)
    
    # Get HERO -> WETH prices on both DEXes
    univ2_weth = get_univ2_price(HERO, WETH, amount_wei)
    aero_weth = get_aero_price(HERO, WETH, amount_wei)
    
    if univ2_weth == 0 or aero_weth == 0:
        return None  # One or both DEXes have no pool — skip
    
    # Check both directions
    opportunities = []
    
    # Direction 1: Sell on UniV2 (higher), Buy on Aero (lower)
    if univ2_weth > aero_weth:
        spread = ((univ2_weth - aero_weth) / aero_weth) * 100
        if spread >= MIN_ARB_SPREAD_PCT:
            # Buy HERO on Aero (cheaper), sell on UniV2 (more expensive)
            # But we need to reverse: buy WETH->HERO on Aero, sell HERO->WETH on UniV2
            # Actually: we have HERO in contract. Sell HERO->WETH on UniV2, buy WETH->HERO on Aero
            opportunities.append({
                "direction": "sell_univ2_buy_aero",
                "sell_router": UNIV2_ROUTER,
                "buy_router": AERO_ROUTER,
                "sell_is_aero": False,
                "buy_is_aero": True,
                "spread": spread,
                "sell_weth": univ2_weth,
                "buy_weth": aero_weth,
            })
    
    # Direction 2: Sell on Aero (higher), Buy on UniV2 (lower)
    if aero_weth > univ2_weth:
        spread = ((aero_weth - univ2_weth) / univ2_weth) * 100
        if spread >= MIN_ARB_SPREAD_PCT:
            opportunities.append({
                "direction": "sell_aero_buy_univ2",
                "sell_router": AERO_ROUTER,
                "buy_router": UNIV2_ROUTER,
                "sell_is_aero": True,
                "buy_is_aero": False,
                "spread": spread,
                "sell_weth": aero_weth,
                "buy_weth": univ2_weth,
            })
    
    if opportunities:
        best = max(opportunities, key=lambda x: x["spread"])
        return best
    
    return None

# ============================================================
# EXECUTION
# ============================================================
def execute_cross_dex_arb(opp):
    """Execute cross-DEX arb through HABFF contract (atomic).
    crossDexArb(tokenIn, tokenMid, amountIn, minGainAmount, buyOnAerodrome, buyStable, sellStable)
    """
    global arb_count
    
    bals = get_balances()
    if not bals or bals["HERO"] < ARB_AMOUNT_HERO:
        log(f"Insufficient HERO in contract: {bals['HERO']:.0f}", "WARN")
        return False
    
    if bals["ETH"] < 0.0001:
        log("Insufficient ETH for gas", "WARN")
        return False
    
    amount_wei = int(ARB_AMOUNT_HERO * 1e18)
    min_gain = int(amount_wei * 0.001)  # 0.1% min gain in HERO
    
    # Determine which DEX to buy on (cheaper) — buyOnAerodrome=True means buy on Aero, sell on UniV2
    buy_on_aero = opp["buy_is_aero"]
    
    log(f">>> CROSS-DEX ARB: {opp['direction']} | spread={opp['spread']:.2f}%")
    log(f"    Buy on {'Aero' if buy_on_aero else 'UniV2'}, Sell on {'UniV2' if buy_on_aero else 'Aero'}")
    
    try:
        gas_price = w3.eth.gas_price
        if gas_price > int(MAX_GAS_GWEI * 1e9):
            log(f"Gas too high: {gas_price/1e9:.3f} gwei", "WARN")
            return False
        
        # Simulate first
        try:
            habff.functions.crossDexArb(
                HERO,           # tokenIn (always HERO)
                WETH,           # tokenMid
                amount_wei,     # amountIn
                min_gain,       # minGainAmount
                buy_on_aero,    # buyOnAerodrome
                False,          # buyStable (volatile pool)
                False,          # sellStable (volatile pool)
            ).call({"from": wallet})
        except Exception as sim_err:
            log(f"    ARB would revert: {str(sim_err)[:100]}", "WARN")
            return False
        
        tx = habff.functions.crossDexArb(
            HERO, WETH, amount_wei, min_gain, buy_on_aero, False, False
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 500000,
            "gasPrice": gas_price,
        })
        
        signed = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        log(f"    TX: {tx_hash.hex()}")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        
        if receipt.status == 1:
            arb_count += 1
            gas_cost = receipt.gasUsed * gas_price / 1e18
            log(f"    ARB SUCCESS! Gas: {gas_cost:.6f} ETH | Total arbs: {arb_count}")
            return True
        else:
            log("    ARB REVERTED (likely spread closed)", "WARN")
            return False
            
    except Exception as e:
        err = str(e)
        if "insufficient" in err.lower() or "revert" in err.lower():
            log(f"    ARB failed (expected): {err[:100]}", "WARN")
        else:
            log(f"    ARB error: {err[:200]}", "ERROR")
        return False

def execute_volume_trade():
    """Execute volume trade directly through wallet (NOT contract).
    Contract has 'Must gain hero overall' check that prevents round-trips.
    Volume trades go wallet -> UniV2 router directly for HERO visibility."""
    global volume_count, last_volume_time
    
    # Check wallet HERO balance (not contract)
    try:
        hero_contract = w3.eth.contract(address=HERO, abi=ERC20_ABI)
        wallet_hero = hero_contract.functions.balanceOf(wallet).call() / 1e18
        if wallet_hero < 50:
            log(f"Low wallet HERO for volume: {wallet_hero:.0f}", "WARN")
            return False
    except:
        return False
    
    amount_wei = int(50 * 1e18)  # Small volume trade
    router = w3.eth.contract(address=UNIV2_ROUTER, abi=UNIV2_ROUTER_ABI)
    deadline = int(time.time()) + 300
    
    try:
        # Leg 1: HERO -> WETH via wallet
        tx = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount_wei, 0, [HERO, WETH], wallet, deadline
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 250000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        
        if receipt.status != 1:
            log("Volume sell HERO->WETH reverted", "WARN")
            return False
        
        time.sleep(3)
        
        # Leg 2: WETH -> HERO buyback
        weth_contract = w3.eth.contract(address=WETH, abi=ERC20_ABI)
        weth_bal = weth_contract.functions.balanceOf(wallet).call()
        if weth_bal == 0:
            log("No WETH received from sell", "WARN")
            return False
        
        tx2 = router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            weth_bal, 0, [WETH, HERO], wallet, deadline
        ).build_transaction({
            "from": wallet,
            "nonce": w3.eth.get_transaction_count(wallet),
            "gas": 250000,
            "gasPrice": w3.eth.gas_price,
        })
        signed2 = w3.eth.account.sign_transaction(tx2, private_key)
        tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
        receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=30)
        
        if receipt2.status == 1:
            volume_count += 1
            last_volume_time = time.time()
            log(f"Volume trade #{volume_count}: HERO->WETH->HERO via wallet OK")
            return True
        else:
            log("Volume buyback WETH->HERO reverted", "WARN")
            return False
            
    except Exception as e:
        log(f"Volume trade error: {str(e)[:150]}", "ERROR")
        return False

# ============================================================
# MAIN LOOP
# ============================================================
def main():
    global scan_count
    
    log("=" * 60)
    log("HABFF Arb Bot v1.0 — BASE Chain")
    log(f"Contract: {HABFF_CONTRACT}")
    log(f"Min spread: {MIN_ARB_SPREAD_PCT}% | Arb size: {ARB_AMOUNT_HERO} HERO")
    log("=" * 60)
    
    if not connect():
        log("Failed to connect to any RPC!", "FATAL")
        sys.exit(1)
    
    load_wallet()
    
    bals = get_balances()
    if bals:
        log(f"Contract: {bals['HERO']:.0f} HERO, {bals['WETH']:.6f} WETH")
        log(f"Wallet: {bals['ETH']:.6f} ETH (gas)")
    
    # Approvals handled by separate spaced script to avoid nonce collisions
    log("Note: approvals managed by approve_habff_spaced.py (run separately)")
    
    log("Starting scan loop...")
    
    while True:
        try:
            scan_count += 1
            
            # Reconnect if needed
            if not w3 or not w3.is_connected():
                if not connect():
                    time.sleep(30)
                    continue
            
            # Scan for arb
            opp = scan_cross_dex_arb()
            
            if opp:
                log(f"[Scan #{scan_count}] ARB FOUND: {opp['direction']} spread={opp['spread']:.2f}%")
                execute_cross_dex_arb(opp)
            else:
                if scan_count % 50 == 0:
                    bals = get_balances()
                    uptime = (time.time() - start_time) / 3600
                    log(f"[Scan #{scan_count}] No arb | HERO={bals['HERO']:.0f} WETH={bals['WETH']:.6f} | arbs={arb_count} vols={volume_count} | {uptime:.1f}h")
            
            # Volume trade every VOLUME_INTERVAL
            if time.time() - last_volume_time > VOLUME_INTERVAL:
                execute_volume_trade()
            
            time.sleep(SCAN_INTERVAL)
            
        except KeyboardInterrupt:
            log("Shutting down...")
            break
        except Exception as e:
            log(f"Main loop error: {str(e)[:200]}", "ERROR")
            time.sleep(30)
            try:
                connect()
            except:
                pass

if __name__ == "__main__":
    main()
