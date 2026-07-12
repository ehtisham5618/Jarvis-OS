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
import { registerAllHandlers } from "./ipc/index";
import { IpcChannels } from "./ipc/channels";

// ─── Logger Configuration ──────────────────────────────────────────────────
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.info("Jarvis OS main process starting...");

// ─── Dev Mode Detection ────────────────────────────────────────────────────
const isDev = !app.isPackaged;
const DEV_SERVER_URL = "http://localhost:8080";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;

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
    show: false, // Show after content loads (prevents white flash)
    icon: path.join(__dirname, "../../public/icon.ico"),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,     // Security: renderer cannot access Node APIs
      nodeIntegration: false,     // Security: never enable
      sandbox: false,             // Required for preload script to use ipcRenderer
      webSecurity: true,
    },
  });

  // Manage window state (save on move/resize)
  windowState.manage(mainWindow);

  // ─── Load Content ──────────────────────────────────────────────────────
  if (isDev) {
    log.info(`[main] Dev mode: loading ${DEV_SERVER_URL}`);
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path.join(__dirname, "../../dist/index.html");
    log.info(`[main] Production mode: loading ${indexPath}`);
    mainWindow.loadFile(indexPath);
  }

  // ─── Window Events ────────────────────────────────────────────────────
  // Show window after it's ready to avoid visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    log.info("[main] Window shown");
  });

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

  if (!registered) {
    log.warn("[main] Failed to register global shortcut Ctrl+Space");
  } else {
    log.info("[main] Global shortcut Ctrl+Space registered");
  }
}

// ─── IPC: Application Controls ────────────────────────────────────────────
function registerAppControls(): void {
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
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",   // unsafe-inline needed for Vite HMR in dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' http://localhost:11434 ws://localhost:*",  // Ollama + Vite HMR
            "img-src 'self' data:",
          ].join("; "),
        ],
      },
    });
  });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────
app.setAppUserModelId("com.jarvis-os.app");

app.whenReady().then(() => {
  log.info("[main] App ready");

  // Register all IPC handlers before creating the window
  registerAllHandlers();
  registerAppControls();
  applyContentSecurityPolicy();

  createWindow();
  createTray();
  registerGlobalShortcut();
});

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
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  log.info("[main] App quitting — all shortcuts unregistered");
});
