import os
import requests
import sys

def configure_bot(token, name, description, short_description, commands):
    if not token:
        print(f"[{name}] Token missing, skipping configuration.")
        return False

    print(f"\n=== Configuring {name} ===")
    
    # 1. Set Description
    res = requests.post(
        f"https://api.telegram.org/bot{token}/setMyDescription",
        json={"description": description}
    ).json()
    print(f"Description update: {res.get('ok')} | {res}")

    # 2. Set Short Description
    res = requests.post(
        f"https://api.telegram.org/bot{token}/setMyShortDescription",
        json={"short_description": short_description}
    ).json()
    print(f"Short description update: {res.get('ok')} | {res}")

    # 3. Set Commands
    res = requests.post(
        f"https://api.telegram.org/bot{token}/setMyCommands",
        json={"commands": commands}
    ).json()
    print(f"Commands update: {res.get('ok')} | {res}")
    
    return True

if __name__ == "__main__":
    # Expect tokens as environment variables to keep them out of source code
    nova_token = os.environ.get("NOVA_BOT_TOKEN")
    marine_token = os.environ.get("MARINE_BOT_TOKEN")

    # --- NOVA REIGN BOT CONFIG ---
    nova_desc = """Meet Nova Reign 💋 — your bold, unapologetically confident AI companion.

🔥 Exclusive content drops & PPV previews
🎥 Behind-the-scenes teasers
🐾 BDSM & fantasy content for members
🪖 Military-themed, tatted & unforgettable
💬 Secretary mode: I manage your schedule, reminders & more
⭐ Payments accepted — tap here to pay with Stars

18+ only. All content is AI-generated."""

    nova_short = "Nova Reign: exclusive AI content, PPV, BDSM & fantasy. Secretary mode. ⭐ Pay with Stars. 18+ only."
    
    nova_cmds = [
        {"command": "start", "description": "Wake up Nova"},
        {"command": "tip", "description": "Send a tip via Telegram Stars"},
        {"command": "ppv", "description": "Unlock exclusive content"},
        {"command": "terms", "description": "View terms of service"},
        {"command": "privacy", "description": "View privacy policy"}
    ]

    # --- MARINE BOT CONFIG ---
    marine_desc = """MARINE Bot for Manus — Overwatch & Automation 🦅

I manage group security, enforce rules, kick scammers, and maintain operational discipline.
Powered by Manus AI."""

    marine_short = "MARINE Bot: Group security, anti-scam moderation, and operational overwatch."
    
    marine_cmds = [
        {"command": "start", "description": "Initialize MARINE bot"},
        {"command": "status", "description": "Check operational status"},
        {"command": "rules", "description": "View group rules"}
    ]

    # Execute
    configure_bot(nova_token, "Nova Reign Bot", nova_desc, nova_short, nova_cmds)
    configure_bot(marine_token, "MARINE Bot", marine_desc, marine_short, marine_cmds)
    
    print("\n[NOTE] To grant group admin powers, you must manually add the bots to your Telegram group and promote them to Administrator with 'Delete Messages' and 'Ban Users' permissions. The API cannot force a bot to become an admin of a group it doesn't own.")
