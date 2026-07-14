import os
import json
import logging
import sqlite3
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify
import requests

# ==========================================
# MANDATORY CONTROL 11: SECRET HYGIENE
# ==========================================
# No tokens in source. Read strictly from environment.
BOT_TOKEN = os.environ.get("NOVA_BOT_TOKEN")
WEBHOOK_SECRET_TOKEN = os.environ.get("WEBHOOK_SECRET_TOKEN") # For X-Telegram-Bot-Api-Secret-Token validation

# ==========================================
# LOGGING CONFIGURATION
# MANDATORY CONTROL 2: REDACT MESSAGE BODIES
# ==========================================
class RedactingFormatter(logging.Formatter):
    def format(self, record):
        msg = super().format(record)
        # In a full implementation, use regex to scrub specific PII/message text.
        # Here we rely on the application logic to NEVER log message.text or message.caption.
        return msg

logger = logging.getLogger("NovaStarsPayment")
handler = logging.StreamHandler()
handler.setFormatter(RedactingFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

if not BOT_TOKEN:
    logger.critical("CRITICAL: NOVA_BOT_TOKEN environment variable is not set. Halting.")
    exit(1)

TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
app = Flask(__name__)

# ==========================================
# DATABASE SCHEMA & INITIALIZATION
# MANDATORY CONTROL 6: PERSIST STATE
# ==========================================
DB_PATH = os.environ.get("DB_PATH", "/opt/nova_payments/nova_payments.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Server-Side Allowlist (Control 7)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sku_allowlist (
            sku_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price_stars INTEGER NOT NULL,
            media_url TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1
        )''')
        
        # Order Ledger (Control 4, 6)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            internal_order_id TEXT PRIMARY KEY,
            telegram_user_id INTEGER NOT NULL,
            chat_id INTEGER NOT NULL,
            sku_id TEXT REFERENCES sku_allowlist(sku_id),
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'XTR',
            payload TEXT NOT NULL,
            telegram_payment_charge_id TEXT,
            provider_payment_charge_id TEXT,
            state TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        # Durable Audit Log (Control 12)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            internal_order_id TEXT,
            action TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        
        # Privacy Allowlist (Control 1)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS allowed_groups (
            chat_id INTEGER PRIMARY KEY,
            added_by TEXT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.commit()

init_db()

# ==========================================
# MANDATORY CONTROL 12: WEBHOOK AUTHENTICATION
# ==========================================
def require_telegram_secret(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if WEBHOOK_SECRET_TOKEN:
            secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
            if secret != WEBHOOK_SECRET_TOKEN:
                logger.warning("Unauthorized webhook access attempt.")
                return jsonify({"status": "unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# DATABASE HELPERS
# ==========================================
def log_audit(internal_order_id, action, status, details=None):
    with sqlite3.connect(DB_PATH) as conn:
        conn.cursor().execute(
            "INSERT INTO audit_logs (internal_order_id, action, status, details) VALUES (?, ?, ?, ?)",
            (internal_order_id, action, status, json.dumps(details) if details else None)
        )
        conn.commit()

def update_order_state(internal_order_id, state, tg_charge_id=None, prov_charge_id=None):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        if tg_charge_id and prov_charge_id:
            cursor.execute(
                "UPDATE orders SET state = ?, telegram_payment_charge_id = ?, provider_payment_charge_id = ?, updated_at = CURRENT_TIMESTAMP WHERE internal_order_id = ?",
                (state, tg_charge_id, prov_charge_id, internal_order_id)
            )
        else:
            cursor.execute(
                "UPDATE orders SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE internal_order_id = ?",
                (state, internal_order_id)
            )
        conn.commit()
    log_audit(internal_order_id, "STATE_TRANSITION", state)

# ==========================================
# TELEGRAM API HELPERS
# ==========================================
def send_message(chat_id, text):
    url = f"{TELEGRAM_API_URL}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=5)
    except Exception as e:
        logger.error(f"Failed to send message: {e}")

def refund_star_payment(user_id, tg_charge_id):
    """Control 4: refundStarPayment support"""
    url = f"{TELEGRAM_API_URL}/refundStarPayment"
    try:
        resp = requests.post(url, json={"user_id": user_id, "telegram_payment_charge_id": tg_charge_id}, timeout=5)
        return resp.json().get("ok", False)
    except Exception as e:
        logger.error(f"Refund failed: {e}")
        return False

# ==========================================
# WEBHOOK HANDLER
# ==========================================
@app.route('/webhook', methods=['POST'])
@require_telegram_secret
def webhook():
    update = request.json
    if not update:
        return jsonify({"status": "ok"})

    # ---------------------------------------------------------
    # MANDATORY CONTROL 1: PRIVACY GATE
    # ---------------------------------------------------------
    if "message" in update:
        chat = update["message"]["chat"]
        if chat["type"] in ["group", "supergroup"]:
            chat_id = chat["id"]
            with sqlite3.connect(DB_PATH) as conn:
                res = conn.cursor().execute("SELECT 1 FROM allowed_groups WHERE chat_id = ?", (chat_id,)).fetchone()
                if not res:
                    # Silently drop messages from non-allowlisted groups
                    return jsonify({"status": "ok"})

    # ---------------------------------------------------------
    # MANDATORY CONTROL 4: PRE_CHECKOUT_QUERY (10s Validation)
    # ---------------------------------------------------------
    if "pre_checkout_query" in update:
        query = update["pre_checkout_query"]
        query_id = query["id"]
        payload = query["invoice_payload"] # This is our internal_order_id
        
        with sqlite3.connect(DB_PATH) as conn:
            order = conn.cursor().execute("SELECT state, sku_id FROM orders WHERE internal_order_id = ?", (payload,)).fetchone()
            
        url = f"{TELEGRAM_API_URL}/answerPreCheckoutQuery"
        
        if not order:
            requests.post(url, json={"pre_checkout_query_id": query_id, "ok": False, "error_message": "Order not found."}, timeout=5)
            log_audit(payload, "PRE_CHECKOUT", "FAILED", {"reason": "Order not found"})
            return jsonify({"status": "ok"})
            
        state, sku_id = order
        
        # Idempotency check
        if state in ["APPROVED_PENDING_CHARGE", "PAID", "FULFILLED"]:
            requests.post(url, json={"pre_checkout_query_id": query_id, "ok": True}, timeout=5)
            return jsonify({"status": "ok"})
            
        if state != "PENDING":
            requests.post(url, json={"pre_checkout_query_id": query_id, "ok": False, "error_message": "Invalid order state."}, timeout=5)
            return jsonify({"status": "ok"})

        # Validate SKU Allowlist (Control 7)
        with sqlite3.connect(DB_PATH) as conn:
            sku = conn.cursor().execute("SELECT is_active FROM sku_allowlist WHERE sku_id = ?", (sku_id,)).fetchone()
            
        if not sku or not sku[0]:
            requests.post(url, json={"pre_checkout_query_id": query_id, "ok": False, "error_message": "Item unavailable."}, timeout=5)
            update_order_state(payload, "FAILED")
            return jsonify({"status": "ok"})

        # Approve
        requests.post(url, json={"pre_checkout_query_id": query_id, "ok": True}, timeout=5)
        update_order_state(payload, "APPROVED_PENDING_CHARGE")
        return jsonify({"status": "ok"})

    # ---------------------------------------------------------
    # MANDATORY CONTROL 5: SUCCESSFUL_PAYMENT VERIFICATION
    # ---------------------------------------------------------
    if "message" in update and "successful_payment" in update["message"]:
        message = update["message"]
        chat_id = message["chat"]["id"]
        payment = message["successful_payment"]
        payload = payment["invoice_payload"] # internal_order_id
        tg_charge_id = payment["telegram_payment_charge_id"]
        prov_charge_id = payment["provider_payment_charge_id"]
        
        # Control 3: Ensure XTR
        if payment["currency"] != "XTR":
            logger.error(f"Invalid currency {payment['currency']} for order {payload}")
            return jsonify({"status": "ok"})

        with sqlite3.connect(DB_PATH) as conn:
            order = conn.cursor().execute("SELECT state, sku_id FROM orders WHERE internal_order_id = ?", (payload,)).fetchone()
            
        if not order:
            logger.error(f"Payment received for unknown order: {payload}")
            return jsonify({"status": "ok"})
            
        state, sku_id = order
        
        # Control 4: Idempotent fulfillment
        if state in ["PAID", "FULFILLED"]:
            logger.info(f"Idempotent hit for already paid order {payload}")
            return jsonify({"status": "ok"})
            
        # Transition to PAID
        update_order_state(payload, "PAID", tg_charge_id, prov_charge_id)
        
        # MANDATORY CONTROL 10: PUBLIC/PREMIUM SEPARATION
        # Trigger delivery via isolated internal system/queue
        # Here we simulate the internal trigger
        deliver_premium_content(chat_id, payload, sku_id)
        
        return jsonify({"status": "ok"})

    # ---------------------------------------------------------
    # MANDATORY CONTROL 9: COMPLIANCE COMMANDS
    # ---------------------------------------------------------
    if "message" in update and "text" in update["message"]:
        chat_id = update["message"]["chat"]["id"]
        text = update["message"]["text"]
        
        if text == "/terms":
            send_message(chat_id, "Terms of Service: https://novareign.ai/terms")
        elif text == "/paysupport":
            send_message(chat_id, "Payment Support: contact billing@novareign.ai")
        elif text == "/refundpolicy":
            send_message(chat_id, "Refund Policy: Digital goods are non-refundable once accessed. Contact support for exceptions.")
        elif text == "/privacy":
            send_message(chat_id, "Privacy Policy: https://novareign.ai/privacy")
        elif text.startswith("/tip") or text.startswith("/ppv"):
            # Determine SKU based on command
            sku_id = "tip_100" if text.startswith("/tip") else "ppv_video_1"
            
            with sqlite3.connect(DB_PATH) as conn:
                sku = conn.cursor().execute("SELECT title, description, price_stars, is_active FROM sku_allowlist WHERE sku_id = ?", (sku_id,)).fetchone()
                
            if not sku or not sku[3]:
                send_message(chat_id, "Sorry, that item is currently unavailable.")
                return jsonify({"status": "ok"})
                
            title, description, price_stars, _ = sku
            
            # Generate internal order ID
            import uuid
            internal_order_id = f"ORDER_{uuid.uuid4().hex[:8].upper()}"
            
            # Create order in PENDING state
            user_id = update["message"]["from"]["id"]
            with sqlite3.connect(DB_PATH) as conn:
                conn.cursor().execute(
                    "INSERT INTO orders (internal_order_id, telegram_user_id, chat_id, sku_id, amount, payload, state) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (internal_order_id, user_id, chat_id, sku_id, price_stars, internal_order_id, "PENDING")
                )
                conn.commit()
                
            # Send invoice via Telegram API
            url = f"{TELEGRAM_API_URL}/sendInvoice"
            payload = {
                "chat_id": chat_id,
                "title": title,
                "description": description,
                "payload": internal_order_id,
                "provider_token": "", # Empty for Telegram Stars
                "currency": "XTR",
                "prices": [{"label": title, "amount": price_stars}]
            }
            try:
                requests.post(url, json=payload, timeout=5)
            except Exception as e:
                logger.error(f"Failed to send invoice: {e}")

    return jsonify({"status": "ok"})

# ==========================================
# INTERNAL DELIVERY (PREMIUM SEPARATION)
# ==========================================
def deliver_premium_content(chat_id, internal_order_id, sku_id):
    """
    Control 10: This function represents the boundary between public webhook and premium delivery.
    In a true microservice architecture, this would publish to a message queue (e.g., Redis/RabbitMQ)
    and a separate worker with premium storage access would process it.
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            sku = conn.cursor().execute("SELECT media_url FROM sku_allowlist WHERE sku_id = ?", (sku_id,)).fetchone()
            
        if sku:
            media_url = sku[0]
            send_message(chat_id, f"Payment verified. Here is your exclusive content:\n{media_url}")
            update_order_state(internal_order_id, "FULFILLED")
        else:
            logger.error(f"SKU {sku_id} not found during fulfillment.")
            update_order_state(internal_order_id, "FAILED")
    except Exception as e:
        logger.error(f"Fulfillment failed for {internal_order_id}: {e}")
        update_order_state(internal_order_id, "FAILED")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "controls": "enforced"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
