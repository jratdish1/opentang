import os
import json
import logging
import sqlite3
import requests
from flask import Flask, request, jsonify

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ChatModerationEngine")

# Load tokens from environment (or fail securely)
NOVA_BOT_TOKEN = os.environ.get("NOVA_BOT_TOKEN")
MARINE_BOT_TOKEN = os.environ.get("MARINE_BOT_TOKEN")

if not NOVA_BOT_TOKEN or not MARINE_BOT_TOKEN:
    logger.warning("Bot tokens missing from environment. Moderation engine running in dry-run mode.")

app = Flask(__name__)

# Basic spam/scam filters
SCAM_KEYWORDS = [
    "crypto giveaway", "send eth", "send btc", "guaranteed returns",
    "dm me for", "whatsapp me", "investment plan", "double your money",
    "customer support agent", "admin will never dm you first" # often used by fake admins
]

# Database setup for tracking warnings
DB_PATH = os.environ.get("MODERATION_DB_PATH", "/opt/nova_payments/moderation.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_warnings (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                warning_count INTEGER DEFAULT 0,
                last_warning_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

def send_telegram_message(token, chat_id, text, reply_to_message_id=None):
    if not token:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.error(f"Failed to send message: {e}")

def delete_telegram_message(token, chat_id, message_id):
    if not token:
        return
    url = f"https://api.telegram.org/bot{token}/deleteMessage"
    payload = {"chat_id": chat_id, "message_id": message_id}
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.error(f"Failed to delete message: {e}")

def ban_telegram_user(token, chat_id, user_id):
    if not token:
        return
    url = f"https://api.telegram.org/bot{token}/banChatMember"
    payload = {"chat_id": chat_id, "user_id": user_id}
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.error(f"Failed to ban user: {e}")

def process_message(token, bot_name, message):
    chat_id = message.get("chat", {}).get("id")
    message_id = message.get("message_id")
    text = message.get("text", "").lower()
    from_user = message.get("from", {})
    user_id = from_user.get("id")
    username = from_user.get("username", "Unknown")

    # 1. Welcome new members
    new_members = message.get("new_chat_members", [])
    if new_members:
        for member in new_members:
            if member.get("is_bot"):
                # Kick unauthorized bots immediately
                if member.get("username") not in ["NOVA_REIGN_OFFICIAL_BOT", "Vetsincrypto_bot"]:
                    ban_telegram_user(token, chat_id, member.get("id"))
                    send_telegram_message(token, chat_id, f"🚫 Unauthorized bot @{member.get('username')} kicked.")
            else:
                welcome_msg = (
                    f"Welcome to the group, {member.get('first_name')}! "
                    f"I am {bot_name}. Please read the pinned rules. Scammers will be banned instantly."
                )
                send_telegram_message(token, chat_id, welcome_msg)
        return

    # 2. Anti-scam filter
    if any(keyword in text for keyword in SCAM_KEYWORDS):
        logger.info(f"Scam detected from {username} ({user_id}) in chat {chat_id}")
        
        # Delete message
        delete_telegram_message(token, chat_id, message_id)
        
        # Track warning and ban if necessary
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT OR IGNORE INTO user_warnings (user_id, username) VALUES (?, ?)", (user_id, username))
            cursor.execute("UPDATE user_warnings SET warning_count = warning_count + 1, last_warning_timestamp = CURRENT_TIMESTAMP WHERE user_id = ?", (user_id,))
            cursor.execute("SELECT warning_count FROM user_warnings WHERE user_id = ?", (user_id,))
            warnings = cursor.fetchone()[0]
            conn.commit()

        if warnings >= 2:
            ban_telegram_user(token, chat_id, user_id)
            send_telegram_message(token, chat_id, f"🔨 User @{username} has been banned for repeated scam/spam violations.")
        else:
            send_telegram_message(token, chat_id, f"⚠️ @{username}, your message was flagged as spam/scam and deleted. Next violation results in a ban.")

@app.route('/webhook/nova', methods=['POST'])
def nova_webhook():
    update = request.json
    if "message" in update:
        process_message(NOVA_BOT_TOKEN, "Nova Reign", update["message"])
    return jsonify({"status": "ok"})

@app.route('/webhook/marine', methods=['POST'])
def marine_webhook():
    update = request.json
    if "message" in update:
        process_message(MARINE_BOT_TOKEN, "Marine Bot", update["message"])
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001)
