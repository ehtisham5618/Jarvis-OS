# Jarvis OS

Jarvis OS is a Windows desktop assistant built with Electron, React, and TanStack Start. It connects to local Ollama models for streaming chat and exposes native file, memory, and system services through an isolated preload bridge. It is an application, not a replacement operating system.

## Install

Download **Jarvis-Setup-0.1.22.exe** from [the latest release](https://github.com/ehtisham5618/Jarvis-OS/releases/latest). Run the installer and launch Jarvis from the Start menu. Windows 10/11 x64 is the supported release target. Builds without a configured signing certificate are unsigned.

For local chat, install and start [Ollama](https://ollama.com), then install a model appropriate for your machine. Jarvis discovers installed model tags, including custom models. It does not download models at startup. The desktop remains usable when Ollama is offline and shows an offline state instead of simulated AI responses.

## What is verified

| Area              | Release verification                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Desktop           | Development and production startup, 21 routes, repeated launches, minimize/restore, close to tray |
| Local chat        | Actual Ollama streaming, exact model discovery, offline handling, cancellation regression tests   |
| Native services   | File read/write/list, memory store/search/delete, CPU/RAM/disks/process telemetry                 |
| Recovery          | Loading/error screens and retry after an intentional renderer crash                               |
| Optional features | Voice, OCR, Windows Hello, plugins, and automation exist but are not exhaustively validated       |

Semantic memory retrieval requires an installed embedding model. Missing sensors depend on hardware and drivers; some GPU fields retain zero when the driver cannot report them. Some dashboard and roadmap screens still contain demonstration content. See [the verification report](STABILIZATION.md) for the exact evidence and limits.

## Develop

Use **Node.js 24** and npm, matching CI. `package-lock.json` is the supported dependency lockfile.

```powershell
git clone https://github.com/ehtisham5618/Jarvis-OS.git
cd Jarvis-OS
npm ci
npm run dev:electron
```

The desktop command compiles Electron, starts Vite on `127.0.0.1:8080`, and waits before opening Electron. Unset `ELECTRON_RUN_AS_NODE` if your shell sets it. `npm run dev` alone uses browser simulation for native services and is not a substitute for desktop integration testing.

| Command                       | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `npm test`                    | Targeted regression tests                                |
| `npm run lint`                | ESLint                                                   |
| `npx tsc --noEmit`            | Renderer type checking                                   |
| `npm run electron:build-main` | Electron type checking and compilation                   |
| `npm run build`               | Production renderer/server in `.output/`                 |
| `npm run build:electron:dir`  | Windows application directory in `release/win-unpacked/` |
| `npm run build:electron`      | Windows NSIS installer in `release/`                     |
| `npm run test:electron`       | Native smoke harness; see testing guide                  |

## Architecture and behavior

- `electron/src/main.ts` manages the window, tray, lifecycle, and recovery. `startup.ts` starts the production HTTP server on loopback port 43123 and verifies readiness before navigation.
- `electron/src/preload.ts` exposes bounded IPC calls with context isolation enabled and Node integration disabled.
- `src/core/` registers service implementations. `src/services/` separates native and Ollama adapters from their interfaces; `src/stores/` manages renderer state.
- `src/routes/` contains file-based routes. Do not edit `src/routeTree.gen.ts` manually.
- Expensive native modules load on demand. Telemetry caches slow queries and shares pending work rather than overlapping polls.
- Closing the window hides Jarvis to the tray. Use the tray Quit command to exit. `Ctrl+Space` toggles the desktop. `--safe-mode` disables hardware acceleration and automation triggers.

## Data and network access

Chat is sent to the configured Ollama endpoint, which defaults to localhost. A remote endpoint changes where that data is processed. Model downloads, update checks, and some external resources need network access. Crash upload is disabled by default. Native actions are mediated through IPC; this is not a claim that every handler or plugin has undergone a security audit.

## Documentation

- [Development, testing, and troubleshooting](docs/DEVELOPMENT.md)
- [Release procedure](docs/RELEASING.md)
- [Changelog](CHANGELOG.md)
- [Stabilization findings and verification](STABILIZATION.md)
- [Contribution guide](CONTRIBUTING.md)
- [Route conventions](src/routes/README.md)

## License

[MIT](LICENSE).
