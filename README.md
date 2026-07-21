# Jarvis OS

> **The Intelligence of Your Computer**
>
> Jarvis is not an app. Jarvis is not a chatbot. Jarvis is an **AI-Native Desktop Environment** — the first OS designed to understand your intent instead of waiting for your commands.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Chat** | Streaming conversations with local LLMs via Ollama (Llama 3, Mistral, etc.) |
| 🔍 **Semantic Memory** | Persistent, searchable memory powered by LanceDB vector storage |
| 🎙️ **Voice Intelligence** | Speak to Jarvis — STT via Whisper, TTS via Windows SAPI |
| 👁️ **Vision** | Screenshot, OCR, and AI image analysis |
| ⚡ **Automations** | Trigger/action automation engine with cron scheduling |
| 🧩 **Plugin System** | Install community plugins with a typed SDK and sandboxed runtime |
| 🔒 **Security** | Windows Hello biometric auth, PIN lock, runtime permission prompts, audit log |
| 📊 **System Monitor** | Real-time CPU, RAM, and process monitoring |
| 📁 **File Browser** | Integrated file navigator with OS integration |
| 💻 **Terminal** | Sandboxed terminal with command allowlists |
| 🎨 **Customizable** | Themes, wallpapers, privacy mode, model selection |

---

## 🚀 Quick Start

### Prerequisites

- Windows 10/11 (64-bit)
- [Ollama](https://ollama.ai) installed and running locally
- At least one model pulled: `ollama pull llama3`

### Installation

1. Download the latest `Jarvis-Setup-x.x.x.exe` from [Releases](https://github.com/ehtisham5618/Jarvis-OS/releases)
2. Run the installer (you may get a SmartScreen warning — click "More info" → "Run anyway")
3. Launch Jarvis from your desktop or Start menu

### First Run

1. Jarvis will detect your Ollama installation automatically
2. Complete the setup wizard to choose your default model and preferences
3. Press `Ctrl+Space` to summon Jarvis from anywhere

---

## 🛠️ Development Setup

### Requirements

- Node.js 20+
- npm 10+
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/ehtisham5618/Jarvis-OS.git
cd Jarvis-OS

# Install dependencies
npm install

# Start the development server
npm run dev:electron
```

This will start both the Vite dev server and Electron simultaneously.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server only |
| `npm run dev:electron` | Start full Electron + Vite dev environment |
| `npm run build` | Build Vite renderer for production |
| `npm run electron:build-main` | Compile Electron TypeScript |
| `npm run build:electron` | Full production build + installer |
| `npx tsc --noEmit` | Type-check without emitting files |

### Project Structure

```
jarvis-os/
├── electron/          # Electron main process
│   └── src/
│       ├── main.ts        # Entry point, window management
│       ├── preload.ts     # IPC bridge (contextBridge)
│       ├── ipc/           # IPC handler modules
│       ├── auth/          # Authentication & audit
│       ├── automation/    # Automation engine
│       ├── plugins/       # Plugin loader & sandbox
│       └── telemetry/     # Crash reporting & telemetry
├── src/               # Renderer (React + TanStack Router)
│   ├── routes/        # Page routes
│   ├── components/    # UI components
│   ├── stores/        # Zustand state stores
│   ├── services/      # Service interfaces & implementations
│   ├── workers/       # Web Workers
│   └── core/          # DI registry, logger, init
├── public/            # Static assets
├── sample-plugin/     # Example plugin
└── .github/workflows/ # CI/CD pipelines
```

---

## 🏗️ Architecture

Jarvis is built on a strict **interface-first** architecture:

- **Never coupled to Windows** — all OS operations go through `IService` interfaces
- **Dependency injection** — `ServiceRegistry` resolves implementations at runtime
- **Electron as a platform** — never a dependency, always an implementation detail
- **Security by default** — `contextIsolation: true`, `nodeIntegration: false`, Zod-validated IPC

---

## 🔒 Privacy

Jarvis is **privacy-first**:

- All AI processing runs locally via Ollama — your conversations never leave your machine
- Privacy Mode (`Ctrl+Shift+P`) enforces local-only operation
- Telemetry is anonymous, opt-out, and never includes content or file paths
- Audit log gives you full visibility into every system action

---

## 📄 License

MIT © 2026 Jarvis OS — See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and follow [Conventional Commits](https://www.conventionalcommits.org/).

```bash
# Feature
git commit -m "feat(voice): add wake-word detection"

# Bug fix
git commit -m "fix(memory): resolve embedding timeout on slow hardware"

# Performance
git commit -m "perf(chat): reduce re-renders with useMemo"
```
