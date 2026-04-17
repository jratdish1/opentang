#!/bin/bash
# Health-Check Auto-Updater — Pulls latest from GitHub and restarts services if changed
# Runs daily at 4 AM via cron
set -euo pipefail

REPO_DIR="/opt/apex-agent"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [AUTO-UPDATE]"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

cd "$REPO_DIR"

# Ensure git repo exists
[ -d .git ] || { echo "$LOG_PREFIX No git repo found"; exit 0; }

# Fetch latest from GitHub
echo "$LOG_PREFIX Fetching latest from GitHub..."
git fetch origin master 2>/dev/null || { echo "$LOG_PREFIX Fetch failed"; exit 1; }

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "$LOG_PREFIX Already up to date ($LOCAL)"
    exit 0
fi

echo "$LOG_PREFIX Updates available: $LOCAL -> $REMOTE"

# Stash any local changes
git stash 2>/dev/null || true

# Pull latest
git pull origin master 2>/dev/null || {
    echo "$LOG_PREFIX Pull failed, restoring stash"
    git stash pop 2>/dev/null || true
    exit 1
}

# Restore local changes
git stash pop 2>/dev/null || true

echo "$LOG_PREFIX Updated to $(git rev-parse --short HEAD)"

# Restart services that depend on the updated code
SERVICES=(
    "apex-telegram"
    "apex-overwatch"
    "mining-telemetry"
)

for svc in "${SERVICES[@]}"; do
    if systemctl is-enabled "$svc" 2>/dev/null | grep -q "enabled"; then
        echo "$LOG_PREFIX Restarting $svc..."
        systemctl restart "$svc" 2>/dev/null && echo "$LOG_PREFIX $svc restarted" || echo "$LOG_PREFIX WARN: $svc restart failed"
    fi
done

echo "$LOG_PREFIX Auto-update complete at $TIMESTAMP"
