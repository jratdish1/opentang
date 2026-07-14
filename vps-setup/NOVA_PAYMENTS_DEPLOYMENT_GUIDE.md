# Nova Reign Telegram Stars Payment Handler — Deployment Guide

## Server Info

| Server | IP | Role | Status |
|:---|:---|:---|:---|
| **VDS-S** | `147.93.183.207` | AI trading agents + Nova payment handler | Target deployment host |

## Bot Status (Verified)

| Setting | Status |
|:---|:---|
| **Privacy Mode** | ✅ DISABLED — `can_read_all_group_messages: true` |
| **Description** | ✅ Updated with Stars payment CTA |
| **Short Description** | ✅ Updated |
| **Secretary Mode** | ✅ Ready (requires group allowlist population) |

This guide covers deploying the standalone Telegram Stars payment system for `novareign.ai` on **VDS-S**.

## Overview
The payment handler (`nova_stars_payment_handler.py`) is a lightweight Flask application that acts as the webhook receiver for Telegram. It handles:
1. Generating invoices in Telegram Stars (`XTR`)
2. Validating pre-checkout queries
3. Delivering PPV content and acknowledging tips upon successful payment

## Deployment Steps on VDS-S

### 1. Server Preparation
SSH into VDS-S and install the required dependencies:

```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx -y

# Create a directory for the app
mkdir -p /opt/nova_payments
cd /opt/nova_payments

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install Flask requests gunicorn
```

### 2. Copy the Application
Transfer `nova_stars_payment_handler.py` to `/opt/nova_payments/` on VDS-S.

### 3. Setup Systemd Service
Create a systemd service to keep the app running 24/7.

```bash
sudo nano /etc/systemd/system/nova_payments.service
```

Add the following configuration (replace `[NOVA_BOT_TOKEN_REDACTED]` with the actual secure token):

```ini
[Unit]
Description=Nova Reign Telegram Payments Handler
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/opt/nova_payments
Environment="PATH=/opt/nova_payments/venv/bin"
Environment="NOVA_BOT_TOKEN=[NOVA_BOT_TOKEN_REDACTED]"
ExecStart=/opt/nova_payments/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 nova_stars_payment_handler:app

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start nova_payments
sudo systemctl enable nova_payments
```

### 4. Configure Nginx Reverse Proxy
Set up Nginx to securely expose the webhook endpoint via HTTPS. (Assuming you have a domain like `api.novareign.ai` pointing to VDS-S and SSL certificates configured).

```bash
sudo nano /etc/nginx/sites-available/nova_payments
```

Add the configuration:
```nginx
server {
    listen 443 ssl;
    server_name api.novareign.ai;

    # SSL Configuration here (e.g., Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/api.novareign.ai/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.novareign.ai/privkey.pem;

    location /webhook {
        proxy_pass http://127.0.0.1:5000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nova_payments /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Set the Telegram Webhook
Finally, tell Telegram to send updates to your new endpoint. Run this curl command from any terminal (replace tokens/URLs):

```bash
curl -F "url=https://api.novareign.ai/webhook" https://api.telegram.org/bot[NOVA_BOT_TOKEN_REDACTED]/setWebhook
```

## Testing the Flow
1. Open Telegram and message `@NOVA_REIGN_OFFICIAL_BOT`.
2. Send the command `/tip`. The bot should reply with an invoice for 100 Stars.
3. Send the command `/ppv`. The bot should reply with an invoice for the exclusive studio session.
4. Complete a test payment (Telegram provides a test environment for this via BotFather if needed, or use a small amount of real Stars).
5. Verify the bot delivers the content message upon successful payment.
