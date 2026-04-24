"""
Telegram Command Interface for Bot Control
Listens for commands via Telegram and executes bot management actions.

Commands:
  /status          - Get all bot statuses
  /stop <bot>      - Stop a specific bot
  /start <bot>     - Start a specific bot
  /restart <bot>   - Restart a specific bot
  /refill <chain>  - Force gas refill for a chain
  /balance         - Get all balances
  /gas             - Get gas levels
  /advice          - Get AI advisor recommendations
  /compound        - Trigger profit auto-compound
  /help            - Show available commands
"""

import os
import json
import time
import logging
import subprocess
import requests
import threading
from datetime import datetime, timezone

log = logging.getLogger("telegram-commands")

TG_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TG_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
TG_API = f"https://api.telegram.org/bot{TG_TOKEN}"

# Bot name -> pm2 process name mapping
BOT_MAP = {
    "kraken": "kraken-bot-v2",
    "volt": "volt-kraken",
    "volt-kraken": "volt-kraken",
    "kalshi": "kalshi-bot-v4",
    "polymarket": "polymarket-bot",
    "poly": "polymarket-bot",
    "habff": "habff-arb",
    "hero-farm": "hero-farm-v6",
    "herofarm": "hero-farm-v6",
    "hero-vets": "hero-vets-pulse",
    "pulse": "hero-vets-pulse",
    "base-hero": "base-hero-vol",
}

# Authorized chat IDs
AUTHORIZED = set()
if TG_CHAT_ID:
    AUTHORIZED.add(int(TG_CHAT_ID))

last_update_id = 0


def send_telegram(text, parse_mode="HTML"):
    if not TG_TOKEN or not TG_CHAT_ID:
        return
    try:
        requests.post(
            f"{TG_API}/sendMessage",
            json={"chat_id": TG_CHAT_ID, "text": text, "parse_mode": parse_mode},
            timeout=10
        )
    except Exception as e:
        log.error(f"TG send error: {e}")


def pm2_action(action, process_name):
    try:
        result = subprocess.run(
            ["pm2", action, process_name],
            capture_output=True, text=True, timeout=15
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)


def cmd_status(args):
    try:
        result = subprocess.run(
            ["pm2", "jlist"], capture_output=True, text=True, timeout=10
        )
        procs = json.loads(result.stdout)
        bots = [p for p in procs if p['name'] in BOT_MAP.values()]
        
        lines = ["<b>BOT FLEET STATUS</b>\n"]
        for p in sorted(bots, key=lambda x: x['name']):
            status = p['pm2_env']['status']
            icon = "🟢" if status == "online" else "🔴"
            uptime = p['pm2_env'].get('pm_uptime', 0)
            if uptime:
                hours = (time.time() * 1000 - uptime) / 3600000
                uptime_str = f"{hours:.1f}h"
            else:
                uptime_str = "N/A"
            restarts = p['pm2_env'].get('restart_time', 0)
            lines.append(f"{icon} <b>{p['name']}</b>: {status} | {uptime_str} | ↻{restarts}")
        
        return "\n".join(lines)
    except Exception as e:
        return f"Error getting status: {e}"


def cmd_stop(args):
    if not args:
        return "Usage: /stop <bot_name>\nAvailable: " + ", ".join(sorted(BOT_MAP.keys()))
    bot = args[0].lower()
    if bot not in BOT_MAP:
        return f"Unknown bot '{bot}'. Available: " + ", ".join(sorted(BOT_MAP.keys()))
    pm2_name = BOT_MAP[bot]
    ok, output = pm2_action("stop", pm2_name)
    if ok:
        return f"🛑 <b>{pm2_name}</b> STOPPED"
    return f"Failed to stop {pm2_name}: {output[:200]}"


def cmd_start(args):
    if not args:
        return "Usage: /start <bot_name>"
    bot = args[0].lower()
    if bot not in BOT_MAP:
        return f"Unknown bot '{bot}'. Available: " + ", ".join(sorted(BOT_MAP.keys()))
    pm2_name = BOT_MAP[bot]
    ok, output = pm2_action("start", pm2_name)
    if ok:
        return f"🟢 <b>{pm2_name}</b> STARTED"
    return f"Failed to start {pm2_name}: {output[:200]}"


def cmd_restart(args):
    if not args:
        return "Usage: /restart <bot_name>"
    bot = args[0].lower()
    if bot not in BOT_MAP:
        return f"Unknown bot '{bot}'. Available: " + ", ".join(sorted(BOT_MAP.keys()))
    pm2_name = BOT_MAP[bot]
    ok, output = pm2_action("restart", pm2_name)
    if ok:
        return f"🔄 <b>{pm2_name}</b> RESTARTED"
    return f"Failed to restart {pm2_name}: {output[:200]}"


def cmd_refill(args):
    if not args:
        return "Usage: /refill <chain>\nChains: base, pulse, polymarket"
    chain = args[0].lower()
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "auto_refill", "/opt/apex-agent/auto_refill_patch.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        
        if chain in ("base", "habff"):
            result = mod.refill_habff_base()
            return f"⛽ BASE refill: {result}"
        elif chain in ("pulse", "pulsechain"):
            result = mod.refill_pulsechain()
            return f"⛽ PulseChain refill: {result}"
        elif chain in ("poly", "polymarket"):
            return "⛽ Polymarket auto-refill runs on Hetzner (check auto-sustain)"
        else:
            return f"Unknown chain '{chain}'. Available: base, pulse, polymarket"
    except Exception as e:
        return f"Refill error: {e}"


def cmd_balance(args):
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "trading_bots_api", "/opt/apex-agent/trading_bots_api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        data = mod.get_all_bot_data()
        
        lines = ["<b>BALANCES</b>\n"]
        for bot in data.get('bots', []):
            usd = bot.get('usd_value', 0)
            if usd:
                lines.append(f"💰 {bot['name']}: ${usd:.2f}")
        
        onchain = data.get('onchain', {})
        lines.append("\n<b>ON-CHAIN:</b>")
        for k, v in onchain.items():
            if v and v > 0:
                lines.append(f"  {k}: {v:,.4f}")
        
        return "\n".join(lines)
    except Exception as e:
        return f"Balance error: {e}"


def cmd_gas(args):
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "trading_bots_api", "/opt/apex-agent/trading_bots_api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        data = mod.get_all_bot_data()
        
        lines = ["<b>GAS LEVELS</b>\n"]
        for bot in data.get('bots', []):
            gas = bot.get('gas_status', 'unknown')
            level = bot.get('gas_level', 'N/A')
            icon = "🟢" if gas == "OK" else "🟡" if gas == "LOW" else "🔴"
            lines.append(f"{icon} {bot['name']}: {gas} ({level})")
        
        return "\n".join(lines)
    except Exception as e:
        return f"Gas check error: {e}"


def cmd_advice(args):
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "ai_advisor", "/opt/apex-agent/ai_advisor_api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        result = mod.handle_advice()
        if "error" in result:
            return f"AI error: {result['error']}"
        return f"🤖 <b>AI ADVISOR</b>\n\n{result['response']}"
    except Exception as e:
        return f"Advice error: {e}"


def cmd_help(args):
    return """<b>VETSINC OPS COMMANDS</b>

/status - All bot statuses
/stop &lt;bot&gt; - Stop a bot
/start &lt;bot&gt; - Start a bot
/restart &lt;bot&gt; - Restart a bot
/refill &lt;chain&gt; - Force gas refill
/balance - All balances
/gas - Gas levels
/advice - AI recommendations
/help - This message

<b>Bot names:</b> kraken, volt, kalshi, poly, habff, hero-farm, pulse, base-hero"""


COMMANDS = {
    "/status": cmd_status,
    "/stop": cmd_stop,
    "/start": cmd_start,
    "/restart": cmd_restart,
    "/refill": cmd_refill,
    "/balance": cmd_balance,
    "/gas": cmd_gas,
    "/advice": cmd_advice,
    "/help": cmd_help,
}


def process_update(update):
    global last_update_id
    
    update_id = update.get("update_id", 0)
    if update_id <= last_update_id:
        return
    last_update_id = update_id
    
    msg = update.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    text = msg.get("text", "").strip()
    
    if not chat_id or not text:
        return
    
    if chat_id not in AUTHORIZED:
        log.warning(f"Unauthorized chat_id: {chat_id}")
        return
    
    parts = text.split()
    cmd = parts[0].lower().split("@")[0]  # Handle @botname suffix
    args = parts[1:]
    
    if cmd in COMMANDS:
        try:
            response = COMMANDS[cmd](args)
            send_telegram(response)
        except Exception as e:
            send_telegram(f"Command error: {e}")


def poll_updates():
    global last_update_id
    
    try:
        resp = requests.get(
            f"{TG_API}/getUpdates",
            params={"offset": last_update_id + 1, "timeout": 30, "allowed_updates": ["message"]},
            timeout=35
        )
        if resp.status_code == 200:
            data = resp.json()
            for update in data.get("result", []):
                process_update(update)
    except Exception as e:
        log.error(f"Poll error: {e}")
        time.sleep(5)


def start_polling():
    log.info("Telegram command interface started")
    send_telegram("🤖 <b>Command Interface ONLINE</b>\nSend /help for commands")
    
    while True:
        try:
            poll_updates()
        except Exception as e:
            log.error(f"Polling loop error: {e}")
            time.sleep(10)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
    
    if not TG_TOKEN:
        from dotenv import load_dotenv
        load_dotenv("/root/.env_architecture")
        TG_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
        TG_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
        TG_API = f"https://api.telegram.org/bot{TG_TOKEN}"
        if TG_CHAT_ID:
            AUTHORIZED.add(int(TG_CHAT_ID))
    
    start_polling()
