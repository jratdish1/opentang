#!/usr/bin/env python3
"""
APEX Alert Escalation — Hourly Server Health Check
====================================================
Checks all 3 servers every hour. If any server is DOWN:
  - First alert: Immediate CRITICAL notification
  - Subsequent: Hourly reminders until issue is resolved
  - Tracks unresolved issues in /tmp/apex_escalation_state.json

Designed to run via cron every hour.
"""
import os
import sys
import json
import time
import subprocess
import logging
from datetime import datetime, timedelta

sys.path.insert(0, '/opt/apex-agent')
logging.basicConfig(level=logging.INFO, format="%(asctime)s [ESCALATION] %(message)s")
log = logging.getLogger(__name__)

STATE_FILE = "/tmp/apex_escalation_state.json"

SERVERS = {
    "VDS": {"ip": "127.0.0.1", "check": "local", "role": "AI Agents + Telemetry"},
    "VPS1": {"ip": "62.146.175.67", "check": "ssh", "alias": "vps1", "role": "herobase.io, vicfoundation.com"},
    "VPS2": {"ip": "85.239.239.206", "check": "ssh", "alias": "vps2", "role": "mining.vetsincrypto.com + domains"},
}

SITES = [
    {"name": "herobase.io", "url": "https://herobase.io", "server": "VPS1"},
    {"name": "vicfoundation.com", "url": "https://vicfoundation.com", "server": "VPS1"},
    {"name": "mining.vetsincrypto.com", "url": "https://mining.vetsincrypto.com", "server": "VPS2"},
    {"name": "ops.vetsincrypto.com", "url": "https://ops.vetsincrypto.com", "server": "VDS"},
]


def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"issues": {}, "last_check": None}


def save_state(state):
    state["last_check"] = datetime.now().isoformat()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def check_server_ssh(ip, alias=None):
    """Check if server is reachable via SSH. Uses alias from ~/.ssh/config if available."""
    target = alias if alias else f"root@{ip}"
    try:
        result = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=10", target, "echo OK"],
            capture_output=True, text=True, timeout=20
        )
        return result.returncode == 0 and "OK" in result.stdout
    except Exception:
        return False


def check_server_local():
    """Check if local server is healthy."""
    try:
        result = subprocess.run(["uptime"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False


def check_site(url):
    """Check if a website is responding."""
    try:
        result = subprocess.run(
            ["curl", "-sI", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "10", url],
            capture_output=True, text=True, timeout=15
        )
        code = int(result.stdout.strip())
        return 200 <= code < 400
    except Exception:
        return False


def send_alert(title, message, level="critical"):
    """Send alert via the existing Telegram bot."""
    try:
        from core.alerts.telegram_bot import TelegramAlerts, AlertConfig
        config = AlertConfig.from_env()
        bot = TelegramAlerts(config=config)
        bot.custom(title, message, level=level)
        log.info(f"Alert sent: {title}")
    except Exception as e:
        log.error(f"Failed to send alert: {e}")
        # Fallback: direct API call
        try:
            token = os.getenv("TELEGRAM_BOT_TOKEN", "")
            chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
            if token and chat_id:
                import requests
                requests.post(
                    f"https://api.telegram.org/bot{token}/sendMessage",
                    json={"chat_id": chat_id, "text": f"🚨 {title}\n\n{message}", "parse_mode": "HTML"},
                    timeout=10
                )
        except Exception:
            pass


def main():
    log.info("Starting hourly escalation check...")

    # Load .env
    env_file = "/opt/apex-agent/.env"
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

    state = load_state()
    issues = state.get("issues", {})
    new_issues = {}
    resolved = []
    current_problems = []

    # Check servers
    for name, info in SERVERS.items():
        if info["check"] == "local":
            ok = check_server_local()
        else:
            ok = check_server_ssh(info["ip"], alias=info.get("alias"))

        if not ok:
            current_problems.append(f"🔴 {name} ({info['ip']}) — {info['role']}")
            if name in issues:
                # Existing issue — increment escalation count
                issues[name]["count"] = issues[name].get("count", 0) + 1
                issues[name]["last_alert"] = datetime.now().isoformat()
                new_issues[name] = issues[name]
            else:
                # New issue
                new_issues[name] = {
                    "first_seen": datetime.now().isoformat(),
                    "last_alert": datetime.now().isoformat(),
                    "count": 1,
                    "type": "server",
                    "detail": f"{name} ({info['ip']}) unreachable"
                }
        else:
            if name in issues:
                resolved.append(f"✅ {name} ({info['ip']}) — RECOVERED")

    # Check websites
    for site in SITES:
        ok = check_site(site["url"])
        key = f"site_{site['name']}"

        if not ok:
            current_problems.append(f"🔴 {site['name']} — HTTP check failed")
            if key in issues:
                issues[key]["count"] = issues[key].get("count", 0) + 1
                issues[key]["last_alert"] = datetime.now().isoformat()
                new_issues[key] = issues[key]
            else:
                new_issues[key] = {
                    "first_seen": datetime.now().isoformat(),
                    "last_alert": datetime.now().isoformat(),
                    "count": 1,
                    "type": "website",
                    "detail": f"{site['name']} not responding"
                }
        else:
            if key in issues:
                resolved.append(f"✅ {site['name']} — RECOVERED")

    # Send alerts for current problems
    if current_problems:
        max_count = max(i.get("count", 1) for i in new_issues.values()) if new_issues else 1
        title = f"INFRASTRUCTURE ALERT (Escalation #{max_count})"
        msg = "\n".join(current_problems)
        msg += f"\n\n<b>Checked:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        msg += f"\n<b>Next check:</b> 1 hour"
        if max_count > 3:
            msg += f"\n\n⚠️ <b>UNRESOLVED FOR {max_count} HOURS</b>"
        send_alert(title, msg, level="critical")

    # Send recovery notifications
    if resolved:
        title = "INFRASTRUCTURE RECOVERED"
        msg = "\n".join(resolved)
        msg += f"\n\n<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        send_alert(title, msg, level="success")

    # Update state
    state["issues"] = new_issues
    save_state(state)

    # Summary
    total_checks = len(SERVERS) + len(SITES)
    problems = len(current_problems)
    log.info(f"Check complete: {total_checks - problems}/{total_checks} healthy, {problems} issues, {len(resolved)} recovered")


if __name__ == "__main__":
    main()
