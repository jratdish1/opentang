"""
Telegram Test Environment End-to-End Simulation
Simulates the full /tip and /ppv payment flow using mock Telegram updates.
Run this BEFORE going live to verify the full state machine.
"""
import os
import sqlite3
import json
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ["NOVA_BOT_TOKEN"] = "TEST_TOKEN"
os.environ["WEBHOOK_SECRET_TOKEN"] = "TEST_SECRET"
os.environ["DB_PATH"] = "/tmp/e2e_test_nova.db"

from nova_stars_payment_handler import app, init_db, DB_PATH
from unittest.mock import patch
import requests

# Clean slate
if os.path.exists("/tmp/e2e_test_nova.db"):
    os.remove("/tmp/e2e_test_nova.db")

init_db()
client = app.test_client()
HEADERS = {'X-Telegram-Bot-Api-Secret-Token': 'TEST_SECRET', 'Content-Type': 'application/json'}

# Seed test SKU
with sqlite3.connect(DB_PATH) as conn:
    conn.cursor().execute("INSERT INTO sku_allowlist VALUES ('tip_100','Nova Tip','A tip',100,'Thank you! 💋',1)")
    conn.commit()

PASS = 0
FAIL = 0

def check(label, condition):
    global PASS, FAIL
    if condition:
        print(f"  ✅ PASS: {label}")
        PASS += 1
    else:
        print(f"  ❌ FAIL: {label}")
        FAIL += 1

print("\n🚨 VETS GO AUTHORIZED — Running E2E Test Suite 🚨\n")

# ─── TEST 1: /tip command creates PENDING order ─────────────────────────────
print("TEST 1: /tip command → creates PENDING order")
with patch('nova_stars_payment_handler.requests.post') as mock_post:
    res = client.post('/webhook', json={
        "message": {"chat": {"id": 1, "type": "private"}, "from": {"id": 999, "username": "testuser"}, "text": "/tip"}
    }, headers=HEADERS)
    check("Webhook returns 200", res.status_code == 200)
    with sqlite3.connect(DB_PATH) as conn:
        order = conn.cursor().execute("SELECT state FROM orders WHERE telegram_user_id=999").fetchone()
    check("Order created in PENDING state", order and order[0] == 'PENDING')
    check("Invoice sent to user", mock_post.called)

# ─── TEST 2: pre_checkout_query validates and approves ───────────────────────
print("\nTEST 2: pre_checkout_query → validates and moves to APPROVED_PENDING_CHARGE")
with sqlite3.connect(DB_PATH) as conn:
    order_id = conn.cursor().execute("SELECT internal_order_id FROM orders WHERE telegram_user_id=999").fetchone()[0]

with patch('nova_stars_payment_handler.requests.post') as mock_post:
    res = client.post('/webhook', json={
        "pre_checkout_query": {"id": "query_1", "invoice_payload": order_id}
    }, headers=HEADERS)
    check("Webhook returns 200", res.status_code == 200)
    call_args = mock_post.call_args[1]['json']
    check("answerPreCheckoutQuery ok=True", call_args.get('ok') == True)
    with sqlite3.connect(DB_PATH) as conn:
        state = conn.cursor().execute("SELECT state FROM orders WHERE internal_order_id=?", (order_id,)).fetchone()[0]
    check("State is APPROVED_PENDING_CHARGE", state == 'APPROVED_PENDING_CHARGE')

# ─── TEST 3: successful_payment delivers content ─────────────────────────────
print("\nTEST 3: successful_payment → delivers content and moves to FULFILLED")
with patch('nova_stars_payment_handler.requests.post') as mock_post:
    res = client.post('/webhook', json={
        "message": {
            "chat": {"id": 1, "type": "private"},
            "successful_payment": {
                "currency": "XTR", "total_amount": 100,
                "invoice_payload": order_id,
                "telegram_payment_charge_id": "tg_charge_001",
                "provider_payment_charge_id": "prov_001"
            }
        }
    }, headers=HEADERS)
    check("Webhook returns 200", res.status_code == 200)
    check("Content delivered to user", mock_post.called)
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.cursor().execute("SELECT state FROM orders WHERE internal_order_id=?", (order_id,)).fetchone()
    check("State is FULFILLED", row and row[0] == 'FULFILLED')

# ─── TEST 4: Idempotency — duplicate successful_payment is rejected ──────────
print("\nTEST 4: Duplicate successful_payment → rejected (idempotency)")
with patch('nova_stars_payment_handler.requests.post') as mock_post:
    res = client.post('/webhook', json={
        "message": {
            "chat": {"id": 1, "type": "private"},
            "successful_payment": {
                "currency": "XTR", "total_amount": 100,
                "invoice_payload": order_id,
                "telegram_payment_charge_id": "tg_charge_001_DUPLICATE",
                "provider_payment_charge_id": "prov_001_DUPLICATE"
            }
        }
    }, headers=HEADERS)
    check("Webhook returns 200", res.status_code == 200)
    check("No duplicate delivery", not mock_post.called)

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"E2E TEST RESULTS: {PASS} PASS / {FAIL} FAIL")
if FAIL == 0:
    print("✅ ALL TESTS PASSED — SYSTEM CLEARED FOR LIVE DEPLOYMENT")
else:
    print("❌ FAILURES DETECTED — DO NOT DEPLOY LIVE")
print(f"{'='*50}\n")
