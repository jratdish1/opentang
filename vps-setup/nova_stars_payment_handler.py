import os
import logging
from flask import Flask, request, jsonify
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("NovaStarsPayment")

app = Flask(__name__)

# Environment variables
BOT_TOKEN = os.environ.get("NOVA_BOT_TOKEN")
WEBHOOK_URL = os.environ.get("WEBHOOK_URL")  # e.g., https://api.novareign.ai/webhook

if not BOT_TOKEN:
    logger.warning("NOVA_BOT_TOKEN environment variable is not set. Payments will fail.")

TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

# ==========================================
# PAYMENT CONFIGURATION
# ==========================================

# PPV Content Catalog (Mock DB)
# In production, this should pull from a database or secure storage
CATALOG = {
    "ppv_vid_001": {
        "title": "Exclusive Studio Session 🎧",
        "description": "Unlock the raw, unedited 2AM studio session.",
        "price_stars": 150,
        "content_url": "https://fanvue.com/novareign/exclusive/vid_001",
        "delivery_message": "Here's the exclusive session you unlocked. Enjoy... 😘"
    },
    "ppv_pic_002": {
        "title": "Behind the Scenes 📸",
        "description": "What happens after the shoot.",
        "price_stars": 50,
        "content_url": "https://fanvue.com/novareign/exclusive/pic_002",
        "delivery_message": "Just for you. 💋"
    }
}

# ==========================================
# TELEGRAM API HELPERS
# ==========================================

def send_message(chat_id, text):
    """Send a standard text message."""
    url = f"{TELEGRAM_API_URL}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    try:
        requests.post(url, json=payload)
    except Exception as e:
        logger.error(f"Failed to send message: {e}")

def send_invoice(chat_id, item_id, is_tip=False, tip_amount=100):
    """Send an invoice for Telegram Stars (XTR)."""
    url = f"{TELEGRAM_API_URL}/sendInvoice"
    
    if is_tip:
        title = "Tip Nova 💋"
        description = "Show some love and get a special voice note in return."
        payload_id = f"tip_{chat_id}_{tip_amount}"
        prices = [{"label": "Tip Amount", "amount": tip_amount}]
    else:
        item = CATALOG.get(item_id)
        if not item:
            send_message(chat_id, "Sorry, that content is no longer available.")
            return
        title = item["title"]
        description = item["description"]
        payload_id = f"ppv_{item_id}"
        prices = [{"label": "Unlock Price", "amount": item["price_stars"]}]

    payload = {
        "chat_id": chat_id,
        "title": title,
        "description": description,
        "payload": payload_id,
        "currency": "XTR",  # Telegram Stars MUST use XTR
        "prices": prices
    }
    
    try:
        response = requests.post(url, json=payload)
        result = response.json()
        if not result.get("ok"):
            logger.error(f"Failed to send invoice: {result}")
    except Exception as e:
        logger.error(f"Error sending invoice: {e}")

def answer_pre_checkout_query(query_id, ok=True, error_message=None):
    """Confirm the order before final charge."""
    url = f"{TELEGRAM_API_URL}/answerPreCheckoutQuery"
    payload = {
        "pre_checkout_query_id": query_id,
        "ok": ok
    }
    if not ok and error_message:
        payload["error_message"] = error_message
        
    try:
        requests.post(url, json=payload)
    except Exception as e:
        logger.error(f"Failed to answer pre-checkout: {e}")

def deliver_content(chat_id, payload_id):
    """Deliver the purchased content or tip acknowledgment."""
    if payload_id.startswith("tip_"):
        # Handle Tip delivery
        send_message(chat_id, "Thank you so much for the tip! You're amazing. 😘 I'll be sending you a special voice note soon.")
        # In a full implementation, you'd trigger the TTS pipeline here to generate and send a voice note
        
    elif payload_id.startswith("ppv_"):
        # Handle PPV delivery
        item_id = payload_id.replace("ppv_", "")
        item = CATALOG.get(item_id)
        if item:
            message = f"{item['delivery_message']}\n\nAccess it here: {item['content_url']}"
            send_message(chat_id, message)
        else:
            send_message(chat_id, "Thank you for the purchase! There was an issue retrieving the link. Please message support.")

# ==========================================
# WEBHOOK HANDLER
# ==========================================

@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle incoming updates from Telegram."""
    update = request.json
    if not update:
        return jsonify({"status": "ok"})

    # 1. Handle Pre-Checkout Query (User clicked Pay, Telegram is verifying)
    if "pre_checkout_query" in update:
        query = update["pre_checkout_query"]
        query_id = query["id"]
        payload_id = query["invoice_payload"]
        
        # Verify the item still exists
        if payload_id.startswith("ppv_"):
            item_id = payload_id.replace("ppv_", "")
            if item_id not in CATALOG:
                answer_pre_checkout_query(query_id, ok=False, error_message="This content is no longer available.")
                return jsonify({"status": "ok"})
                
        # Approve the charge
        answer_pre_checkout_query(query_id, ok=True)
        return jsonify({"status": "ok"})

    # 2. Handle Successful Payment (Charge went through)
    if "message" in update and "successful_payment" in update["message"]:
        message = update["message"]
        chat_id = message["chat"]["id"]
        payment = message["successful_payment"]
        payload_id = payment["invoice_payload"]
        
        logger.info(f"Successful payment received from {chat_id} for {payload_id} ({payment['total_amount']} {payment['currency']})")
        
        # Deliver the goods
        deliver_content(chat_id, payload_id)
        return jsonify({"status": "ok"})

    # 3. Handle Commands (For testing the flow)
    if "message" in update and "text" in update["message"]:
        message = update["message"]
        chat_id = message["chat"]["id"]
        text = message["text"]
        
        if text.startswith("/tip"):
            send_invoice(chat_id, item_id=None, is_tip=True, tip_amount=100)
            
        elif text.startswith("/ppv"):
            # Send the first item in the catalog as a demo
            send_invoice(chat_id, item_id="ppv_vid_001")
            
    return jsonify({"status": "ok"})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "nova_stars_payment"})

if __name__ == '__main__':
    # Run the Flask app (In production, use gunicorn or waitress)
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
