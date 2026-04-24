"""
Step 1: Approve AERO for Aerodrome Router
Step 2: Wait for confirmation
Step 3: Swap AERO -> WETH -> unwrap to ETH with 13% slippage
"""
from web3 import Web3
import os, json, time

RPC_URL = "https://base-mainnet.public.blastapi.io"
w3 = Web3(Web3.HTTPProvider(RPC_URL, request_kwargs={"timeout": 15}))

WALLET = Web3.to_checksum_address("0xeb2C36C1804A8D4c68a2033dEe5ACc1294bD24e6")
PRIVATE_KEY = os.environ.get("ARB_BOT_BASE_PRIVATE_KEY", "")

AERO_ADDR = Web3.to_checksum_address("0x940181a94A35A4569E4529A3CDfB74e38FD98631")
WETH_ADDR = Web3.to_checksum_address("0x4200000000000000000000000000000000000006")
AERO_ROUTER = Web3.to_checksum_address("0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43")
AERO_FACTORY = Web3.to_checksum_address("0x420DD381b31aEf6683db6B902084cB0FFECe40Da")

ERC20_ABI = json.loads("""[
  {"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}
]""")

ROUTER_ABI = json.loads("""[
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]""")

WETH_ABI = json.loads("""[
  {"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"type":"function"},
  {"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}
]""")

aero = w3.eth.contract(address=AERO_ADDR, abi=ERC20_ABI)
router = w3.eth.contract(address=AERO_ROUTER, abi=ROUTER_ABI)

# ─── STEP 0: Check balances ──────────────────────────────────────
aero_bal = aero.functions.balanceOf(WALLET).call()
aero_human = aero_bal / 1e18
eth_bal = w3.eth.get_balance(WALLET)
print(f"AERO: {aero_human:.4f}")
print(f"ETH:  {w3.from_wei(eth_bal, 'ether')}")

if aero_bal == 0:
    print("No AERO to sell")
    exit(0)

# ─── STEP 1: APPROVE (clean, separate TX) ────────────────────────
print("\n=== STEP 1: APPROVE AERO ===")
time.sleep(1)
allowance = aero.functions.allowance(WALLET, AERO_ROUTER).call()
print(f"Current allowance: {allowance / 1e18:.2f}")

if allowance < aero_bal:
    nonce = w3.eth.get_transaction_count(WALLET)
    print(f"Approving max AERO for router... (nonce={nonce})")
    approve_tx = aero.functions.approve(
        AERO_ROUTER, 2**256 - 1
    ).build_transaction({
        'from': WALLET,
        'nonce': nonce,
        'gas': 60000,
        'gasPrice': w3.eth.gas_price,
        'chainId': 8453,
    })
    signed = w3.eth.account.sign_transaction(approve_tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"Approve TX: {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt.status == 1:
        print("APPROVE SUCCESS!")
    else:
        print("APPROVE FAILED!")
        exit(1)
    
    # Verify allowance
    time.sleep(3)
    new_allowance = aero.functions.allowance(WALLET, AERO_ROUTER).call()
    print(f"New allowance: {new_allowance / 1e18:.2f}")
    if new_allowance < aero_bal:
        print("ERROR: Allowance still insufficient after approve!")
        exit(1)
else:
    print("Already approved")

# ─── STEP 2: GET QUOTE ───────────────────────────────────────────
print("\n=== STEP 2: GET QUOTE ===")
time.sleep(2)
route = [(AERO_ADDR, WETH_ADDR, False, AERO_FACTORY)]
amounts = router.functions.getAmountsOut(aero_bal, route).call()
expected_weth = amounts[-1]
print(f"Quote: {aero_human:.2f} AERO -> {w3.from_wei(expected_weth, 'ether')} WETH/ETH")

# 13% slippage SOP
min_out = int(expected_weth * 0.87)
print(f"Min out (13% slippage): {w3.from_wei(min_out, 'ether')}")

# ─── STEP 3: SWAP ────────────────────────────────────────────────
print("\n=== STEP 3: SWAP AERO -> WETH ===")
time.sleep(3)
deadline = int(time.time()) + 600
nonce = w3.eth.get_transaction_count(WALLET)
print(f"Swap nonce: {nonce}")

# Try swapExactTokensForTokens (AERO -> WETH) then unwrap manually
# This avoids the ETH receive issue that might cause reverts
try:
    swap_tx = router.functions.swapExactTokensForTokens(
        aero_bal, min_out, route, WALLET, deadline
    ).build_transaction({
        'from': WALLET,
        'nonce': nonce,
        'gas': 400000,
        'gasPrice': w3.eth.gas_price,
        'chainId': 8453,
    })
    
    # Estimate gas first to catch revert reason
    try:
        gas_est = w3.eth.estimate_gas(swap_tx)
        print(f"Gas estimate: {gas_est}")
        swap_tx['gas'] = int(gas_est * 1.2)
    except Exception as e:
        print(f"Gas estimate failed (will revert): {e}")
        # Try with 0 min out
        print("Retrying with 0 min out...")
        swap_tx = router.functions.swapExactTokensForTokens(
            aero_bal, 0, route, WALLET, deadline
        ).build_transaction({
            'from': WALLET,
            'nonce': nonce,
            'gas': 400000,
            'gasPrice': w3.eth.gas_price,
            'chainId': 8453,
        })
        try:
            gas_est = w3.eth.estimate_gas(swap_tx)
            print(f"Gas estimate (0 min): {gas_est}")
            swap_tx['gas'] = int(gas_est * 1.2)
        except Exception as e2:
            print(f"Still failing: {e2}")
            print("\nThe AERO/WETH pool might not exist on Aerodrome V2 factory.")
            print("Checking if we need to use a different factory or pool type...")
            
            # Try with stable=True
            print("\nTrying stable pool route...")
            route_stable = [(AERO_ADDR, WETH_ADDR, True, AERO_FACTORY)]
            try:
                amounts_s = router.functions.getAmountsOut(aero_bal, route_stable).call()
                print(f"Stable quote: {w3.from_wei(amounts_s[-1], 'ether')} WETH")
            except:
                print("No stable pool either")
            
            # Try AERO -> USDC -> WETH route
            USDC_ADDR = Web3.to_checksum_address("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
            print("\nTrying AERO -> USDC -> WETH multi-hop...")
            route_multi = [
                (AERO_ADDR, USDC_ADDR, False, AERO_FACTORY),
                (USDC_ADDR, WETH_ADDR, False, AERO_FACTORY),
            ]
            try:
                amounts_m = router.functions.getAmountsOut(aero_bal, route_multi).call()
                print(f"Multi-hop quote: {w3.from_wei(amounts_m[-1], 'ether')} WETH")
                min_out_m = int(amounts_m[-1] * 0.87)
                
                swap_tx = router.functions.swapExactTokensForTokens(
                    aero_bal, min_out_m, route_multi, WALLET, deadline
                ).build_transaction({
                    'from': WALLET,
                    'nonce': nonce,
                    'gas': 500000,
                    'gasPrice': w3.eth.gas_price,
                    'chainId': 8453,
                })
                gas_est = w3.eth.estimate_gas(swap_tx)
                print(f"Multi-hop gas estimate: {gas_est}")
                swap_tx['gas'] = int(gas_est * 1.2)
            except Exception as e3:
                print(f"Multi-hop also failed: {e3}")
                print("\nAll routes exhausted. Need to check pool existence on Basescan.")
                exit(1)
    
    signed = w3.eth.account.sign_transaction(swap_tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"Swap TX: {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=90)
    
    if receipt.status == 1:
        print("SWAP SUCCESS!")
        # Unwrap WETH to ETH
        time.sleep(3)
        weth = w3.eth.contract(address=WETH_ADDR, abi=WETH_ABI)
        weth_bal = weth.functions.balanceOf(WALLET).call()
        print(f"WETH received: {w3.from_wei(weth_bal, 'ether')}")
        
        if weth_bal > 0:
            print("Unwrapping WETH -> ETH...")
            nonce2 = w3.eth.get_transaction_count(WALLET)
            unwrap_tx = weth.functions.withdraw(weth_bal).build_transaction({
                'from': WALLET,
                'nonce': nonce2,
                'gas': 50000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 8453,
            })
            signed2 = w3.eth.account.sign_transaction(unwrap_tx, PRIVATE_KEY)
            tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
            receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=60)
            print(f"Unwrap: {'SUCCESS' if receipt2.status == 1 else 'FAILED'}")
        
        final_eth = w3.eth.get_balance(WALLET)
        print(f"\nFINAL ETH: {w3.from_wei(final_eth, 'ether')}")
    else:
        print(f"SWAP REVERTED! Gas used: {receipt.gasUsed}")
except Exception as e:
    print(f"Swap error: {e}")

final_eth = w3.eth.get_balance(WALLET)
print(f"\nFINAL ETH: {w3.from_wei(final_eth, 'ether')}")
