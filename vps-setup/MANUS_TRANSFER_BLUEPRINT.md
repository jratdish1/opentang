# Manus Sandbox Transfer Blueprint
**Mission: Autonomous Command Center & Crypto Deployment for VETS**

## 1. Mission Context & Objective
This blueprint is designed for seamless transfer of context between Manus sandbox sessions. The user (VETS, Marine Corps veteran, crypto founder of $HERO and $VETS on PulseChain and BASE) is building a decentralized, autonomous Command Center using Contabo VPS/VDS infrastructure.

The goal is to automate deployment, trading, and monitoring tasks using AI agents (Claude Code and OpenClaw) while maintaining strict security, redundancy, and cost-efficiency (using Z.AI GLM models as an alternative to Claude API).

## 2. Infrastructure Architecture
The planned infrastructure consists of three servers hosted on Contabo:
- **VPS 1**: Claude Code + Contract Deployment (PulseChain & BASE)
- **VPS 2**: Backup/Redundancy + Web Hosting
- **VDS (Virtual Dedicated Server)**: 24/7 Autonomous Trading Agents (OpenClaw) + Monitoring

*Note: As of the last session, the physical servers have not yet been provisioned or connected to the sandbox. The next step is to obtain the IPs and credentials from the Contabo Customer Control Panel.*

## 3. GitHub Repository Status
All scripts and configurations are version-controlled in the user's GitHub repository:
- **Repo URL**: `https://github.com/jratdish1/opentang`
- **Target Directory**: `vps-setup/`
- **Latest Commit**: `ecd453b` (Add OpenClaw autonomous agent framework to VPS setup)

### Key Files in `vps-setup/`:
1. `contabo_vps_setup.sh`: The master 10-phase automation script that hardens the server, installs Node, Hardhat, Foundry, Claude Code, and OpenClaw.
2. `github_sync.sh`: A cron-based script that auto-syncs the server workspace to GitHub every 30 minutes.
3. `AI_Personality_and_UI_Skills_Guide.md`: Instructions for installing UI/UX Pro Max and Vercel Agent skills to make Z.AI models perform like Claude.
4. `configs/`: Contains templates for `.env`, `hardhat.config.js`, `foundry.toml`, and `jail.local` (Fail2Ban).

## 4. API Keys & Credentials
*WARNING: API keys should never be pasted in plain text in the chat. They must be stored securely in the sandbox or global API vault.*

### A. Z.AI API Key (GLM Models)
- **Purpose**: Cost-effective alternative to Claude for 24/7 autonomous operations.
- **Status**: The user provided a key in a previous session (`84b1...`). The new Manus agent should prompt the user to securely provide this key if it is not available in the vault.
- **Usage**: Configured in `~/.claude/settings.json` and `~/.openclaw/config.json` via the setup script.

### B. Anthropic API Key (Claude)
- **Purpose**: Full power Claude models for complex tasks.
- **Status**: The user accidentally exposed an active key in a previous session. The user was advised to rotate it immediately. The new Manus agent should verify this has been done.

### C. Deployer Wallet
- **Purpose**: Deploying $HERO and $VETS contracts on PulseChain (Chain ID: 369) and BASE (Chain ID: 8453).
- **Address**: `0xfB253971dAD58651004275AAF81A0f9F4F779065`
- **Private Key**: Generated and provided to the user in a previous session. The new Manus agent should NOT ask for this key; the user will input it directly into the `.env` file on the VPS.

## 5. Autonomous Agent Frameworks

### A. Claude Code
- **Role**: Terminal-based coding assistant for smart contract development.
- **Setup**: Installed globally via npm. Configured to use Z.AI's GLM-5.1 model via `ANTHROPIC_AUTH_TOKEN` override.

### B. OpenClaw
- **Role**: 24/7 autonomous agent for trading, monitoring, and cross-app operations.
- **Setup**: Installed headlessly via `curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard`. Configured to use Z.AI's GLM-5.1 model.

### C. AI Personality & UI/UX Skills
- To bridge the gap between GLM models and Claude's native conversational/UI capabilities, three skill repositories are integrated:
  1. `nextlevelbuilder/ui-ux-pro-max-skill`
  2. `anthropics/skills`
  3. `vercel-labs/agent-skills`

## 6. Next Steps for the New Manus Agent
When a new Manus session begins with this blueprint, execute the following sequence:

1. **Acknowledge Mission**: Greet VETS (use Marine terminology, keep it straight, simple, and secure).
2. **Request Server Details**: Ask the user to provide the IPs and root credentials for the two Contabo VPS servers and the VDS.
3. **Establish SSH Connections**: Generate an SSH key pair in the sandbox, provide the public key to the user (or install it via password auth), and secure the connections.
4. **Execute Setup Script**: Run `contabo_vps_setup.sh` on all three servers to establish the baseline architecture.
5. **Configure Agents**: Securely prompt for the Z.AI API key and configure Claude Code and OpenClaw on the respective servers.
6. **Implement Watchdog**: Set up the automated server monitoring and Telegram alert system (KISS dashboard) to ensure 24/7 uptime.

*Semper Fi. Built for speed, security, and getting time back.*
