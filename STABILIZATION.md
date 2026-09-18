# JARVIS stabilization — verified 19 September 2026

This report records the stabilization work that forms release **0.1.22**. The initial local verification used package version 0.1.19; those historical measurements and artifact details are retained below. Current installation and publication instructions are in [README.md](README.md) and [docs/RELEASING.md](docs/RELEASING.md).

## Initial local verification build (0.1.19)

- Installer: `release/stable/Jarvis Setup 0.1.19.exe` (363,936,561 bytes). NSIS build completed with exit code 0; nothing was published. The existing installed application has not been replaced automatically.
- Runnable application: `release/stable/win-unpacked/Jarvis.exe`. The complete directory must stay together. Direct executable launch reached renderer-ready and remains responsive in the final process check.
- Installer SHA-256: `E924E5A816935A22D74E3DE5965C3E22CD9F8D1BF4896D382B7AB84FAA547A4C`.
- 7-Zip tested the embedded payload: **Everything is Ok**, exit code 0. It also reports trailing data after the embedded archive inside the installer; this is not a payload integrity failure.
- The local installer build used `ELECTRON_BUILDER_COMPRESSION_LEVEL=0` and `--config.compression=store` to reduce packaging overhead. The resulting payload still reports LZMA2 due to the NSIS differential-archive settings. Interrupted archive caches were removed before the successful build.

## Git baseline

Before stabilization, fetched origin and reset local master directly to origin/master (`92ff500`) as requested. The prior local-only master history was discarded without a backup branch, merge, or rebase. The initial verification stage did not commit or publish changes. Release 0.1.22 subsequently packages these repairs with the user's authorization to commit, push, and publish; historical release tags are preserved.

## Findings and repairs

- **Reproduced startup failure:** `LockScreen.tsx` imported Node's `crypto.createHash` into the browser bundle. Vite rejected that import before React hydration, leaving the boot screen. Removed the unused Node import/helper.
- **Packaged startup failure:** the previous server launcher could continue after its five-second timer without discovering a port. Existing production logs contained `http://127.0.0.1:null`. Replaced log-message timing with a bounded HTTP readiness probe, explicit loopback host/port, child-process failure handling, and renderer-ready acknowledgement. A stable origin preserves browser storage between launches.
- **Responsiveness hazards:** synchronous Windows Hello execution could block the main thread for 30 seconds; heavyweight native modules loaded eagerly; overlapping telemetry requests repeatedly launched WMI work; generated build output was watched by Vite; animated full-window blur layers consumed substantial GPU-process CPU. Authentication now uses asynchronous execution; optional native modules load on demand; telemetry shares pending queries and caches expensive sensors; polling is reference counted; generated folders are excluded from watching; the wallpaper keeps its appearance without perpetual drift.
- The original Windows **“Not Responding”** event was not conclusively reproduced. These are identified blocking/load hazards, not a claim that every historical hang had one proven cause. No unresponsive-window event was seen in the completed smoke runs.
- **Electron/IPC:** register handlers once, independently of window display; bound renderer invocation waits; clean up individual listeners; show loading/recovery screens; retry after renderer failure; retain close-to-tray behavior; terminate the renderer server on quit; retain context isolation. Safe mode disables hardware acceleration and automation triggers.
- **Ollama:** startup does not await the provider. Offline status remains truthful, with no fabricated AI response. Discover exact installed tags, including custom/small models. Chat handles fragmented NDJSON and a final line without a newline, propagates failures, times out, and supports aborting the request. No model downloads happen at startup.
- **React/state:** initialize the service registry once; make optional discovery asynchronous; prevent overlapping telemetry refreshes and duplicate chat requests; connect Stop to request cancellation; keep message-list height bounded; sanitize Markdown in the renderer rather than attempting DOM operations in a worker.
- **Native features:** return serializable memory rows from LanceDB, use the correct vector-query API, write memory archives asynchronously, fix file-entry directory flags, and resolve file shortcuts from the current profile instead of the forbidden `C:\Users` parent.
- **Packaging:** archive creation repeatedly stalled on this Windows environment. The deliverable uses Electron's supported directory layout (`asar: false`). A post-package check verifies main, preload, server entry, and renderer assets. Build scripts compile before packaging and explicitly disable publication.

## Verification

- Six targeted regression tests pass: idempotent nonblocking initialization, offline AI failure, fragmented streaming, cancellation, exact model discovery, and telemetry concurrency/subscriber cleanup.
- Renderer TypeScript and Electron TypeScript builds pass. Production Vite/Nitro build passes. ESLint has zero errors and seven existing/generated warnings.
- Three successive production-mode launches passed. Initial renderer-ready measurements were approximately 4.1, 3.3, and 9.8 seconds; the slower run overlapped packaging on this two-core machine.
- Development-mode Electron passed the same 21-route smoke suite.
- Checks cover the preload bridge, filesystem write/read/list, shell execution, memory store/search/delete, minimize/restore, close-to-tray/reopen, route rendering, renderer errors, and main-thread heartbeat.
- Offline testing blocks only test-window requests to Ollama; it does not stop the user's running Ollama service. Startup and routes remained usable.
- Real Ollama chat returned `READY` inside the desktop. Detected installed models: `hotel-qwen:latest`, `qwen2.5:3b`, `qwen2.5:1.5b`, and `qwen2.5-coder:3b`.
- Packaged-runtime tests use the packaged main/preload/server/dependencies, with an isolated test profile. Intentional renderer termination checks the recovery page and Retry.
- Final packaged recovery run passed in 50.7 seconds, including all route/IPC checks and deliberate crash/retry. A previous harness run waited on a promise from the discarded renderer after successful recovery; that harness bug was fixed and the test rerun. Direct executable startup took 23.3 seconds while installer compression heavily loaded the machine.
- Warm telemetry returned the actual Intel i5-7200U, RAM, three disks, and process inventory. Unsupported/slow optional sensors remain unavailable. A separate native query confirmed Intel HD Graphics 620.
- Production idle samples after the wallpaper change showed about 0.1–0.4% main-process CPU and 34 ms maximum heartbeat delay in the third run. GPU-process CPU was about 8%; an earlier animated-wallpaper chat sample was about 30%. These short samples used different routes and are diagnostic observations, not a controlled benchmark. Development heartbeat delay was 17 ms. Packaging can heavily load the whole machine.
- During the packaged recovery run, system CPU reached 100% from concurrent packaging and maximum heartbeat delay reached 914 ms. The application remained responsive and recovered successfully; this is not a claim of consistently low latency under system saturation.
- Detailed local logs, JSON results, and screenshots are in the ignored `diagnostics/` directory. `scripts/electron-smoke.cjs` supports production, offline, real-chat, packaged-main, and deliberate-recovery checks.

## Limits and nonblocking warnings

- Native microphone capture, speech model downloads, Windows Hello user interaction, plugin execution, and every existing automation were not exhaustively exercised. Route rendering is not a claim that every roadmap feature is complete.
- No embedding model is installed; memory storage works, while semantic prompt retrieval skips unavailable embeddings. No model was silently installed.
- Some existing dashboard content remains demonstration content. Hardware values were changed to use native metrics rather than fluctuating fabricated measurements.
- Missing temperature/utilization sensors are hardware/driver dependent. First telemetry results can omit slower metadata while cached queries complete; the existing GPU contract can still show zero for unsupported temperature/utilization readings.
- The builder reports the default Electron icon and disabled ASAR. The installer is not backed by a configured signing certificate. No release publication occurred.
- The existing installed copy under Program Files is not overwritten by source changes. Use the current release installer linked from the README to update it.

## Reproduction

`npm test`, `npx tsc --noEmit`, `npm run electron:build-main`, `npm run lint`, and `npm run build` verify the source. `npm run dev:electron` starts development mode. `npm run build:electron:dir` creates the application directory; `npm run build:electron` creates the installer. For this machine's runtime-extraction issue, packaging was run with `--config.electronDist=node_modules/electron/dist` and `--publish never`.

The Electron smoke harness should run with `ELECTRON_RUN_AS_NODE` unset. Set `JARVIS_PRODUCTION=1` for the built renderer; optional flags are `JARVIS_TEST_OFFLINE=1`, `JARVIS_TEST_CHAT=1`, and `JARVIS_TEST_RECOVERY=1`. `JARVIS_TEST_MAIN` can point to the packaged main file. Tests use `diagnostics/smoke-profile` rather than personal application data.

## Changed files

- `.gitignore`
- `electron/src/auth/AuthService.ts`
- `electron/src/automation/AutomationEngine.ts`
- `electron/src/ipc/fs.ipc.ts`
- `electron/src/ipc/index.ts`
- `electron/src/ipc/memory.ipc.ts`
- `electron/src/ipc/system.ipc.ts`
- `electron/src/ipc/vision.ipc.ts`
- `electron/src/ipc/voice.ipc.ts`
- `electron/src/main.ts`
- `electron/src/preload.ts`
- `eslint.config.js`
- `package.json`
- `src/components/auth/LockScreen.tsx`
- `src/components/chat/ChatBubble.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatMessageList.tsx`
- `src/components/chat/MarkdownRenderer.tsx`
- `src/components/chat/ModelSelector.tsx`
- `src/components/desktop/Shell.tsx`
- `src/components/desktop/TitleBar.tsx`
- `src/components/desktop/Wallpaper.tsx`
- `src/components/desktop/WidgetsPanel.tsx`
- `src/components/filesystem/FileBrowser.tsx`
- `src/core/config/ConfigManager.ts`
- `src/core/init.ts`
- `src/core/model-router/ModelRouter.ts`
- `src/routeTree.gen.ts`
- `src/routes/__root.tsx`
- `src/routes/files.tsx`
- `src/routes/system.tsx`
- `src/services/electron/ElectronMemoryService.ts`
- `src/services/interfaces/IAIService.ts`
- `src/services/mock/MockModelService.ts`
- `src/services/ollama/OllamaService.ts`
- `src/stores/ai.store.ts`
- `src/stores/models.store.ts`
- `src/stores/system.store.ts`
- `src/workers/markdownRender.worker.ts`
- `vite.config.ts`
- `electron/src/startup.ts`
- `scripts/electron-diagnose.cjs`
- `scripts/electron-smoke.cjs`
- `scripts/verify-package.cjs`
- `tests/stability.test.ts`
- `vitest.config.ts`
- `STABILIZATION.md`
