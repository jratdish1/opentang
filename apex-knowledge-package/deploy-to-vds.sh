#!/bin/bash
# APEX VDS Deployment Script
# Run this on VDS once SSH access is restored
# Usage: bash deploy-to-vds.sh

set -e

echo "========================================="
echo "APEX VDS Deployment — $(date)"
echo "========================================="

# --- Environment Setup ---
export APEX_HOME="/opt/apex"
export APEX_DATA="$APEX_HOME/data"
export APEX_LOGS="$APEX_HOME/logs"
export APEX_KEYS="$APEX_HOME/.env"

mkdir -p $APEX_HOME $APEX_DATA $APEX_LOGS

# --- API Keys ---
cat > $APEX_KEYS << 'EOF'
# PreReason API
PREREASON_API_KEY=pr_live_uyN98Ibdt1T6BkTt6RFQg81OrvDXviw_

# Grok API (set from environment)
XAI_API_KEY=${XAI_API_KEY}

# Mining Dutch
MINING_DUTCH_LOGIN=radii.dyes-04@icloud.com
MINING_DUTCH_PASSWORD=KCH.phz7qmx0ztj2mpg
EOF
chmod 600 $APEX_KEYS

echo "[1/6] Environment configured"

# --- Install System Dependencies ---
apt-get update -qq && apt-get install -y -qq python3.11 python3.11-venv python3-pip nodejs npm cargo rustc git curl jq

echo "[2/6] System dependencies installed"

# --- Deploy RTK (Token Cost Optimizer) ---
cd $APEX_HOME
if [ ! -d "rtk" ]; then
    git clone https://github.com/rtk-ai/rtk.git
fi
cd rtk
cargo build --release 2>/dev/null || echo "RTK: Pre-built binary may be needed"
if [ -f "target/release/rtk" ]; then
    cp target/release/rtk /usr/local/bin/rtk
    echo "[3/6] RTK deployed to /usr/local/bin/rtk"
else
    echo "[3/6] RTK: Build failed, try downloading pre-built binary"
    # Fallback: download pre-built
    curl -fsSL https://github.com/rtk-ai/rtk/releases/latest/download/rtk-linux-x86_64 -o /usr/local/bin/rtk 2>/dev/null || true
    chmod +x /usr/local/bin/rtk 2>/dev/null || true
fi

# --- Deploy Polymarket Paper Trader ---
cd $APEX_HOME
if [ ! -d "polymarket-paper-trader" ]; then
    git clone https://github.com/agent-next/polymarket-paper-trader.git
fi
cd polymarket-paper-trader
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt 2>/dev/null || pip install requests pandas numpy
deactivate
echo "[4/6] Polymarket Paper Trader deployed"

# --- Deploy FredAPI ---
cd $APEX_HOME
pip3 install fredapi pandas numpy requests
echo "[5/6] FredAPI installed globally"

# --- Deploy PreReason MCP ---
npm install -g @prereason/mcp 2>/dev/null || npx -y @prereason/mcp --version
echo "[6/6] PreReason MCP installed"

# --- Create systemd service for paper trader ---
cat > /etc/systemd/system/apex-paper-trader.service << EOF
[Unit]
Description=APEX Polymarket Paper Trader
After=network.target

[Service]
Type=simple
WorkingDirectory=$APEX_HOME/polymarket-paper-trader
ExecStart=$APEX_HOME/polymarket-paper-trader/venv/bin/python main.py
Restart=always
RestartSec=30
EnvironmentFile=$APEX_KEYS

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo ""
echo "========================================="
echo "APEX VDS Deployment Complete"
echo "========================================="
echo ""
echo "Deployed:"
echo "  - RTK token optimizer"
echo "  - Polymarket Paper Trader"
echo "  - FredAPI (macro data)"
echo "  - PreReason MCP server"
echo ""
echo "Next steps:"
echo "  1. Get FRED API key: https://fred.stlouisfed.org/docs/api/api_key.html"
echo "  2. Add FRED_API_KEY to $APEX_KEYS"
echo "  3. Start paper trader: systemctl start apex-paper-trader"
echo "  4. Monitor: journalctl -u apex-paper-trader -f"
echo ""
echo "All knowledge files in: $APEX_HOME/knowledge/"
