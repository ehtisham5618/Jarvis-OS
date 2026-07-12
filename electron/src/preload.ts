import { contextBridge, ipcRenderer } from "electron";
import { IpcChannels } from "./ipc/channels";

/**
 * Jarvis OS — Preload Script
 *
 * This is the ONLY bridge between the isolated renderer and the main process.
 * Every API exposed here is explicitly typed and intentionally minimal.
 *
 * Security rules:
 * - contextIsolation: true (always)
 * - nodeIntegration: false (always)
 * - No dynamic channel names — only constants from channels.ts
 */

const jarvisOS = {
  // ─── System ────────────────────────────────────────────────────────────────
  system: {
    getMetrics: () =>
      ipcRenderer.invoke(IpcChannels.SYSTEM_GET_METRICS),
    getProcesses: () =>
      ipcRenderer.invoke(IpcChannels.SYSTEM_GET_PROCESSES),
  },

  // ─── File System ───────────────────────────────────────────────────────────
  fs: {
    readFile: (filePath: string) =>
      ipcRenderer.invoke(IpcChannels.FS_READ_FILE, filePath),
    writeFile: (filePath: string, data: string) =>
      ipcRenderer.invoke(IpcChannels.FS_WRITE_FILE, filePath, data),
    listDir: (dirPath: string) =>
      ipcRenderer.invoke(IpcChannels.FS_LIST_DIR, dirPath),
  },

  // ─── Application ───────────────────────────────────────────────────────────
  app: {
    getVersion: () =>
      ipcRenderer.invoke(IpcChannels.APP_GET_VERSION),
    quit: () =>
      ipcRenderer.send(IpcChannels.APP_QUIT),
    minimize: () =>
      ipcRenderer.send(IpcChannels.APP_MINIMIZE),
    maximize: () =>
      ipcRenderer.send(IpcChannels.APP_MAXIMIZE),
    toggle: () =>
      ipcRenderer.send(IpcChannels.APP_TOGGLE),
    show: () =>
      ipcRenderer.send(IpcChannels.APP_SHOW),
  },
};

contextBridge.exposeInMainWorld("jarvisOS", jarvisOS);

export type JarvisOSAPI = typeof jarvisOS;
