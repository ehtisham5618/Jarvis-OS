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
    getMetrics: () => ipcRenderer.invoke(IpcChannels.SYSTEM_GET_METRICS),
    getProcesses: () => ipcRenderer.invoke(IpcChannels.SYSTEM_GET_PROCESSES),
    getPowerStatus: () => ipcRenderer.invoke(IpcChannels.SYSTEM_POWER_STATUS),
  },

  // ─── File System ───────────────────────────────────────────────────────────
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke(IpcChannels.FS_READ_FILE, filePath),
    writeFile: (filePath: string, data: string) =>
      ipcRenderer.invoke(IpcChannels.FS_WRITE_FILE, filePath, data),
    listDir: (dirPath: string) => ipcRenderer.invoke(IpcChannels.FS_LIST_DIR, dirPath),
  },

  // ─── Shell ─────────────────────────────────────────────────────────────────
  shell: {
    exec: (command: string, args?: string[]) =>
      ipcRenderer.invoke(IpcChannels.SHELL_EXEC, command, args),
    open: (pathOrUrl: string) => ipcRenderer.invoke(IpcChannels.SHELL_OPEN, pathOrUrl),
  },

  // ─── Clipboard ─────────────────────────────────────────────────────────────
  clipboard: {
    read: () => ipcRenderer.invoke(IpcChannels.CLIPBOARD_READ),
    write: (text: string) => ipcRenderer.invoke(IpcChannels.CLIPBOARD_WRITE, text),
  },

  // ─── Notification ──────────────────────────────────────────────────────────
  notification: {
    show: (title: string, body: string, icon?: string) =>
      ipcRenderer.invoke(IpcChannels.NOTIFICATION_SHOW, { title, body, icon }),
  },

  // ─── Dialog ────────────────────────────────────────────────────────────────
  dialog: {
    openFile: (opts?: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      multiSelections?: boolean;
    }) => ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_FILE, opts),
    openDir: (opts?: { title?: string }) => ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_DIR, opts),
    saveFile: (opts?: {
      title?: string;
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => ipcRenderer.invoke(IpcChannels.DIALOG_SAVE_FILE, opts),
  },

  // ─── Process ───────────────────────────────────────────────────────────────
  process: {
    kill: (pid: number) => ipcRenderer.invoke(IpcChannels.PROCESS_KILL, pid),
    getEnv: (key: string) => ipcRenderer.invoke(IpcChannels.ENV_GET, key),
  },

  // ─── Memory (M5) ───────────────────────────────────────────────────────────
  memory: {
    store: (entry: any) => ipcRenderer.invoke(IpcChannels.MEMORY_STORE, entry),
    search: (queryVector: number[], topK?: number) =>
      ipcRenderer.invoke(IpcChannels.MEMORY_SEARCH, queryVector, topK),
    list: (limit?: number) => ipcRenderer.invoke(IpcChannels.MEMORY_LIST, limit),
    delete: (id: string) => ipcRenderer.invoke(IpcChannels.MEMORY_DELETE, id),
    clear: () => ipcRenderer.invoke(IpcChannels.MEMORY_CLEAR),
  },

  // ─── Voice (STT) ───────────────────────────────────────────────────────────
  voice: {
    startRecording: () => ipcRenderer.invoke(IpcChannels.VOICE_START_RECORDING),
    stopRecording: () => ipcRenderer.invoke(IpcChannels.VOICE_STOP_RECORDING),
    transcribe: (pcmData: Uint8Array) => ipcRenderer.invoke(IpcChannels.VOICE_TRANSCRIBE, pcmData),
    listDevices: () => ipcRenderer.invoke(IpcChannels.VOICE_LIST_DEVICES),
    setDevice: (deviceId: string) => ipcRenderer.invoke(IpcChannels.VOICE_SET_DEVICE, deviceId),
    onHotkeyToggle: (callback: () => void) => {
      ipcRenderer.on("voice:hotkey-toggle", callback);
      return () => {
        ipcRenderer.removeListener("voice:hotkey-toggle", callback);
      };
    },
  },

  // ─── Voice Output (TTS) ────────────────────────────────────────────────────
  tts: {
    speak: (text: string) => ipcRenderer.invoke(IpcChannels.TTS_SPEAK, text),
    stop: () => ipcRenderer.invoke(IpcChannels.TTS_STOP),
    listVoices: () => ipcRenderer.invoke(IpcChannels.TTS_LIST_VOICES),
    setVoice: (voiceId: string) => ipcRenderer.invoke(IpcChannels.TTS_SET_VOICE, voiceId),
  },

  // ─── Vision (Screen Capture + OCR) ─────────────────────────────────────────
  vision: {
    screenshot: () => ipcRenderer.invoke(IpcChannels.VISION_SCREENSHOT),
    ocr: (imageBuffer: Uint8Array) => ipcRenderer.invoke(IpcChannels.VISION_OCR, imageBuffer),
    analyze: (imageBuffer: Uint8Array, prompt: string) =>
      ipcRenderer.invoke(IpcChannels.VISION_ANALYZE, imageBuffer, prompt),
  },

  // ─── Application ───────────────────────────────────────────────────────────
  app: {
    getVersion: () => ipcRenderer.invoke(IpcChannels.APP_GET_VERSION),
    quit: () => ipcRenderer.send(IpcChannels.APP_QUIT),
    minimize: () => ipcRenderer.send(IpcChannels.APP_MINIMIZE),
    maximize: () => ipcRenderer.send(IpcChannels.APP_MAXIMIZE),
    toggle: () => ipcRenderer.send(IpcChannels.APP_TOGGLE),
    show: () => ipcRenderer.send(IpcChannels.APP_SHOW),
  },

  // ─── Automation (M8) ───────────────────────────────────────────────────────
  automation: {
    list: () => ipcRenderer.invoke(IpcChannels.AUTOMATION_LIST),
    create: (a: any) => ipcRenderer.invoke(IpcChannels.AUTOMATION_CREATE, a),
    update: (id: string, p: any) => ipcRenderer.invoke(IpcChannels.AUTOMATION_UPDATE, id, p),
    delete: (id: string) => ipcRenderer.invoke(IpcChannels.AUTOMATION_DELETE, id),
    run: (id: string) => ipcRenderer.invoke(IpcChannels.AUTOMATION_RUN, id),
    toggle: (id: string, enabled: boolean) =>
      ipcRenderer.invoke(IpcChannels.AUTOMATION_TOGGLE, id, enabled),
  },

  // ─── Plugins (M9) ──────────────────────────────────────────────────────────
  plugins: {
    list: () => ipcRenderer.invoke(IpcChannels.PLUGIN_LIST),
    install: (source: string) => ipcRenderer.invoke(IpcChannels.PLUGIN_INSTALL, source),
    uninstall: (id: string) => ipcRenderer.invoke(IpcChannels.PLUGIN_UNINSTALL, id),
    enable: (id: string) => ipcRenderer.invoke(IpcChannels.PLUGIN_ENABLE, id),
    disable: (id: string) => ipcRenderer.invoke(IpcChannels.PLUGIN_DISABLE, id),
    call: (id: string, method: string, args: any[]) =>
      ipcRenderer.invoke(IpcChannels.PLUGIN_CALL, id, method, args),
  },

  // ─── Auth (M10) ────────────────────────────────────────────────────────────
  auth: {
    lock: () => ipcRenderer.invoke(IpcChannels.AUTH_LOCK),
    unlockPin: (pin: string) => ipcRenderer.invoke(IpcChannels.AUTH_UNLOCK_PIN, pin),
    unlockHello: () => ipcRenderer.invoke(IpcChannels.AUTH_UNLOCK_HELLO),
    setPin: (hash: string) => ipcRenderer.invoke(IpcChannels.AUTH_SET_PIN, hash),
    status: () => ipcRenderer.invoke(IpcChannels.AUTH_STATUS),
    onLocked: (cb: () => void) => {
      ipcRenderer.on("auth:locked", cb);
      return () => ipcRenderer.removeListener("auth:locked", cb);
    },
    onUnlocked: (cb: () => void) => {
      ipcRenderer.on("auth:unlocked", cb);
      return () => ipcRenderer.removeListener("auth:unlocked", cb);
    },
  },

  // ─── Audit (M10) ───────────────────────────────────────────────────────────
  audit: {
    log: (entry: any) => ipcRenderer.invoke(IpcChannels.AUDIT_LOG, entry),
    query: (filters: any) => ipcRenderer.invoke(IpcChannels.AUDIT_QUERY, filters),
    clear: () => ipcRenderer.invoke(IpcChannels.AUDIT_CLEAR),
    export: () => ipcRenderer.invoke(IpcChannels.AUDIT_EXPORT),
  },

  // ─── Auto-Update (M12) ──────────────────────────────────────────────────────
  update: {
    check: () => ipcRenderer.invoke(IpcChannels.UPDATE_CHECK),
    download: () => ipcRenderer.invoke(IpcChannels.UPDATE_DOWNLOAD),
    install: () => ipcRenderer.invoke(IpcChannels.UPDATE_INSTALL),
    onAvailable: (cb: (info: any) => void) => {
      ipcRenderer.on("update:available", (_e, info) => cb(info));
      return () => ipcRenderer.removeAllListeners("update:available");
    },
    onProgress: (cb: (p: any) => void) => {
      ipcRenderer.on("update:download-progress", (_e, p) => cb(p));
      return () => ipcRenderer.removeAllListeners("update:download-progress");
    },
    onDownloaded: (cb: (info: any) => void) => {
      ipcRenderer.on("update:downloaded", (_e, info) => cb(info));
      return () => ipcRenderer.removeAllListeners("update:downloaded");
    },
  },
};

contextBridge.exposeInMainWorld("jarvisOS", jarvisOS);

export type JarvisOSAPI = typeof jarvisOS;
