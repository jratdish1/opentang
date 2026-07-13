# Nova Reign Telegram Bot: Privacy & Payments Guide

## 1. Disabling Privacy Mode via BotFather

Telegram enforces a strict rule: **Privacy Mode can only be toggled manually via @BotFather.** It cannot be disabled via the API. 

If privacy mode is ON, Nova cannot read messages in group chats unless she is explicitly tagged (e.g., `@NOVA_REIGN_OFFICIAL_BOT`). For Secretary Mode to work seamlessly, privacy mode must be OFF.

**Exact sequence to follow in the Telegram App:**

1. Open Telegram and search for `@BotFather`
2. Send the command: `/mybots`
3. A keyboard menu will appear. Tap on **@NOVA_REIGN_OFFICIAL_BOT**
4. Tap on **Bot Settings**
5. Tap on **Group Privacy**
6. Tap the button that says **Turn off**
7. BotFather will reply with: *"Success! The new status is: DISABLED. The bot will receive all messages added to the group."*

*Note: If Nova is already in a group chat before you do this, you may need to remove her and re-add her to the group for the change to take effect.*

---

## 2. Telegram Payments API (Tips & Digital Goods)

To accept tips, sell PPV (Pay-Per-View) content, or offer subscriptions directly within Telegram, you must use **Telegram Stars (XTR)**. 

Telegram recently mandated that all digital goods and services must be purchased using Telegram Stars to comply with Apple/Google App Store policies.

### How Telegram Stars Work for Nova:
- **Users buy Stars** via in-app purchases (Apple/Google) or via PremiumBot.
- **Users pay Nova** using Stars for tips, PPV photos, or custom video requests.
- **You (the developer) withdraw Stars** as Toncoin (TON) or use them to buy Telegram Ads.

### Integration Plan for Nova Reign

To implement this, we need to update the OpenClaw/Z.AI agent backend that powers Nova to handle the payment flow.

**Step 1: The Invoice (The Pitch)**
When a user asks for exclusive content or wants to tip, Nova sends an invoice.
*API Method:* `sendInvoice`
*Parameters:*
- `title`: "Exclusive PPV Video" or "Tip Nova 💋"
- `description`: "Unlock my latest behind-the-scenes video."
- `payload`: "nova_ppv_vid_001" (Your internal tracking ID)
- `currency`: "XTR" (Telegram Stars)
- `prices`: `[{"label": "Price", "amount": 50}]` (50 Stars)

**Step 2: Pre-Checkout Query (The Verification)**
When the user taps "Pay", Telegram sends an update to your server.
*API Method:* `answerPreCheckoutQuery`
*Action:* Your server must reply `ok: true` within 10 seconds to confirm the item is still available.

**Step 3: Successful Payment (The Delivery)**
Once paid, Telegram sends a `successful_payment` update.
*Action:* Nova automatically replies with the unlocked video/photo or a personalized thank you message for the tip.

### Code Example (Python / OpenClaw implementation)

```python
import requests

BOT_TOKEN = "YOUR_SECURE_TOKEN"

def send_tip_invoice(chat_id):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendInvoice"
    payload = {
        "chat_id": chat_id,
        "title": "Tip Nova 💋",
        "description": "Show some love and get a special voice note in return.",
        "payload": "tip_transaction_123",
        "currency": "XTR",
        "prices": [{"label": "Tip Amount", "amount": 100}] # 100 Stars
    }
    requests.post(url, json=payload)
```

### Next Steps for Payments:
1. Ensure the VDS server is running the webhook to receive Telegram updates.
2. Add the payment handling logic to the OpenClaw agent script.
3. Test the flow using Telegram's test environment (BotFather provides a test mode).
