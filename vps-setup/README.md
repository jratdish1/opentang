# Contabo VPS Setup for Crypto Deployment

This directory contains the automated setup script and configuration files for deploying a secure Contabo VPS optimized for PulseChain ($HERO, $VETS) and BASE ($HERO) smart contract development.

## What This Does

The `contabo_vps_setup.sh` script automates the entire VPS configuration process in 10 phases. It transforms a fresh Ubuntu VPS into a hardened, deployment-ready environment with all the blockchain development tools pre-installed.

| Phase | Description |
| :---: | :--- |
| 1 | System update and essential package installation |
| 2 | Create a dedicated `deployer` user with SSH key access |
| 3 | Security hardening: SSH lockdown, UFW firewall, Fail2Ban, auto-updates |
| 4 | Docker installation for containerized workflows |
| 5 | Node.js LTS with Hardhat, Yarn, and pnpm |
| 6 | Foundry (Forge, Cast, Anvil, Chisel) for Solidity development |
| 7 | GitHub CLI for repository management |
| 8 | Workspace creation with Hardhat and Foundry configs for PulseChain and BASE |
| 9 | GitHub auto-sync script with cron job (every 30 minutes) |
| 10 | Final summary and next-step instructions |

## Quick Start

After purchasing your Contabo VPS with Ubuntu 22.04 or 24.04 LTS, SSH in as root and run:

```bash
# Clone this repo (or just download the script)
git clone https://github.com/jratdish1/opentang.git
cd opentang/vps-setup

# Make it executable and run
chmod +x contabo_vps_setup.sh
sudo ./contabo_vps_setup.sh
```

After the script completes, root login will be disabled. Reconnect as the `deployer` user:

```bash
ssh deployer@your-vps-ip
cd ~/crypto_deployment
cp .env.example .env
nano .env  # Add your deployer private key
npm install
```

## File Structure

```
vps-setup/
  contabo_vps_setup.sh       # Main automated setup script
  github_sync.sh             # Auto-commit and push to GitHub
  README.md                  # This file
  configs/
    .env.example             # Deployer wallet and RPC configuration template
    hardhat.config.js        # Hardhat config for PulseChain and BASE
    foundry.toml             # Foundry config for PulseChain and BASE
    jail.local               # Fail2Ban configuration
  .github/
    workflows/
      verify-deploy.yml      # CI/CD workflow to verify config integrity
```

## Security Features

The script implements multiple layers of security to protect your deployer wallet and VPS from unauthorized access.

| Feature | Detail |
| :--- | :--- |
| **SSH Hardening** | Root login disabled, password auth disabled, SSH keys only |
| **UFW Firewall** | Default deny incoming; only SSH (22), HTTP (80), HTTPS (443) allowed |
| **Fail2Ban** | 3 failed login attempts results in a 1-hour IP ban |
| **Auto-Updates** | Unattended security upgrades enabled |
| **Separate User** | Dedicated `deployer` user with sudo access, isolated from root |

## Network Configuration

The workspace is pre-configured for both PulseChain and BASE networks.

| Network | Chain ID | RPC URL | Gas Token |
| :--- | :---: | :--- | :--- |
| PulseChain | 369 | `https://rpc.pulsechain.com` | PLS |
| BASE | 8453 | `https://mainnet.base.org` | ETH |

## GitHub Auto-Sync

The `github_sync.sh` script runs every 30 minutes via cron and automatically commits and pushes any changes in the workspace to GitHub. You can also run it manually:

```bash
# Auto-generated commit message
./github_sync.sh

# Custom commit message
./github_sync.sh "Added new HERO contract"
```

## Deployer Wallet

Your deployer wallet address was generated during the initial setup:

| Field | Value |
| :--- | :--- |
| **Address** | `0xfB253971dAD58651004275AAF81A0f9F4F779065` |

Fund this wallet with PLS (for PulseChain gas) and ETH (for BASE gas) before deploying contracts. See the main deployment guide for bridging instructions.

---

*Semper Fi. Built for speed, security, and getting your time back.*
