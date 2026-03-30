<div align="center">

<img src="https://api.dracattus.com/v1/files/koba42/5b08ccf263df2102b7f6b0c9fe19cb5e_opentang-logo-w-text.png" alt="OpenTang" width="320" />

<br /><br />

**Your stack. Your rules.**

The open-source, cross-platform desktop app that bootstraps your complete self-hosted AI and developer infrastructure — in minutes, not days.

![License](https://img.shields.io/badge/license-Apache%202.0-orange)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

*Think: Homebrew meets Docker Desktop meets an AI-native App Store.*

</div>

---

## What is OpenTang?

OpenTang is a guided desktop installer that takes you from zero to a fully running self-hosted AI and developer stack. No YAML wrangling. No terminal gymnastics. Just pick what you want, click install, and go.

It handles Docker orchestration, credential generation, SSL configuration, and service health — all through a clean, step-by-step wizard with an orange-fire dark UI.

**Built for:**
- Developers setting up a personal AI/dev environment
- Self-hosters who know Docker but hate config sprawl
- Teams bootstrapping shared infrastructure
- Anyone who wants local LLMs + AI agents running in minutes

---

## Features

- 🧙 **Step-by-step wizard** — guided setup from system check to running services
- 🤖 **AI-first** — install [OpenClaw](https://github.com/openclaw/openclaw), Hermes, or NanoClaw with one click
- 🧠 **Local or cloud LLM** — bundle Ollama for local models, or bring your own OpenAI/Anthropic key
- 🐳 **Docker-powered** — everything runs in containers, managed by Compose
- 🔒 **Secure by default** — auto-generated strong passwords, Traefik + Let's Encrypt SSL
- 📦 **In-app store** — install, update, and remove services after initial setup
- 🌐 **Any network mode** — localhost, LAN, or internet-facing with auto SSL
- 🖥️ **Cross-platform** — Windows (WSL2), macOS (Intel + Apple Silicon), Linux
- 🔄 **Auto-updates** — app and package registry update independently

---

## Included Stack

### Core (always installed)
| Service | Purpose |
|---|---|
| **Docker** | Container runtime |
| **Traefik** | Reverse proxy + automatic SSL |
| **Coolify** | Self-hosted PaaS — manages all deployments |

### Tier 1 — Recommended (default on)
| Service | Purpose |
|---|---|
| **OpenClaw / Hermes / NanoClaw** | AI agent system (you choose) |
| **Ollama** | Local LLM runtime (or skip and use API keys) |
| **Gitea** | Private Git server |
| **Portainer** | Docker management UI |
| **Grafana + Prometheus** | Monitoring & observability |

### Tier 2 — Optional (via App Store)
| Service | Purpose |
|---|---|
| **n8n** | Workflow automation |
| **Vault** | Secrets management |
| **Uptime Kuma** | Uptime monitoring |
| **Vaultwarden** | Self-hosted Bitwarden |
| **Nextcloud** | Cloud storage |
| **SearXNG** | Private search engine |
| *+ more via registry* | Community-submitted packages |

---

## Install Flow

OpenTang walks you through 9 steps:

1. **Welcome** — Launch the app, hit "Begin Setup"
2. **System Check** — Auto-detects OS, Docker, RAM, disk. Offers to fix missing deps
3. **Choose Edition** — NanoClaw (light) / Hermes (balanced) / OpenClaw (full)
4. **LLM Config** — Install Ollama locally, enter a cloud API key, or skip
5. **Package Selection** — Toggle services on/off with live resource estimates
6. **Network Setup** — Local only, LAN, or internet-facing with domain + SSL
7. **Security** — Auto-generated credentials, copy/save, optional Vault
8. **Install** — Step-by-step progress with per-service status and log viewer
9. **Done** — Summary, quick-access URLs, "Open Dashboard" button

---

## Quick Start

### Download

Grab the latest release for your platform:

- 🐧 **Linux:** [OpenTang.AppImage](https://github.com/Koba42Corp/opentang/releases/latest)
- 🍎 **macOS:** [OpenTang.dmg](https://github.com/Koba42Corp/opentang/releases/latest)
- 🪟 **Windows:** [OpenTang.msi](https://github.com/Koba42Corp/opentang/releases/latest)

### Prerequisites

| Requirement | Details |
|---|---|
| **Docker** | [Get Docker →](https://docs.docker.com/get-docker/) — OpenTang can auto-install on Linux; on macOS, use Docker Desktop or OrbStack |
| **Windows only** | WSL2 enabled — OpenTang will prompt to install if missing |
| **RAM** | 4GB minimum, 8GB+ recommended |
| **Disk** | 10GB minimum, 40GB+ recommended for full stack |

> **Note:** OpenTang checks all prerequisites on launch and will guide you through installing anything that's missing.

---

## Development

### Requirements

- **Node.js** 20+
- **Rust** stable toolchain ([rustup.rs](https://rustup.rs))
- **Docker** installed and running
- Platform-specific Tauri dependencies ([see Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

### Setup

```bash
git clone https://github.com/Koba42Corp/opentang.git
cd opentang
npm install
```

### Run in development

```bash
npm run tauri:dev
```

This starts the Vite dev server with hot-reload and launches the Tauri window.

### Build for production

```bash
npm run tauri:build
```

Outputs platform-specific installers to `src-tauri/target/release/bundle/`.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server only (no Tauri) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run tauri:dev` | Full dev mode with Tauri window |
| `npm run tauri:build` | Production build with installers |
| `npm run generate-icons` | Generate Tauri app icons |
| `npm run lint` | TypeScript type check |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Desktop framework** | Tauri v2 (Rust + native WebView) |
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Icons** | Lucide React |
| **Fonts** | Inter + JetBrains Mono |
| **Orchestration** | Docker Compose v2 |
| **Package registry** | JSON manifests over HTTPS |
| **Auto-update** | Tauri Updater via GitHub Releases |

---

## Project Structure

```
opentang/
├── src/                    # React frontend
│   ├── components/         # UI components (wizard, store, dashboard)
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Root app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + design tokens
├── src-tauri/              # Rust backend (Tauri)
│   ├── src/                # Commands, compose engine, system checks
│   └── tauri.conf.json     # Tauri app configuration
├── packages/               # Docker Compose templates per service
├── registry/               # Package manifest (mirrors remote)
├── scripts/                # Build helpers (icon generation, etc.)
├── dist/                   # Vite build output
├── PRD.md                  # Product requirements document
├── BUILD_CHECKLIST.md      # Development progress tracker
├── DESIGN_SYSTEM.md        # UI design tokens and component specs
├── CONTRIBUTING.md         # Contribution guidelines
└── LICENSE                 # Apache 2.0
```

---

## Package Registry

After initial setup, OpenTang stays running as a service management layer. The in-app store lets you:

- Browse and install new packages (official + community)
- Update or remove installed services
- View container health and logs
- One-click restart/stop per service
- Access [ClawHub](https://clawhub.ai) for OpenClaw skills and plugins

Packages are defined as versioned JSON manifests:

```json
{
  "id": "n8n",
  "name": "n8n",
  "version": "1.0.0",
  "description": "Workflow automation",
  "category": "automation",
  "compose_url": "https://registry.opentang.koba42.com/packages/n8n/compose.yml",
  "min_ram_mb": 512,
  "tags": ["automation", "workflows", "nocode"]
}
```

Want to submit a package? See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Contributing

We welcome contributions! OpenTang is community-maintained under Apache 2.0.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Browse [open issues](https://github.com/Koba42Corp/opentang/issues)
- Submit packages via PR to the `registry/` directory
- Join the discussion on [GitHub Discussions](https://github.com/Koba42Corp/opentang/discussions)

---

## Roadmap

| Version | Focus |
|---|---|
| **v0.1.0** | Wizard installer, system checks, Compose engine, core packages |
| **v0.2.0** | In-app App Store, ClawHub integration, community packages |
| **v1.0.0** | Full polish, all platforms tested, public launch |

See [BUILD_CHECKLIST.md](BUILD_CHECKLIST.md) for granular progress tracking.

---

## License

Apache 2.0 — © 2026 [Koba42 Corp](https://koba42.com)

---

<div align="center">

**[Website](https://opentang.koba42.com)** · **[Issues](https://github.com/Koba42Corp/opentang/issues)** · **[Discussions](https://github.com/Koba42Corp/opentang/discussions)** · **[Contributing](CONTRIBUTING.md)**

<sub>Built with 🔶 by <a href="https://koba42.com">Koba42</a></sub>

</div>
