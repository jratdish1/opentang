<div align="center">
  <h1>🔶 OpenTang</h1>
  <p><strong>Your stack. Your rules.</strong></p>
  <p>The open-source self-hosted AI + developer environment bootstrapper</p>

  ![License](https://img.shields.io/badge/license-Apache%202.0-orange)
  ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
  ![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20v2-blue)
</div>

## What is OpenTang?

OpenTang is a cross-platform desktop app that sets up your complete self-hosted AI and developer infrastructure in minutes — not days.

**Think:** Homebrew meets Docker Desktop meets an AI-native App Store.

## Features

- 🧙 **Step-by-step wizard** — guided setup with no YAML required
- 🤖 **AI-first** — install OpenClaw, Hermes, or NanoClaw + local LLMs via Ollama
- 🐳 **Docker-powered** — everything runs in containers
- 🔒 **Secure by default** — auto-generated credentials, Traefik + SSL
- 📦 **App Store** — install, update, remove services post-setup
- 🌐 **Any network** — localhost, LAN, or internet-facing with auto SSL

## Included Stack

| Service | Purpose |
|---|---|
| Coolify | Self-hosted PaaS |
| OpenClaw / Hermes / NanoClaw | AI agent system |
| Ollama | Local LLM runtime |
| Gitea | Private Git server |
| Portainer | Docker management |
| Grafana + Prometheus | Monitoring |
| n8n | Workflow automation |
| + more via App Store | |

## Quick Start

Download the latest release for your platform:

- 🐧 **Linux**: [OpenTang.AppImage](https://github.com/Koba42Corp/opentang/releases/latest)
- 🍎 **macOS**: [OpenTang.dmg](https://github.com/Koba42Corp/opentang/releases/latest)
- 🪟 **Windows**: [OpenTang.msi](https://github.com/Koba42Corp/opentang/releases/latest)

**Requirements:** Docker must be installed. [Get Docker →](https://docs.docker.com/get-docker/)

## Development

```bash
# Prerequisites: Node 20+, Rust stable, Docker

git clone https://github.com/Koba42Corp/opentang
cd opentang
npm install
npm run tauri:dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 — © 2026 [Koba42 Corp](https://koba42.com)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://koba42.com">Koba42</a></sub>
</div>
