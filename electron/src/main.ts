import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  nativeImage,
  shell,
  session,
} from "electron";
import * as path from "path";
import windowStateKeeper from "electron-window-state";
import log from "electron-log";
import * as fs from "fs";
import { startRendererServer, startupPage } from "./startup";
import type { ChildProcess } from "child_process";
import { registerCriticalHandlers, registerDeferredHandlers } from "./ipc/index";
import { IpcChannels } from "./ipc/channels";
import { registerUpdaterHandlers, scheduleUpdateChecks } from "./ipc/updater.ipc";
import { initCrashReporter } from "./telemetry/CrashReporter";
import { initTelemetry } from "./telemetry/TelemetryService";

// ─── Logger Configuration ──────────────────────────────────────────────────
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.info("Jarvis OS main process starting...");

// ─── GPU & Memory Flags (M11) ──────────────────────────────────────────────
// Use Chromium's driver compatibility decisions instead of forcing GPU features.
if (process.argv.includes("--safe-mode")) app.disableHardwareAcceleration();

// ─── Dev Mode Detection ────────────────────────────────────────────────────
const isDev = !app.isPackaged && process.env.JARVIS_PRODUCTION !== "1";
const DEV_SERVER_URL = "http://127.0.0.1:8080";

// ─── Log Cleanup (M11) ─────────────────────────────────────────────────────
async function cleanOldLogs() {
  try {
    const logPath = path.dirname(log.transports.file.getFile().path);
    const files = await fs.promises.readdir(logPath);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (file.endsWith(".log")) {
        const filePath = path.join(logPath, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.mtimeMs < thirtyDaysAgo) {
          await fs.promises.unlink(filePath);
          log.info(`[main] Deleted old log file: ${file}`);
        }
      }
    }
  } catch (err) {
    log.error("[main] Failed to clean old logs:", err);
  }
}

// ─── Find Free Port ────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;
let rendererUrl = isDev ? DEV_SERVER_URL : "";
let loading: Promise<void> | undefined;
let loadingPage: Promise<void> | undefined;
let rendererReadyTimer: ReturnType<typeof setTimeout> | undefined;
let nitroServer: ChildProcess | null = null;

// ─── Window Creation ───────────────────────────────────────────────────────
function createWindow(): void {
  // Restore window state (position, size, maximized)
  const windowState = windowStateKeeper({
    defaultWidth: 1440,
    defaultHeight: 900,
  });

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 1024,
    minHeight: 680,

    // Frameless — we render our own titlebar
    frame: false,
    titleBarStyle: "hidden",

    // Visual
    backgroundColor: "#050608",
    show: true, // Native shell is available while services start
    icon: path.join(__dirname, "../../public/icon.ico"),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Security: renderer cannot access Node APIs
      nodeIntegration: false, // Security: never enable
      sandbox: false, // Required for preload script to use ipcRenderer
      webSecurity: true,
    },
  });

  // Manage window state (save on move/resize)
  windowState.manage(mainWindow);

  // ─── Load Content ──────────────────────────────────────────────────────
  mainWindow.webContents.on("console-message", (event) => {
    if (event.level === "error") log.error("[renderer]", event.message);
  });
  mainWindow.webContents.on("preload-error", (_event, _file, error) => {
    log.error("[startup:preload]", error);
    void showRecovery();
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    log.error("[startup:renderer]", details);
    void showRecovery();
  });
  mainWindow.on("unresponsive", () => log.error("[electron] Window became unresponsive"));
  mainWindow.on("responsive", () => log.info("[electron] Window responsive again"));
  loadingPage = mainWindow.loadURL(startupPage());
  void loadingPage.catch((error) => log.error("[startup] Loading page", error));
  log.info(`[startup] Window created at ${performance.now().toFixed(0)}ms`);

  // Minimize to tray on close (don't quit)
  mainWindow.on("close", (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      log.info("[main] Window hidden to tray");
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open external links in the default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ─── Tray Setup ──────────────────────────────────────────────────────────
function createTray(): void {
  // Use a simple PNG icon for the tray (16×16)
  const iconPath = path.join(__dirname, "../../public/tray-icon.png");
  let trayIcon = nativeImage.createFromPath(iconPath);

  // Fallback: if no custom tray icon yet, create a default one
  if (trayIcon.isEmpty()) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("Jarvis OS — Executive Intelligence");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Jarvis",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit Jarvis",
      click: () => {
        isAppQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click tray icon → toggle window
  tray.on("double-click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// ─── Global Hotkey ────────────────────────────────────────────────────────
function registerGlobalShortcut(): void {
  const registered = globalShortcut.register("CommandOrControl+Space", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  const voiceRegistered = globalShortcut.register("CommandOrControl+Shift+Space", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send("voice:hotkey-toggle");
    }
  });

  if (!registered) {
    log.warn("[main] Failed to register global shortcut Ctrl+Space");
  } else {
    log.info("[main] Global shortcut Ctrl+Space registered");
  }

  if (!voiceRegistered) {
    log.warn("[main] Failed to register global shortcut Ctrl+Shift+Space");
  } else {
    log.info("[main] Global shortcut Ctrl+Shift+Space registered");
  }
}

// ─── IPC: Application Controls ────────────────────────────────────────────
async function showRecovery(): Promise<void> {
  clearTimeout(rendererReadyTimer);
  if (mainWindow && !mainWindow.isDestroyed()) {
    await mainWindow
      .loadURL(startupPage(true))
      .catch((error) => log.error("[startup:recovery]", error));
  }
}

function loadDesktop(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      if (!isDev && !nitroServer) {
        const entry = path.normalize(
          path
            .join(__dirname, "../../.output/server/index.mjs")
            .replace(/app\.asar[/\\]/g, "app.asar.unpacked/"),
        );
        const server = await startRendererServer(process.execPath, entry);
        nitroServer = server.process;
        rendererUrl = server.url;
        nitroServer.once("exit", () => {
          nitroServer = null;
          if (!isAppQuitting) void showRecovery();
        });
      }
      if (isAppQuitting) {
        nitroServer?.kill();
        return;
      }
      await loadingPage;
      clearTimeout(rendererReadyTimer);
      rendererReadyTimer = setTimeout(() => {
        log.error("[startup] Renderer did not acknowledge initialization within 30 seconds");
        void showRecovery();
      }, 30000);
      await mainWindow?.loadURL(rendererUrl);
    } catch (error) {
      log.error("[startup] Desktop failed to load", error);
      await showRecovery();
    } finally {
      loading = undefined;
    }
  })();
  return loading;
}

function registerAppControls(): void {
  ipcMain.handle("app:retry-startup", () => loadDesktop());
  ipcMain.handle("app:open-logs", () => shell.openPath(log.transports.file.getFile().path));
  ipcMain.on("app:renderer-ready", () => {
    clearTimeout(rendererReadyTimer);
    log.info(`[startup] Renderer interactive at ${performance.now().toFixed(0)}ms`);
  });
  ipcMain.handle(IpcChannels.APP_GET_VERSION, () => app.getVersion());

  ipcMain.on(IpcChannels.APP_QUIT, () => {
    isAppQuitting = true;
    app.quit();
  });

  ipcMain.on(IpcChannels.APP_MINIMIZE, () => mainWindow?.minimize());

  ipcMain.on(IpcChannels.APP_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on(IpcChannels.APP_TOGGLE, () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  ipcMain.on(IpcChannels.APP_SHOW, () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// ─── Content Security Policy ──────────────────────────────────────────────
function applyContentSecurityPolicy(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          [
            "default-src 'self' http://127.0.0.1:*",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for SSR hydration
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "connect-src 'self' http://127.0.0.1:* http://localhost:11434 ws://localhost:* ws://127.0.0.1:*", // Nitro + Ollama + Vite HMR
            "img-src 'self' data: blob:",
          ].join("; "),
        ],
      },
    });
  });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────
app.setAppUserModelId("com.jarvis-os.app");

const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) app.quit();
else {
  app.on("second-instance", () => {
    if (mainWindow?.isMinimized()) mainWindow.restore();
    mainWindow?.show();
    mainWindow?.focus();
  });
  app
    .whenReady()
    .then(async () => {
      registerAppControls();
      applyContentSecurityPolicy();
      createWindow();
      createTray();
      registerGlobalShortcut();
      // Handler registration happens once, independently of window recreation.
      registerCriticalHandlers();
      registerDeferredHandlers();
      registerUpdaterHandlers(mainWindow);
      if (app.isPackaged) scheduleUpdateChecks(mainWindow);
      initCrashReporter();
      initTelemetry(true);
      cleanOldLogs();
      await loadDesktop();
    })
    .catch((error) => {
      log.error("[startup] Bootstrap failed", error);
      void showRecovery();
    });
}

app.on("before-quit", () => {
  isAppQuitting = true;
  clearTimeout(rendererReadyTimer);
});
process.on("unhandledRejection", (error) => log.error("[electron] Unhandled rejection", error));

app.on("window-all-closed", () => {
  // On Windows/Linux: don't quit when all windows are closed (we hide to tray instead)
  // On macOS: standard behavior is to keep app running
  if (process.platform !== "darwin") {
    // Don't quit — the tray keeps us alive
  }
});

app.on("activate", () => {
  // macOS: re-create window if dock icon is clicked and no windows are open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    void loadDesktop();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (nitroServer) {
    nitroServer.kill();
    log.info("[main] Nitro server killed");
  }
  log.info("[main] App quitting — all shortcuts unregistered");
});
