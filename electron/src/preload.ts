import { contextBridge, ipcRenderer } from "electron";
import { IpcChannels } from "./ipc/channels";

// A failed native handler must not leave a renderer promise pending forever.
function invoke(
  ...args: Parameters<typeof ipcRenderer.invoke>
): ReturnType<typeof ipcRenderer.invoke> {
  const timeoutMs = args[0].startsWith("voice:") || args[0].startsWith("tts:") ? 120000 : 30000;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Service request timed out: ${args[0]}`)),
      timeoutMs,
    );
    ipcRenderer
      .invoke(...args)
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  });
}

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
    getMetrics: () => invoke(IpcChannels.SYSTEM_GET_METRICS),
    getProcesses: () => invoke(IpcChannels.SYSTEM_GET_PROCESSES),
    getPowerStatus: () => invoke(IpcChannels.SYSTEM_POWER_STATUS),
  },

  // ─── File System ───────────────────────────────────────────────────────────
  fs: {
    readFile: (filePath: string) => invoke(IpcChannels.FS_READ_FILE, filePath),
    writeFile: (filePath: string, data: string) =>
      invoke(IpcChannels.FS_WRITE_FILE, filePath, data),
    listDir: (dirPath: string) => invoke(IpcChannels.FS_LIST_DIR, dirPath),
  },

  // ─── Shell ─────────────────────────────────────────────────────────────────
  shell: {
    exec: (command: string, args?: string[]) => invoke(IpcChannels.SHELL_EXEC, command, args),
    open: (pathOrUrl: string) => invoke(IpcChannels.SHELL_OPEN, pathOrUrl),
  },

  // ─── Clipboard ─────────────────────────────────────────────────────────────
  clipboard: {
    read: () => invoke(IpcChannels.CLIPBOARD_READ),
    write: (text: string) => invoke(IpcChannels.CLIPBOARD_WRITE, text),
  },

  // ─── Notification ──────────────────────────────────────────────────────────
  notification: {
    show: (title: string, body: string, icon?: string) =>
      invoke(IpcChannels.NOTIFICATION_SHOW, { title, body, icon }),
  },

  // ─── Dialog ────────────────────────────────────────────────────────────────
  dialog: {
    openFile: (opts?: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      multiSelections?: boolean;
    }) => invoke(IpcChannels.DIALOG_OPEN_FILE, opts),
    openDir: (opts?: { title?: string }) => invoke(IpcChannels.DIALOG_OPEN_DIR, opts),
    saveFile: (opts?: {
      title?: string;
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => invoke(IpcChannels.DIALOG_SAVE_FILE, opts),
  },

  // ─── Process ───────────────────────────────────────────────────────────────
  process: {
    kill: (pid: number) => invoke(IpcChannels.PROCESS_KILL, pid),
    getEnv: (key: string) => invoke(IpcChannels.ENV_GET, key),
  },

  // ─── Memory (M5) ───────────────────────────────────────────────────────────
  memory: {
    store: (entry: any) => invoke(IpcChannels.MEMORY_STORE, entry),
    search: (queryVector: number[], topK?: number) =>
      invoke(IpcChannels.MEMORY_SEARCH, queryVector, topK),
    list: (limit?: number) => invoke(IpcChannels.MEMORY_LIST, limit),
    delete: (id: string) => invoke(IpcChannels.MEMORY_DELETE, id),
    clear: () => invoke(IpcChannels.MEMORY_CLEAR),
  },

  // ─── Voice (STT) ───────────────────────────────────────────────────────────
  voice: {
    startRecording: () => invoke(IpcChannels.VOICE_START_RECORDING),
    stopRecording: () => invoke(IpcChannels.VOICE_STOP_RECORDING),
    transcribe: (pcmData: Uint8Array) => invoke(IpcChannels.VOICE_TRANSCRIBE, pcmData),
    listDevices: () => invoke(IpcChannels.VOICE_LIST_DEVICES),
    setDevice: (deviceId: string) => invoke(IpcChannels.VOICE_SET_DEVICE, deviceId),
    onHotkeyToggle: (callback: () => void) => {
      ipcRenderer.on("voice:hotkey-toggle", callback);
      return () => {
        ipcRenderer.removeListener("voice:hotkey-toggle", callback);
      };
    },
  },

  // ─── Voice Output (TTS) ────────────────────────────────────────────────────
  tts: {
    speak: (text: string) => invoke(IpcChannels.TTS_SPEAK, text),
    stop: () => invoke(IpcChannels.TTS_STOP),
    listVoices: () => invoke(IpcChannels.TTS_LIST_VOICES),
    setVoice: (voiceId: string) => invoke(IpcChannels.TTS_SET_VOICE, voiceId),
  },

  // ─── Vision (Screen Capture + OCR) ─────────────────────────────────────────
  vision: {
    screenshot: () => invoke(IpcChannels.VISION_SCREENSHOT),
    ocr: (imageBuffer: Uint8Array) => invoke(IpcChannels.VISION_OCR, imageBuffer),
    analyze: (imageBuffer: Uint8Array, prompt: string) =>
      invoke(IpcChannels.VISION_ANALYZE, imageBuffer, prompt),
  },

  // ─── Application ───────────────────────────────────────────────────────────
  app: {
    retryStartup: () => invoke("app:retry-startup"),
    openLogs: () => invoke("app:open-logs"),
    rendererReady: () => ipcRenderer.send("app:renderer-ready"),
    getVersion: () => invoke(IpcChannels.APP_GET_VERSION),
    quit: () => ipcRenderer.send(IpcChannels.APP_QUIT),
    minimize: () => ipcRenderer.send(IpcChannels.APP_MINIMIZE),
    maximize: () => ipcRenderer.send(IpcChannels.APP_MAXIMIZE),
    toggle: () => ipcRenderer.send(IpcChannels.APP_TOGGLE),
    show: () => ipcRenderer.send(IpcChannels.APP_SHOW),
  },

  // ─── Automation (M8) ───────────────────────────────────────────────────────
  automation: {
    list: () => invoke(IpcChannels.AUTOMATION_LIST),
    create: (a: any) => invoke(IpcChannels.AUTOMATION_CREATE, a),
    update: (id: string, p: any) => invoke(IpcChannels.AUTOMATION_UPDATE, id, p),
    delete: (id: string) => invoke(IpcChannels.AUTOMATION_DELETE, id),
    run: (id: string) => invoke(IpcChannels.AUTOMATION_RUN, id),
    toggle: (id: string, enabled: boolean) => invoke(IpcChannels.AUTOMATION_TOGGLE, id, enabled),
  },

  // ─── Plugins (M9) ──────────────────────────────────────────────────────────
  plugins: {
    list: () => invoke(IpcChannels.PLUGIN_LIST),
    install: (source: string) => invoke(IpcChannels.PLUGIN_INSTALL, source),
    uninstall: (id: string) => invoke(IpcChannels.PLUGIN_UNINSTALL, id),
    enable: (id: string) => invoke(IpcChannels.PLUGIN_ENABLE, id),
    disable: (id: string) => invoke(IpcChannels.PLUGIN_DISABLE, id),
    call: (id: string, method: string, args: any[]) =>
      invoke(IpcChannels.PLUGIN_CALL, id, method, args),
  },

  // ─── Auth (M10) ────────────────────────────────────────────────────────────
  auth: {
    lock: () => invoke(IpcChannels.AUTH_LOCK),
    unlockPin: (pin: string) => invoke(IpcChannels.AUTH_UNLOCK_PIN, pin),
    unlockHello: () => invoke(IpcChannels.AUTH_UNLOCK_HELLO),
    setPin: (hash: string) => invoke(IpcChannels.AUTH_SET_PIN, hash),
    status: () => invoke(IpcChannels.AUTH_STATUS),
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
    log: (entry: any) => invoke(IpcChannels.AUDIT_LOG, entry),
    query: (filters: any) => invoke(IpcChannels.AUDIT_QUERY, filters),
    clear: () => invoke(IpcChannels.AUDIT_CLEAR),
    export: () => invoke(IpcChannels.AUDIT_EXPORT),
  },

  // ─── Auto-Update (M12) ──────────────────────────────────────────────────────
  update: {
    check: () => invoke(IpcChannels.UPDATE_CHECK),
    download: () => invoke(IpcChannels.UPDATE_DOWNLOAD),
    install: () => invoke(IpcChannels.UPDATE_INSTALL),
    onAvailable: (cb: (info: any) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, info: unknown) => cb(info);
      ipcRenderer.on("update:available", listener);
      return () => ipcRenderer.removeListener("update:available", listener);
    },
    onProgress: (cb: (p: any) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, p: unknown) => cb(p);
      ipcRenderer.on("update:download-progress", listener);
      return () => ipcRenderer.removeListener("update:download-progress", listener);
    },
    onDownloaded: (cb: (info: any) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, info: unknown) => cb(info);
      ipcRenderer.on("update:downloaded", listener);
      return () => ipcRenderer.removeListener("update:downloaded", listener);
    },
  },
};

contextBridge.exposeInMainWorld("jarvisOS", jarvisOS);

export type JarvisOSAPI = typeof jarvisOS;
