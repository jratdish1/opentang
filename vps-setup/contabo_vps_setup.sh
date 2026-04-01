#!/bin/bash
# ============================================================================
# CONTABO VPS AUTOMATED SETUP SCRIPT
# For PulseChain ($HERO, $VETS) and BASE ($HERO) Crypto Deployment
# ============================================================================
# Usage: ssh into your fresh Contabo VPS and run:
#   chmod +x contabo_vps_setup.sh && sudo ./contabo_vps_setup.sh
# ============================================================================

set -euo pipefail

# --- Configuration ---
DEPLOY_USER="deployer"
WORKSPACE_DIR="/home/${DEPLOY_USER}/crypto_deployment"
LOG_FILE="/var/log/vps_setup.log"

# --- Helper Functions (DRY Principle) ---
log() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "\033[0;32m${msg}\033[0m"
    echo "${msg}" >> "${LOG_FILE}"
}

err() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo -e "\033[0;31m${msg}\033[0m"
    echo "${msg}" >> "${LOG_FILE}"
    exit 1
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        err "This script must be run as root. Use: sudo ./contabo_vps_setup.sh"
    fi
}

# ============================================================================
# PHASE 1: SYSTEM UPDATE & ESSENTIAL PACKAGES
# ============================================================================
phase_system_update() {
    log "PHASE 1: Updating system packages..."
    apt update -y && apt upgrade -y
    apt install -y \
        curl git ufw fail2ban build-essential software-properties-common \
        jq unzip wget htop tmux tree ca-certificates gnupg lsb-release \
        apt-transport-https
    log "PHASE 1: System update complete."
}

# ============================================================================
# PHASE 2: CREATE DEPLOYER USER
# ============================================================================
phase_create_user() {
    log "PHASE 2: Creating deployer user..."
    if id "${DEPLOY_USER}" &>/dev/null; then
        log "User '${DEPLOY_USER}' already exists. Skipping."
    else
        adduser --disabled-password --gecos "" "${DEPLOY_USER}"
        usermod -aG sudo "${DEPLOY_USER}"
        # Copy SSH authorized keys from root to deployer
        mkdir -p /home/${DEPLOY_USER}/.ssh
        if [ -f /root/.ssh/authorized_keys ]; then
            cp /root/.ssh/authorized_keys /home/${DEPLOY_USER}/.ssh/authorized_keys
        fi
        chown -R ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh
        chmod 700 /home/${DEPLOY_USER}/.ssh
        chmod 600 /home/${DEPLOY_USER}/.ssh/authorized_keys 2>/dev/null || true
    fi
    log "PHASE 2: Deployer user ready."
}

# ============================================================================
# PHASE 3: SECURITY HARDENING
# ============================================================================
phase_security() {
    log "PHASE 3: Hardening security..."

    # --- SSH Hardening ---
    log "Configuring SSH..."
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
    systemctl restart sshd

    # --- Firewall (UFW) ---
    log "Configuring UFW firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp    # HTTP (for Let's Encrypt / reverse proxy)
    ufw allow 443/tcp   # HTTPS
    ufw --force enable

    # --- Fail2Ban ---
    log "Configuring Fail2Ban..."
    cat << 'EOF' > /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port    = ssh
filter  = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF
    systemctl enable fail2ban
    systemctl restart fail2ban

    # --- Automatic Security Updates ---
    log "Enabling automatic security updates..."
    apt install -y unattended-upgrades
    dpkg-reconfigure -plow unattended-upgrades || true

    log "PHASE 3: Security hardening complete."
}

# ============================================================================
# PHASE 4: INSTALL DOCKER
# ============================================================================
phase_docker() {
    log "PHASE 4: Installing Docker..."
    if command -v docker &>/dev/null; then
        log "Docker already installed. Skipping."
    else
        curl -fsSL https://get.docker.com | sh
        usermod -aG docker ${DEPLOY_USER}
    fi
    systemctl enable docker
    systemctl start docker
    log "PHASE 4: Docker installed."
}

# ============================================================================
# PHASE 5: INSTALL NODE.JS (LTS) & GLOBAL PACKAGES
# ============================================================================
phase_nodejs() {
    log "PHASE 5: Installing Node.js LTS..."
    if command -v node &>/dev/null; then
        log "Node.js already installed ($(node -v)). Skipping."
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    npm install -g npm@latest
    npm install -g hardhat yarn pnpm
    log "PHASE 5: Node.js and global packages installed."
}

# ============================================================================
# PHASE 6: INSTALL FOUNDRY (FORGE, CAST, ANVIL, CHISEL)
# ============================================================================
phase_foundry() {
    log "PHASE 6: Installing Foundry..."
    su - ${DEPLOY_USER} -c 'curl -L https://foundry.paradigm.xyz | bash'
    su - ${DEPLOY_USER} -c 'export PATH="$HOME/.foundry/bin:$PATH" && foundryup'
    log "PHASE 6: Foundry installed."
}

# ============================================================================
# PHASE 7: INSTALL GITHUB CLI
# ============================================================================
phase_github_cli() {
    log "PHASE 7: Installing GitHub CLI..."
    if command -v gh &>/dev/null; then
        log "GitHub CLI already installed. Skipping."
    else
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        apt update
        apt install -y gh
    fi
    log "PHASE 7: GitHub CLI installed."
}

# ============================================================================
# PHASE 8: CREATE WORKSPACE & CONFIGURATION FILES
# ============================================================================
phase_workspace() {
    log "PHASE 8: Setting up crypto deployment workspace..."
    su - ${DEPLOY_USER} -c "mkdir -p ${WORKSPACE_DIR}"

    # --- .env.example ---
    cat << 'ENVEOF' > ${WORKSPACE_DIR}/.env.example
# ============================================================================
# DEPLOYER WALLET CONFIGURATION
# WARNING: Copy this to .env and fill in your keys. NEVER commit .env!
# ============================================================================

# Private Key for Deployments (without 0x prefix or with, Hardhat handles both)
PRIVATE_KEY=your_private_key_here

# --- PulseChain ---
PULSECHAIN_RPC_URL=https://rpc.pulsechain.com
PULSECHAIN_CHAIN_ID=369

# --- BASE ---
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453

# --- API Keys for Contract Verification (Optional) ---
PULSESCAN_API_KEY=your_pulsescan_key
BASESCAN_API_KEY=your_basescan_key
ENVEOF

    # --- Hardhat Config ---
    cat << 'HHEOF' > ${WORKSPACE_DIR}/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    pulsechain: {
      url: process.env.PULSECHAIN_RPC_URL || "https://rpc.pulsechain.com",
      chainId: 369,
      accounts: [PRIVATE_KEY],
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    }
  }
};
HHEOF

    # --- Foundry Config ---
    cat << 'FCEOF' > ${WORKSPACE_DIR}/foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
pulsechain = "https://rpc.pulsechain.com"
base = "https://mainnet.base.org"
FCEOF

    # --- package.json ---
    cat << 'PKGEOF' > ${WORKSPACE_DIR}/package.json
{
  "name": "crypto-deployment",
  "version": "1.0.0",
  "description": "PulseChain and BASE deployment workspace for $HERO and $VETS",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:pulse": "hardhat run scripts/deploy.js --network pulsechain",
    "deploy:base": "hardhat run scripts/deploy.js --network base",
    "sync": "bash ../github_sync.sh"
  },
  "dependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "dotenv": "^16.4.0",
    "hardhat": "^2.22.0"
  }
}
PKGEOF

    # --- .gitignore ---
    cat << 'GIEOF' > ${WORKSPACE_DIR}/.gitignore
# Dependencies
node_modules/

# Secrets
.env

# Build artifacts
artifacts/
cache/
out/
coverage/
coverage.json
typechain/
typechain-types/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
GIEOF

    # --- Deploy Script Template ---
    mkdir -p ${WORKSPACE_DIR}/scripts
    cat << 'DEPEOF' > ${WORKSPACE_DIR}/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`Deploying to ${network}...`);

  // Example: Deploy a contract
  // const Contract = await hre.ethers.getContractFactory("YourContract");
  // const contract = await Contract.deploy();
  // await contract.waitForDeployment();
  // console.log(`Contract deployed to: ${await contract.getAddress()}`);

  console.log("Deployment script ready. Uncomment and customize above.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
DEPEOF

    # --- Contracts Directory ---
    mkdir -p ${WORKSPACE_DIR}/contracts
    cat << 'CTEOF' > ${WORKSPACE_DIR}/contracts/.gitkeep
CTEOF

    # --- Test Directory ---
    mkdir -p ${WORKSPACE_DIR}/test
    cat << 'TSEOF' > ${WORKSPACE_DIR}/test/.gitkeep
TSEOF

    chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${WORKSPACE_DIR}
    log "PHASE 8: Workspace configured."
}

# ============================================================================
# PHASE 9: GITHUB SYNC SCRIPT
# ============================================================================
phase_github_sync() {
    log "PHASE 9: Creating GitHub sync script..."

    cat << 'SYNCEOF' > /home/${DEPLOY_USER}/github_sync.sh
#!/bin/bash
# ============================================================================
# GITHUB SYNC SCRIPT
# Automatically commits and pushes all changes to the remote repository.
# Usage: ./github_sync.sh [optional commit message]
# ============================================================================

set -euo pipefail

WORKSPACE="/home/deployer/crypto_deployment"
cd "${WORKSPACE}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Error: Git not initialized in ${WORKSPACE}. Run 'git init' first."
    exit 1
fi

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit with provided message or auto-generated one
MSG="${1:-Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')}"
git commit -m "${MSG}"

# Push to remote
git push origin main

echo "Sync complete: ${MSG}"
SYNCEOF

    chmod +x /home/${DEPLOY_USER}/github_sync.sh
    chown ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/github_sync.sh

    # --- Cron job for automatic sync every 30 minutes ---
    (crontab -u ${DEPLOY_USER} -l 2>/dev/null; echo "*/30 * * * * /home/${DEPLOY_USER}/github_sync.sh >> /home/${DEPLOY_USER}/sync.log 2>&1") | crontab -u ${DEPLOY_USER} -

    log "PHASE 9: GitHub sync script and cron job configured."
}

# ============================================================================
# PHASE 10: FINAL SUMMARY
# ============================================================================
phase_summary() {
    log "============================================"
    log "  VPS SETUP COMPLETE - MISSION ACCOMPLISHED"
    log "============================================"
    log ""
    log "DEPLOYER USER:    ${DEPLOY_USER}"
    log "WORKSPACE:        ${WORKSPACE_DIR}"
    log "SYNC SCRIPT:      /home/${DEPLOY_USER}/github_sync.sh"
    log "LOG FILE:         ${LOG_FILE}"
    log ""
    log "NEXT STEPS:"
    log "1. SSH in as '${DEPLOY_USER}' (root login is now disabled)"
    log "2. cd ${WORKSPACE_DIR}"
    log "3. cp .env.example .env && nano .env  (add your private key)"
    log "4. npm install"
    log "5. gh auth login  (authenticate GitHub CLI)"
    log "6. git remote add origin <your-repo-url>"
    log "7. git push -u origin main"
    log ""
    log "SECURITY NOTES:"
    log "- Root login DISABLED. Use '${DEPLOY_USER}' with SSH key."
    log "- Password auth DISABLED. SSH keys only."
    log "- UFW firewall ACTIVE (SSH, HTTP, HTTPS allowed)."
    log "- Fail2Ban ACTIVE (3 failed attempts = 1hr ban)."
    log "- Auto security updates ENABLED."
    log ""
    log "Semper Fi! Your VPS is locked and loaded."
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    check_root
    touch "${LOG_FILE}"

    log "Starting Contabo VPS Setup..."
    log "Target OS: $(lsb_release -ds 2>/dev/null || echo 'Ubuntu')"

    phase_system_update
    phase_create_user
    phase_security
    phase_docker
    phase_nodejs
    phase_foundry
    phase_github_cli
    phase_workspace
    phase_github_sync
    phase_summary
}

main "$@"
