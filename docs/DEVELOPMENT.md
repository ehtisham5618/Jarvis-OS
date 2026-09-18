# Development and testing

Use Node.js 24 and `npm ci`. Windows 10/11 x64 is the packaged desktop target. Browser development has simulated native adapters; Electron tests use actual IPC and an isolated profile.

## Checks

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run electron:build-main
npm run build
```

The six regression tests cover nonblocking/idempotent initialization, offline AI failure, fragmented streaming, cancellation, exact model discovery, and telemetry concurrency/subscriber cleanup. Existing lint warnings are listed in the verification report; do not treat warnings as successful functional coverage.

## Native smoke tests

First compile Electron and the production renderer using the commands above. Stop any production instance using port 43123 before running a production smoke test.

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
$env:JARVIS_PRODUCTION = '1'
npm run test:electron
```

Optional environment flags:

| Flag                     | Behavior                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| `JARVIS_TEST_OFFLINE=1`  | Block Ollama requests in the test window without stopping the Ollama service |
| `JARVIS_TEST_CHAT=1`     | Send a real chat request; requires a running provider and installed model    |
| `JARVIS_TEST_RECOVERY=1` | Deliberately crash the renderer and verify recovery/retry                    |
| `JARVIS_TEST_MAIN`       | Absolute path to a packaged `resources/app/electron/dist/main.js`            |

Do not combine offline and chat-success modes. Unset `JARVIS_PRODUCTION` and start `npm run dev` first for a development smoke run. Remove test environment flags after testing. Results and an isolated profile are written under ignored `diagnostics/`.

The harness checks 21 routes, bridge availability, files, shell execution, memory operations, minimize/restore, close-to-tray/reopen, errors, and short CPU/heartbeat samples. It is not exhaustive validation of voice, biometrics, every automation, or every route action.

## Troubleshooting

- **Ollama offline:** start Ollama and check its configured endpoint and installed models. Jarvis does not download a model automatically.
- **Startup recovery screen:** choose Retry or open the diagnostic log. Verify loopback port 43123 is free. Packaged Windows logs normally reside under `%APPDATA%/Jarvis/logs/`.
- **GPU trouble:** start `Jarvis.exe --safe-mode`; automation triggers are also disabled in this mode.
- **Slow sensors:** first samples may omit expensive metadata. Some drivers cannot supply GPU utilization or temperatures.
- **Memory retrieval unavailable:** install/configure an embedding model before expecting semantic retrieval; storage is a separate operation.
- **Electron starts as Node:** unset `ELECTRON_RUN_AS_NODE` in the launching shell.
- **Runtime extraction fails during packaging:** use `npx electron-builder --dir --publish never --config.electronDist=node_modules/electron/dist` after both builds complete.

Never build `.output/` while a packager is reading it. Compilation and packaging must run sequentially.
