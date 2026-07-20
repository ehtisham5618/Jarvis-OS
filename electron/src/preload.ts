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
    getMetrics:   () => ipcRenderer.invoke(IpcChannels.SYSTEM_GET_METRICS),
    getProcesses: () => ipcRenderer.invoke(IpcChannels.SYSTEM_GET_PROCESSES),
    getPowerStatus: () => ipcRenderer.invoke(IpcChannels.SYSTEM_POWER_STATUS),
  },

  // ─── File System ───────────────────────────────────────────────────────────
  fs: {
    readFile:  (filePath: string)                   => ipcRenderer.invoke(IpcChannels.FS_READ_FILE, filePath),
    writeFile: (filePath: string, data: string)     => ipcRenderer.invoke(IpcChannels.FS_WRITE_FILE, filePath, data),
    listDir:   (dirPath: string)                    => ipcRenderer.invoke(IpcChannels.FS_LIST_DIR, dirPath),
  },

  // ─── Shell ─────────────────────────────────────────────────────────────────
  shell: {
    exec: (command: string, args?: string[])        => ipcRenderer.invoke(IpcChannels.SHELL_EXEC, command, args),
    open: (pathOrUrl: string)                       => ipcRenderer.invoke(IpcChannels.SHELL_OPEN, pathOrUrl),
  },

  // ─── Clipboard ─────────────────────────────────────────────────────────────
  clipboard: {
    read:  ()                                       => ipcRenderer.invoke(IpcChannels.CLIPBOARD_READ),
    write: (text: string)                           => ipcRenderer.invoke(IpcChannels.CLIPBOARD_WRITE, text),
  },

  // ─── Notification ──────────────────────────────────────────────────────────
  notification: {
    show: (title: string, body: string, icon?: string) =>
      ipcRenderer.invoke(IpcChannels.NOTIFICATION_SHOW, { title, body, icon }),
  },

  // ─── Dialog ────────────────────────────────────────────────────────────────
  dialog: {
    openFile: (opts?: { title?: string; filters?: Array<{ name: string; extensions: string[] }>; multiSelections?: boolean }) =>
      ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_FILE, opts),
    openDir:  (opts?: { title?: string }) =>
      ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_DIR, opts),
    saveFile: (opts?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) =>
      ipcRenderer.invoke(IpcChannels.DIALOG_SAVE_FILE, opts),
  },

  // ─── Process ───────────────────────────────────────────────────────────────
  process: {
    kill:   (pid: number)   => ipcRenderer.invoke(IpcChannels.PROCESS_KILL, pid),
    getEnv: (key: string)   => ipcRenderer.invoke(IpcChannels.ENV_GET, key),
  },

  // ─── Application ───────────────────────────────────────────────────────────
  app: {
    getVersion: ()          => ipcRenderer.invoke(IpcChannels.APP_GET_VERSION),
    quit:       ()          => ipcRenderer.send(IpcChannels.APP_QUIT),
    minimize:   ()          => ipcRenderer.send(IpcChannels.APP_MINIMIZE),
    maximize:   ()          => ipcRenderer.send(IpcChannels.APP_MAXIMIZE),
    toggle:     ()          => ipcRenderer.send(IpcChannels.APP_TOGGLE),
    show:       ()          => ipcRenderer.send(IpcChannels.APP_SHOW),
  },
};

contextBridge.exposeInMainWorld("jarvisOS", jarvisOS);

export type JarvisOSAPI = typeof jarvisOS;
