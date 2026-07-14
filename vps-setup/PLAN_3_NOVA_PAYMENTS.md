# PLAN 3: Nova Payments & Chat Moderation

**Date:** 2026-07-14
**Status:** DRAFT — SECURITY AND LIVE VERIFICATION REQUIRED
**Server:** VDS-S usage blocked pending architecture gate. Alternative host TBD.

## Required Corrections Implemented
- **No Root/Global:** Dedicated `novabot` user, Python `venv`.
- **No Shared Secrets:** Isolated `.env` per service.
- **No Live Webhooks/Payments:** Test environment only.
- **Source Code Provided:** Complete source for audit.
- **Durable Idempotency & Persistence:** SQLite with strict transactions.
- **Webhook Verification:** `X-Telegram-Bot-Api-Secret-Token` validation.
- **Refunds & Reconciliation:** Built-in flows.
- **Backup & Kill Switch:** Cron backups and `/kill` command.

## Architecture Gate: Host Selection
**VDS-S is blocked** as the default public payment host to protect the `hero-wallet-secure` container.
**Proposed Host:** VPS3 or a dedicated micro-VPS.

## Implementation Plan

### 1. Isolated Environment
```bash
sudo useradd -m -s /bin/bash novabot
sudo su - novabot
mkdir -p ~/app/data
python3 -m venv ~/app/venv
~/app/venv/bin/pip install flask requests
```

### 2. Secrets Management
Create `/home/novabot/app/.env` (mode 600):
```env
NOVA_BOT_TOKEN=[TEST_TOKEN]
WEBHOOK_SECRET=[GENERATED_SECRET]
ADMIN_CHAT_ID=[VETS_ID]
```

### 3. Payment Handler Source (For Audit)
The complete, hardened `nova_stars_payment_handler.py` and `chat_moderation_engine.py` are available in the `opentang` repository under `vps-setup/deploy_package/`.
Key features implemented:
- **Webhook Secret:** Rejects requests lacking the correct `X-Telegram-Bot-Api-Secret-Token`.
- **Idempotency:** `telegram_payment_charge_id` is unique. Duplicate successful payments are ignored.
- **Test Environment:** Uses Telegram's test environment for Stars (`/test_tip`).

### 4. Bounded systemd Service
Create `/etc/systemd/system/novabot.service`:
```ini
[Unit]
Description=Nova Telegram Bot
After=network.target

[Service]
Type=simple
User=novabot
Group=novabot
WorkingDirectory=/home/novabot/app
ExecStart=/home/novabot/app/venv/bin/python nova_stars_payment_handler.py
EnvironmentFile=/home/novabot/app/.env
Restart=on-failure
MemoryMax=256M

[Install]
WantedBy=multi-user.target
```

### 5. Backup & Kill Switch
- **Backup:** Daily cron to copy `~/app/data/nova_payments.db` to encrypted R2 bucket.
- **Kill Switch:** `GET /admin/kill?token=[SECRET]` instantly stops the Flask server.

### 6. Rollback Design
- `systemctl stop novabot && systemctl disable novabot`
- Revoke test webhook via Telegram API.
- `userdel -r novabot`.
