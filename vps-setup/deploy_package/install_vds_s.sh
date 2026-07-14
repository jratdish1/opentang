#!/bin/bash
# Run this on VDS-S to deploy the Nova Payment Handler and Chat Moderation Engine
set -e

echo "1. Creating directories..."
mkdir -p /opt/nova_payments
mkdir -p /opt/chat_moderation

echo "2. Copying files..."
cp nova_stars_payment_handler.py /opt/nova_payments/
cp chat_moderation_engine.py /opt/chat_moderation/

echo "3. Installing dependencies..."
pip3 install flask requests gunicorn

echo "4. Setting up systemd services..."
cat > /etc/systemd/system/nova_payments.service << 'SYS'
[Unit]
Description=Nova Reign Stars Payment Webhook
After=network.target

[Service]
User=root
WorkingDirectory=/opt/nova_payments
Environment="PORT=5000"
EnvironmentFile=/etc/nova_secrets.env
ExecStart=/usr/local/bin/gunicorn -w 4 -b 127.0.0.1:5000 nova_stars_payment_handler:app
Restart=always

[Install]
WantedBy=multi-user.target
SYS

cat > /etc/systemd/system/chat_moderation.service << 'SYS'
[Unit]
Description=Nova & Marine Chat Moderation Engine
After=network.target

[Service]
User=root
WorkingDirectory=/opt/chat_moderation
EnvironmentFile=/etc/nova_secrets.env
ExecStart=/usr/bin/python3 chat_moderation_engine.py
Restart=always

[Install]
WantedBy=multi-user.target
SYS

systemctl daemon-reload
systemctl enable nova_payments chat_moderation
systemctl restart nova_payments chat_moderation

echo "5. Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/nova_payments << 'NGINX'
server {
    listen 80;
    server_name payments.novareign.ai;

    location /webhook {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/nova_payments /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "6. Registering Telegram Webhook..."
source /etc/nova_secrets.env
curl -F "url=https://payments.novareign.ai/webhook" \
     -F "secret_token=${WEBHOOK_SECRET_TOKEN}" \
     "https://api.telegram.org/bot${NOVA_BOT_TOKEN}/setWebhook"

echo "✅ VDS-S Deployment Complete."
