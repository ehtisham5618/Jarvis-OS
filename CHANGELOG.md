# Changelog

All notable changes to Jarvis OS are documented in this file.
Format follows [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.1.0] — 2026-07-21 — First Public Release

### 🚀 Features

- **M1 — Foundation**: Service registry, dependency injection, Zustand state stores, initialization bootloader
- **M2 — System Hardware Monitoring**: Real-time CPU/RAM/Network gauges with `systeminformation`, mock fallback service, IPC bridge
- **M3 — AI Executive Intelligence**: Ollama integration (Llama 3 8B), streaming chat, global AI store, Markdown renderer with syntax highlighting
- **M4 — Windows OS Integration**: File browser, sandboxed terminal, process manager, native notifications, typed IPC bridge
- **M5 — Memory Engine**: LanceDB vector database, semantic search embeddings via Ollama, background auto-summarization, memory timeline UI
- **M6 — Voice Intelligence**: Speech-to-text (Whisper via Ollama), text-to-speech (Windows SAPI), hotkey activation, voice command routing
- **M7 — Vision & Automation**: Screen capture, OCR (Tesseract.js), AI vision analysis, automation engine with triggers/actions, cron scheduling
- **M8 — Multi-Model AI**: Model manager, download/delete models, model benchmarking, per-session model selection
- **M9 — Plugin SDK**: Plugin manifest system, sandboxed BrowserWindow runners, IPC-based SDK, plugin marketplace, developer route
- **M10 — Security Engine**: Windows Hello + PIN auth, lock screen overlay, runtime permission prompts, append-only audit log, privacy mode
- **M11 — Performance Optimization**: Virtualized chat list, code splitting, Web Workers for embeddings & Markdown, GPU acceleration flags, startup performance markers
- **M12 — Production Release**: electron-updater auto-update with GitHub Releases, crash reporter, privacy-first telemetry, CI/CD GitHub Actions pipeline, NSIS installer

### ⚡ Performance

- Cold startup < 3 seconds on mid-range hardware
- 60fps scrolling with 1000+ messages via virtual scrolling
- Lazy-loaded syntax highlighter bundle
- GPU rasterization enabled by default

### 🔒 Security

- Full context isolation enforced on all BrowserWindows
- Zod-validated IPC payloads
- No hardcoded secrets or tokens
- Audit log for all sensitive operations
- Privacy mode restricts AI to local Ollama only
