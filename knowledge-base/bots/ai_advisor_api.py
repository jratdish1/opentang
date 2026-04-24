"""
AI Advisor Chatbot Backend Module
Proxies chat requests through VDS to Grok API (xAI)
API key NEVER touches the browser - server-side only

Endpoints:
  POST /api/chat        - Send a message, get AI advisor response
  GET  /api/chat/advice - Get auto-generated login recommendations
  GET  /api/chat/scan   - AI scans bots and provides improvement tips
"""

import os
import json
import time
import logging
import requests
from datetime import datetime, timezone

# Load env vars from .env_architecture
import os as _os
_env_file = "/root/.env_architecture"
if _os.path.exists(_env_file):
    with open(_env_file) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                _v = _v.strip(chr(34)).strip("'")
                _os.environ.setdefault(_k.strip(), _v)


log = logging.getLogger("ai-advisor")

XAI_API_KEY = os.environ.get("XAI_API_KEY", "")
XAI_API_URL = "https://api.x.ai/v1/chat/completions"
XAI_MODEL = "grok-3-mini"

RATE_LIMIT = {}
MAX_REQUESTS_PER_MINUTE = 10
MAX_TOKENS_PER_REQUEST = 1000

CONVERSATIONS = {}
MAX_HISTORY = 20

SYSTEM_PROMPT = """You are the VetsInCrypto Mining Ops AI Advisor. You analyze trading bot data and provide actionable recommendations.

PERSONALITY:
- Female voice, light-hearted with some humor
- Give it straight - no BS
- Dumb complicated things down (the user is a Marine who uses crayons)
- Focus on making money and saving time
- Military terminology welcome

CAPABILITIES:
- Analyze bot performance data (P&L, balances, gas levels, uptime)
- Identify issues (low gas, stalled bots, poor performance)
- Recommend actions (stop/start bots, rebalance, adjust thresholds)
- Explain crypto concepts simply
- Flag potential problems before they become critical

RULES:
- READ-ONLY advisor - cannot execute trades or commands
- Always cite specific data when making recommendations
- Never fabricate numbers
- Keep responses concise
"""


def get_bot_context():
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "trading_bots_api",
            "/opt/apex-agent/trading_bots_api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        data = mod.get_all_bots()
        context = f"BOT STATUS ({datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}):\n"
        context += f"Total: {data['summary']['total_bots']}, Online: {data['summary']['online']}, Gas Warnings: {data['summary']['gas_warnings']}\n"
        for bot in data.get('bots', []):
            context += f"- {bot['name']}: {bot['status']} | gas: {bot.get('gas_status','?')} | restarts: {bot.get('restarts',0)}"
            if bot.get('usd_value'):
                context += f" | ${bot['usd_value']:.2f}"
            context += "\n"
        onchain = data.get('onchain', {})
        for k, v in onchain.items():
            if v and v > 0:
                context += f"  {k}: {v:,.4f}\n"
        return context
    except Exception as e:
        log.error(f"Bot context error: {e}")
        return "Bot data temporarily unavailable."


def check_rate_limit(ip):
    now = time.time()
    if ip in RATE_LIMIT:
        count, start = RATE_LIMIT[ip]
        if now - start > 60:
            RATE_LIMIT[ip] = (1, now)
            return True
        if count >= MAX_REQUESTS_PER_MINUTE:
            return False
        RATE_LIMIT[ip] = (count + 1, start)
        return True
    RATE_LIMIT[ip] = (1, now)
    return True


def call_grok(messages, max_tokens=MAX_TOKENS_PER_REQUEST):
    if not XAI_API_KEY:
        return {"error": "AI advisor not configured"}
    try:
        resp = requests.post(
            XAI_API_URL,
            headers={"Authorization": f"Bearer {XAI_API_KEY}", "Content-Type": "application/json"},
            json={"model": XAI_MODEL, "messages": messages, "max_tokens": max_tokens, "temperature": 0.7},
            timeout=30
        )
        if resp.status_code == 200:
            data = resp.json()
            return {"response": data["choices"][0]["message"]["content"], "tokens_used": data.get("usage", {}).get("total_tokens", 0)}
        log.error(f"Grok {resp.status_code}: {resp.text[:200]}")
        return {"error": f"AI service error {resp.status_code}"}
    except requests.Timeout:
        return {"error": "AI timed out"}
    except Exception as e:
        log.error(f"Grok error: {e}")
        return {"error": "AI unavailable"}


def handle_chat(body, client_ip="127.0.0.1"):
    if not check_rate_limit(client_ip):
        return {"error": "Rate limited - max 10/min"}
    message = body.get("message", "").strip()
    session_id = body.get("session_id", "default")
    if not message:
        return {"error": "Empty message"}
    if len(message) > 2000:
        return {"error": "Too long (max 2000)"}
    bot_context = get_bot_context()
    if session_id not in CONVERSATIONS:
        CONVERSATIONS[session_id] = []
    history = CONVERSATIONS[session_id]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"LIVE DATA:\n{bot_context}"}
    ]
    for msg in history[-MAX_HISTORY:]:
        messages.append(msg)
    messages.append({"role": "user", "content": message})
    result = call_grok(messages)
    if "error" not in result:
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": result["response"]})
        if len(history) > MAX_HISTORY * 2:
            CONVERSATIONS[session_id] = history[-MAX_HISTORY:]
    return result


def handle_advice():
    bot_context = get_bot_context()
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"LIVE DATA:\n{bot_context}"},
        {"role": "user", "content": "Generate a brief login briefing: fleet status, top issues, recommendations, alerts. Under 150 words, bullet points."}
    ]
    return call_grok(messages, max_tokens=500)


def handle_scan_feedback():
    bot_context = get_bot_context()
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"LIVE DATA:\n{bot_context}"},
        {"role": "user", "content": "Scan the bot fleet: performance tips, risk management, gas efficiency, bots to reconfigure, missing opportunities. Be specific. Max 200 words."}
    ]
    return call_grok(messages, max_tokens=800)
