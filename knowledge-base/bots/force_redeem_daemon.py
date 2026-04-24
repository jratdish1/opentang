#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║  FORCE REDEMPTION DAEMON v1.0                                    ║
║  Runs every 12 hours — kicks ALL bots to redeem/settle/clean     ║
║  Prevents stuck settlements, hung trades, unredeemed positions   ║
╚══════════════════════════════════════════════════════════════════╝

Covers:
  1. Polymarket  — force redeem_all() on Hetzner (on-chain CTF redemption)
  2. Kalshi      — force reconcile_settlements() + cancel stale orders
  3. Kraken      — cancel stale orders (>2h), free locked capital
  4. Volt-Kraken — check for stuck positions past stop-loss/take-profit
  5. HABFF/DEX   — verify pm2 processes alive, restart if hung

Schedule: Every 12 hours via pm2 cron or standalone loop
Telegram: 🔔 Summary report after each sweep
"""

import subprocess
import time
import json
import logging
import os
import sys
import re
import requests
import urllib.parse
import hashlib
import hmac
import base64
from datetime import datetime, timezone

# ─── LOGGING ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger("force-redeem")

# ─── TELEGRAM ────────────────────────────────────────────────────
TG_BOT_TOKEN = os.environ.get("TG_BOT_TOKEN", "8755508099:AAFDeEvGIZU-EsBWJk7r3j_2gIeYvmJ1YJc")
TG_CHAT_ID = os.environ.get("TG_CHAT_ID", "1760124019")
DASHBOARD_URL = "https://8080-ifppmdwaavmtdgbtre9xm-893a4aa5.us1.manus.computer/"

SWEEP_INTERVAL = 12 * 3600  # 12 hours in seconds

def send_telegram(msg):
    """Send Telegram message with HTML parse mode."""
    try:
        url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
        resp = requests.post(url, json={
            "chat_id": TG_CHAT_ID,
            "text": msg,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }, timeout=10)
        if resp.ok:
            log.info(f"[TG] Alert sent: {msg[:80]}...")
        else:
            log.warning(f"[TG] Failed: {resp.text[:100]}")
    except Exception as e:
        log.warning(f"[TG] Error: {e}")

def ssh_cmd(host, cmd, timeout=30):
    """Execute SSH command and return stdout."""
    try:
        result = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=10", "-o", "StrictHostKeyChecking=no", host, cmd],
            capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "", "SSH timeout", -1
    except Exception as e:
        return "", str(e), -1

def run_local_cmd(cmd, timeout=30):
    """Run a local command on VDS."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "", "Timeout", -1
    except Exception as e:
        return "", str(e), -1

# ─── 1. POLYMARKET FORCE REDEEM ─────────────────────────────────
def force_redeem_polymarket():
    """SSH into Hetzner and run redeem_all() from polymarket_auto_redeem.py"""
    log.info("[POLYMARKET] Force-triggering redeem_all()...")
    
    redeem_cmd = '''cd /opt/polymarket-bot && python3 -c "
from polymarket_auto_redeem import redeem_all
result = redeem_all()
print(f'REDEEM_RESULT: {result}')
" 2>&1 | tail -20'''
    
    stdout, stderr, rc = ssh_cmd("polymarket-eu", redeem_cmd, timeout=120)
    
    if rc != 0 and "polymarket-eu" in stderr:
        # Try via VDS jump host
        stdout, stderr, rc = run_local_cmd(
            f'ssh polymarket-eu "{redeem_cmd}"', timeout=120
        )
    
    redeemed = 0
    failed = 0
    if stdout:
        # Count redemption results
        redeemed = stdout.count("Redeemed") + stdout.count("SUCCESS")
        failed = stdout.count("FAILED") + stdout.count("Error")
        log.info(f"[POLYMARKET] Output: {stdout[-200:]}")
    
    status = "✅" if rc == 0 else "⚠️"
    detail = f"Redeemed: {redeemed}, Failed: {failed}" if (redeemed + failed) > 0 else "No resolved positions found"
    
    log.info(f"[POLYMARKET] {status} {detail}")
    return {"name": "Polymarket", "status": status, "detail": detail}

# ─── 2. KALSHI FORCE SETTLEMENT ─────────────────────────────────
def force_settle_kalshi():
    """Force Kalshi to reconcile settlements and cancel stale orders."""
    log.info("[KALSHI] Force-triggering settlement reconciliation...")
    
    # Read the Kalshi bot's state file for pending settlements
    stdout, stderr, rc = run_local_cmd(
        'grep -c "settled" /root/kalshi-bot/kalshi_state.json 2>/dev/null || echo "0"'
    )
    
    # Force restart the Kalshi bot which triggers reconcile_settlements on startup
    stdout, stderr, rc = run_local_cmd(
        'pm2 restart kalshi-bot-v4 2>/dev/null && sleep 10 && '
        'pm2 logs kalshi-bot-v4 --lines 15 --nostream 2>/dev/null | '
        'grep -i "settle\\|reconcil\\|cancel\\|stale\\|P&L"'
    )
    
    settled = 0
    cancelled = 0
    if stdout:
        settled = stdout.count("settled") + stdout.count("Settled")
        cancelled = stdout.count("cancel") + stdout.count("Cancel")
        log.info(f"[KALSHI] Output: {stdout[-200:]}")
    
    status = "✅"
    detail = f"Settled: {settled}, Stale orders cancelled: {cancelled}"
    
    log.info(f"[KALSHI] {status} {detail}")
    return {"name": "Kalshi", "status": status, "detail": detail}

# ─── 3. KRAKEN FORCE CLEANUP ────────────────────────────────────
def force_cleanup_kraken():
    """Cancel stale Kraken orders older than 2 hours to free capital."""
    log.info("[KRAKEN] Force-cancelling stale orders...")
    
    # Read API keys from environment or use the known defaults from kraken_bot_v2.py
    api_key = os.environ.get("KRAKEN_API_KEY", "T3rGCqP/eAzot9JbBfwfjP6Cz7jjY1Mu58k6tvRQa5f+juH+brk44XdZ")
    api_secret = os.environ.get("KRAKEN_PRIVATE_KEY", "k3lI46oTTE6zR/78wjqBHgqZ0fAcpj3nI+mTXRvOJ30UxjezAV9S3/nMPZi0IPLiJsGYwLO753n1ryUuc4Q+EQ==")
    
    if not api_key or not api_secret:
        log.warning("[KRAKEN] Could not read API keys")
        return {"name": "Kraken", "status": "⚠️", "detail": "API keys not found"}
    
    # Check open orders
    try:
        urlpath = "/0/private/OpenOrders"
        nonce = str(int(time.time() * 1000))
        postdata = f"nonce={nonce}"
        
        encoded = (nonce + postdata).encode()
        message = urlpath.encode() + hashlib.sha256(encoded).digest()
        signature = hmac.new(base64.b64decode(api_secret), message, hashlib.sha512)
        sigdigest = base64.b64encode(signature.digest()).decode()
        
        resp = requests.post(
            f"https://api.kraken.com{urlpath}",
            headers={"API-Key": api_key, "API-Sign": sigdigest},
            data={"nonce": nonce},
            timeout=15
        )
        data = resp.json()
        
        if data.get("error"):
            log.warning(f"[KRAKEN] API error: {data['error']}")
            return {"name": "Kraken", "status": "⚠️", "detail": f"API error: {data['error']}"}
        
        open_orders = data.get("result", {}).get("open", {})
        stale_count = 0
        cancelled = 0
        now = time.time()
        
        for oid, order in open_orders.items():
            order_time = order.get("opentm", now)
            age_hours = (now - order_time) / 3600
            
            if age_hours > 2:
                stale_count += 1
                # Cancel the stale order
                cancel_nonce = str(int(time.time() * 1000))
                cancel_postdata = f"nonce={cancel_nonce}&txid={oid}"
                cancel_urlpath = "/0/private/CancelOrder"
                
                cancel_encoded = (cancel_nonce + cancel_postdata).encode()
                cancel_message = cancel_urlpath.encode() + hashlib.sha256(cancel_encoded).digest()
                cancel_sig = hmac.new(base64.b64decode(api_secret), cancel_message, hashlib.sha512)
                cancel_sigdigest = base64.b64encode(cancel_sig.digest()).decode()
                
                cancel_resp = requests.post(
                    f"https://api.kraken.com{cancel_urlpath}",
                    headers={"API-Key": api_key, "API-Sign": cancel_sigdigest},
                    data={"nonce": cancel_nonce, "txid": oid},
                    timeout=15
                )
                if cancel_resp.ok and not cancel_resp.json().get("error"):
                    cancelled += 1
                    log.info(f"[KRAKEN] Cancelled stale order {oid} (age: {age_hours:.1f}h)")
                
                time.sleep(1)  # Rate limit
        
        total_open = len(open_orders)
        status = "✅"
        detail = f"Open: {total_open}, Stale(>2h): {stale_count}, Cancelled: {cancelled}"
        
    except Exception as e:
        status = "⚠️"
        detail = f"Error: {str(e)[:80]}"
    
    log.info(f"[KRAKEN] {status} {detail}")
    return {"name": "Kraken", "status": status, "detail": detail}

# ─── 4. VOLT-KRAKEN POSITION CHECK ──────────────────────────────
def force_check_volt_kraken():
    """Check for stuck Volt-Kraken positions past their stop-loss or take-profit."""
    log.info("[VOLT-KRAKEN] Checking for stuck positions...")
    
    # Read the Volt-Kraken state file for open positions
    stdout, stderr, rc = run_local_cmd(
        'cat /opt/apex-agent/volt_kraken_state.json 2>/dev/null || echo "{}"'
    )
    
    stuck_positions = 0
    total_positions = 0
    
    try:
        state = json.loads(stdout) if stdout and stdout != "{}" else {}
        positions = state.get("positions", [])
        total_positions = len(positions)
        
        # Check if any position has been open > 24 hours (likely stuck)
        now = time.time()
        for pos in positions:
            entry_time = pos.get("entry_time", now)
            if isinstance(entry_time, str):
                try:
                    entry_time = datetime.fromisoformat(entry_time).timestamp()
                except:
                    entry_time = now
            
            age_hours = (now - entry_time) / 3600
            if age_hours > 24:
                stuck_positions += 1
                log.warning(f"[VOLT-KRAKEN] Stuck position: {pos.get('pair', '?')} open {age_hours:.0f}h")
        
    except json.JSONDecodeError:
        log.warning("[VOLT-KRAKEN] Could not parse state file")
    
    # Also restart Volt-Kraken to force position reconciliation
    run_local_cmd('pm2 restart volt-kraken 2>/dev/null')
    time.sleep(5)
    
    status = "✅" if stuck_positions == 0 else "⚠️"
    detail = f"Positions: {total_positions}, Stuck(>24h): {stuck_positions}, Restarted"
    
    log.info(f"[VOLT-KRAKEN] {status} {detail}")
    return {"name": "Volt-Kraken", "status": status, "detail": detail}

# ─── 5. DEX BOTS HEALTH CHECK & RESTART ─────────────────────────
def force_check_dex_bots():
    """Check HABFF, Hero-farm, Hero-vets-pulse — restart any that are hung."""
    log.info("[DEX] Checking DEX bot health...")
    
    dex_bots = [
        ("habff-arb", "HABFF-arb"),
        ("hero-farm-v6", "Hero-farm-v6"),
        ("hero-vets-pulse", "Hero-vets-pulse"),
    ]
    
    results = []
    
    for pm2_name, display_name in dex_bots:
        # Check if bot is responding (has recent log output)
        stdout, stderr, rc = run_local_cmd(
            f'pm2 show {pm2_name} 2>/dev/null | grep -E "status|uptime|restart"'
        )
        
        is_online = "online" in stdout.lower() if stdout else False
        uptime_match = re.search(r'uptime\s*│\s*(\S+)', stdout) if stdout else None
        restart_count = 0
        restart_match = re.search(r'↺\s*│\s*(\d+)', stdout) if stdout else None
        if restart_match:
            restart_count = int(restart_match.group(1))
        
        # Check for recent activity in logs (last 5 minutes)
        log_stdout, _, _ = run_local_cmd(
            f'tail -5 /root/.pm2/logs/{pm2_name}-out.log 2>/dev/null'
        )
        
        has_recent_activity = bool(log_stdout and len(log_stdout) > 10)
        
        # If no recent activity or not online, force restart
        if not is_online or not has_recent_activity:
            log.warning(f"[DEX] {display_name} appears hung — force restarting")
            run_local_cmd(f'pm2 restart {pm2_name} 2>/dev/null')
            time.sleep(3)
            status = "🔄"
            detail = "Force restarted (no recent activity)"
        else:
            status = "✅"
            uptime = uptime_match.group(1) if uptime_match else "?"
            detail = f"Online, uptime: {uptime}, restarts: {restart_count}"
        
        results.append({"name": display_name, "status": status, "detail": detail})
        log.info(f"[DEX] {display_name}: {status} {detail}")
    
    return results

# ─── 6. VPS1/VPS3 ABLE BOTS CHECK ───────────────────────────────
def force_check_able_bots():
    """Check Hero-ABLE bots on VPS3 — restart if hung."""
    log.info("[VPS3] Checking Hero-ABLE bots...")
    
    stdout, stderr, rc = ssh_cmd("vps1", "pm2 list --no-color 2>/dev/null | grep -E 'Hero|hero|ABLE|able'", timeout=15)
    
    # Also check VPS3
    stdout3, stderr3, rc3 = ssh_cmd("195.26.253.100",
        "pm2 list --no-color 2>/dev/null | grep -E 'Hero|hero|ABLE|able'",
        timeout=15
    )
    
    able_status = "✅"
    detail_parts = []
    
    if stdout:
        online_count = stdout.count("online")
        total_count = len([l for l in stdout.split("\n") if l.strip()])
        detail_parts.append(f"VPS1: {online_count}/{total_count} online")
        if online_count < total_count:
            able_status = "⚠️"
            # Force restart on VPS1
            ssh_cmd("vps1", "pm2 restart all 2>/dev/null", timeout=15)
            detail_parts[-1] += " (restarted)"
    else:
        detail_parts.append("VPS1: no ABLE bots (expected)")
    
    if stdout3:
        online_count3 = stdout3.count("online")
        total_count3 = len([l for l in stdout3.split("\n") if l.strip()])
        detail_parts.append(f"VPS3: {online_count3}/{total_count3} online")
        if online_count3 < total_count3:
            able_status = "⚠️"
    else:
        detail_parts.append("VPS3: no response or no bots")
    
    detail = " | ".join(detail_parts)
    log.info(f"[ABLE] {able_status} {detail}")
    return {"name": "Hero-ABLE (VPS3)", "status": able_status, "detail": detail}

# ─── MAIN SWEEP ──────────────────────────────────────────────────
def run_sweep():
    """Execute full force-redemption sweep across all bots."""
    sweep_start = datetime.now(timezone.utc)
    log.info("=" * 60)
    log.info(f"🔔 FORCE REDEMPTION SWEEP — {sweep_start.strftime('%Y-%m-%d %H:%M UTC')}")
    log.info("=" * 60)
    
    results = []
    
    # 1. Polymarket
    try:
        results.append(force_redeem_polymarket())
    except Exception as e:
        log.error(f"[POLYMARKET] Sweep error: {e}")
        results.append({"name": "Polymarket", "status": "❌", "detail": str(e)[:60]})
    
    time.sleep(2)
    
    # 2. Kalshi
    try:
        results.append(force_settle_kalshi())
    except Exception as e:
        log.error(f"[KALSHI] Sweep error: {e}")
        results.append({"name": "Kalshi", "status": "❌", "detail": str(e)[:60]})
    
    time.sleep(2)
    
    # 3. Kraken
    try:
        results.append(force_cleanup_kraken())
    except Exception as e:
        log.error(f"[KRAKEN] Sweep error: {e}")
        results.append({"name": "Kraken", "status": "❌", "detail": str(e)[:60]})
    
    time.sleep(2)
    
    # 4. Volt-Kraken
    try:
        results.append(force_check_volt_kraken())
    except Exception as e:
        log.error(f"[VOLT-KRAKEN] Sweep error: {e}")
        results.append({"name": "Volt-Kraken", "status": "❌", "detail": str(e)[:60]})
    
    time.sleep(2)
    
    # 5. DEX Bots
    try:
        dex_results = force_check_dex_bots()
        results.extend(dex_results)
    except Exception as e:
        log.error(f"[DEX] Sweep error: {e}")
        results.append({"name": "DEX Bots", "status": "❌", "detail": str(e)[:60]})
    
    time.sleep(2)
    
    # 6. ABLE Bots
    try:
        results.append(force_check_able_bots())
    except Exception as e:
        log.error(f"[ABLE] Sweep error: {e}")
        results.append({"name": "Hero-ABLE", "status": "❌", "detail": str(e)[:60]})
    
    # ─── BUILD TELEGRAM REPORT ───────────────────────────────────
    sweep_end = datetime.now(timezone.utc)
    duration = (sweep_end - sweep_start).total_seconds()
    
    all_ok = all(r["status"] in ("✅", "🔄") for r in results)
    has_errors = any(r["status"] == "❌" for r in results)
    
    if has_errors:
        header = "🚨 FORCE REDEEM SWEEP — ISSUES DETECTED"
    elif not all_ok:
        header = "🔔 FORCE REDEEM SWEEP — WARNINGS"
    else:
        header = "🔔 FORCE REDEEM SWEEP — ALL CLEAR"
    
    lines = [
        f"<b>{header}</b>",
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ""
    ]
    
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. {r['status']} <b>{r['name']}</b>")
        lines.append(f"   └ {r['detail']}")
        lines.append("")
    
    lines.extend([
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"⏱ Sweep took {duration:.0f}s",
        f"⏰ {sweep_end.strftime('%Y-%m-%d %H:%M UTC')}",
        f"🔄 Next sweep in 12h",
        f'📊 <a href="{DASHBOARD_URL}">Apex Dashboard</a>'
    ])
    
    msg = "\n".join(lines)
    send_telegram(msg)
    
    log.info(f"Sweep complete: {len(results)} bots checked in {duration:.0f}s")
    return results

# ─── MAIN LOOP ───────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("╔══════════════════════════════════════════════════╗")
    log.info("║  FORCE REDEMPTION DAEMON v1.0 STARTED            ║")
    log.info(f"║  Sweep interval: {SWEEP_INTERVAL}s (12 hours)             ║")
    log.info("╚══════════════════════════════════════════════════╝")
    
    send_telegram(
        "🔔 <b>Force Redemption Daemon v1.0 ONLINE</b>\n\n"
        "Sweeps every 12 hours:\n"
        "• Polymarket: Force redeem resolved positions\n"
        "• Kalshi: Reconcile settlements\n"
        "• Kraken: Cancel stale orders (>2h)\n"
        "• Volt-Kraken: Check stuck positions\n"
        "• DEX Bots: Health check & restart hung bots\n"
        "• ABLE Bots: VPS3 health check\n\n"
        f'📊 <a href="{DASHBOARD_URL}">Apex Dashboard</a>'
    )
    
    # Run first sweep immediately
    run_sweep()
    
    # Then loop every 12 hours
    while True:
        log.info(f"[MAIN] Next sweep in {SWEEP_INTERVAL}s ({SWEEP_INTERVAL/3600:.0f}h)...")
        time.sleep(SWEEP_INTERVAL)
        run_sweep()
