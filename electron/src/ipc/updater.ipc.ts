/**
 * updater.ipc.ts — Auto-Update IPC Handlers (M12)
 *
 * Uses electron-updater to check GitHub Releases for new versions.
 * Notifies the renderer via IPC when an update is available or downloaded.
 */

import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { IpcChannels } from "./channels";

// Configure auto-updater logger
autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = "info";

// Allow pre-release updates only in dev
autoUpdater.allowPrerelease = false;
autoUpdater.autoDownload = false; // Manual download triggered by user

export function registerUpdaterHandlers(mainWindow: BrowserWindow | null): void {
  // Configure feed URL (GitHub Releases)
  try {
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "ehtisham5618",
      repo: "Jarvis-OS",
    });
  } catch (err) {
    log.warn("[updater] Failed to set feed URL (expected in dev):", err);
    return;
  }

  // ─── Auto-updater Events ───────────────────────────────────────────────
  autoUpdater.on("checking-for-update", () => {
    log.info("[updater] Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    log.info(`[updater] Update available: v${info.version}`);
    mainWindow?.webContents.send("update:available", {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on("update-not-available", () => {
    log.info("[updater] No update available.");
    mainWindow?.webContents.send("update:not-available");
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`[updater] Download progress: ${progress.percent.toFixed(1)}%`);
    mainWindow?.webContents.send("update:download-progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info(`[updater] Update downloaded: v${info.version}`);
    mainWindow?.webContents.send("update:downloaded", {
      version: info.version,
    });
  });

  autoUpdater.on("error", (err) => {
    log.error("[updater] Auto-update error:", err);
    mainWindow?.webContents.send("update:error", err.message);
  });

  // ─── IPC Handlers ─────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.UPDATE_CHECK, async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      log.warn("[updater] Update check failed:", err);
    }
  });

  ipcMain.handle(IpcChannels.UPDATE_DOWNLOAD, async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      log.error("[updater] Download failed:", err);
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.UPDATE_INSTALL, () => {
    log.info("[updater] Installing update and relaunching...");
    autoUpdater.quitAndInstall(false, true);
  });
}

/**
 * Schedule periodic update checks (every 4 hours).
 */
export function scheduleUpdateChecks(mainWindow: BrowserWindow | null): void {
  // Initial check after 5 seconds (non-blocking startup)
  setTimeout(async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch {
      // Silently fail — might be offline or unsigned build
    }
  }, 5000);

  // Recurring check every 4 hours
  setInterval(
    async () => {
      try {
        await autoUpdater.checkForUpdates();
      } catch {
        // Silently fail
      }
    },
    4 * 60 * 60 * 1000,
  );
}
