"""Sell AERO -> ETH via Aerodrome on BASE. AERO is already approved."""
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

ERC20_ABI = json.loads('[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}]')

ROUTER_ABI = json.loads("""[
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"amountIn","type":"uint256"},{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}],"name":"routes","type":"tuple[]"}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]""")

WETH_ABI = json.loads('[{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"type":"function"}]')

# Get AERO balance
aero = w3.eth.contract(address=AERO_ADDR, abi=ERC20_ABI)
aero_bal = aero.functions.balanceOf(WALLET).call()
aero_human = aero_bal / 1e18
print(f"AERO balance: {aero_human:.4f}")
print(f"ETH balance: {w3.from_wei(w3.eth.get_balance(WALLET), 'ether')}")

if aero_bal == 0:
    print("No AERO to sell")
    exit(0)

router = w3.eth.contract(address=AERO_ROUTER, abi=ROUTER_ABI)
route = [(AERO_ADDR, WETH_ADDR, False, AERO_FACTORY)]

# Get quote
time.sleep(1)
amounts = router.functions.getAmountsOut(aero_bal, route).call()
expected_weth = amounts[-1]
print(f"Quote: {aero_human:.2f} AERO -> {w3.from_wei(expected_weth, 'ether')} ETH")

# 13% slippage
min_out = int(expected_weth * 0.87)
deadline = int(time.time()) + 600

# Wait a moment for nonce to settle
time.sleep(3)
nonce = w3.eth.get_transaction_count(WALLET)
print(f"Using nonce: {nonce}")

# Try swapExactTokensForETH first
try:
    swap_tx = router.functions.swapExactTokensForETH(
        aero_bal, min_out, route, WALLET, deadline
    ).build_transaction({
        'from': WALLET, 'nonce': nonce, 'gas': 300000,
        'gasPrice': w3.eth.gas_price, 'chainId': 8453,
    })
    signed = w3.eth.account.sign_transaction(swap_tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"swapExactTokensForETH TX: {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=90)
    
    if receipt.status == 1:
        new_eth = w3.eth.get_balance(WALLET)
        print(f"SUCCESS! New ETH: {w3.from_wei(new_eth, 'ether')}")
    else:
        print("Reverted — trying swapExactTokensForTokens + manual unwrap...")
        time.sleep(2)
        nonce = w3.eth.get_transaction_count(WALLET)
        swap_tx2 = router.functions.swapExactTokensForTokens(
            aero_bal, min_out, route, WALLET, deadline
        ).build_transaction({
            'from': WALLET, 'nonce': nonce, 'gas': 300000,
            'gasPrice': w3.eth.gas_price, 'chainId': 8453,
        })
        signed2 = w3.eth.account.sign_transaction(swap_tx2, PRIVATE_KEY)
        tx_hash2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
        print(f"swapExactTokensForTokens TX: {tx_hash2.hex()}")
        receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2, timeout=90)
        
        if receipt2.status == 1:
            print("Token swap OK! Unwrapping WETH...")
            time.sleep(2)
            weth = w3.eth.contract(address=WETH_ADDR, abi=WETH_ABI + ERC20_ABI)
            weth_bal = weth.functions.balanceOf(WALLET).call()
            print(f"WETH to unwrap: {w3.from_wei(weth_bal, 'ether')}")
            if weth_bal > 0:
                nonce3 = w3.eth.get_transaction_count(WALLET)
                unwrap_tx = weth.functions.withdraw(weth_bal).build_transaction({
                    'from': WALLET, 'nonce': nonce3, 'gas': 50000,
                    'gasPrice': w3.eth.gas_price, 'chainId': 8453,
                })
                signed3 = w3.eth.account.sign_transaction(unwrap_tx, PRIVATE_KEY)
                tx_hash3 = w3.eth.send_raw_transaction(signed3.raw_transaction)
                receipt3 = w3.eth.wait_for_transaction_receipt(tx_hash3, timeout=60)
                new_eth = w3.eth.get_balance(WALLET)
                print(f"Unwrap {'OK' if receipt3.status == 1 else 'FAILED'}")
                print(f"Final ETH: {w3.from_wei(new_eth, 'ether')}")
        else:
            print("Both swap methods failed!")
except Exception as e:
    print(f"Error: {e}")

final_eth = w3.eth.get_balance(WALLET)
print(f"\nFINAL ETH: {w3.from_wei(final_eth, 'ether')}")
