/**
 * Jarvis IPC Channel Definitions
 *
 * All IPC channel names are defined here as typed constants.
 * Never use raw strings for channel names anywhere else in the codebase.
 * Import from here for both main and preload.
 */

export const IpcChannels = {
  // ─── System ──────────────────────────────────────────
  SYSTEM_GET_METRICS:    "system:get-metrics",
  SYSTEM_GET_PROCESSES:  "system:get-processes",
  SYSTEM_POWER_STATUS:   "system:power-status",

  // ─── File System ─────────────────────────────────────
  FS_READ_FILE:          "fs:read-file",
  FS_WRITE_FILE:         "fs:write-file",
  FS_LIST_DIR:           "fs:list-dir",

  // ─── Shell ────────────────────────────────────────────
  SHELL_EXEC:            "shell:exec",
  SHELL_OPEN:            "shell:open",

  // ─── Clipboard ───────────────────────────────────────
  CLIPBOARD_READ:        "clipboard:read",
  CLIPBOARD_WRITE:       "clipboard:write",

  // ─── Notifications ───────────────────────────────────
  NOTIFICATION_SHOW:     "notification:show",

  // ─── Dialog ──────────────────────────────────────────
  DIALOG_OPEN_FILE:      "dialog:open-file",
  DIALOG_OPEN_DIR:       "dialog:open-dir",
  DIALOG_SAVE_FILE:      "dialog:save-file",

  // ─── Process ─────────────────────────────────────────
  PROCESS_KILL:          "process:kill",

  // ─── Env ─────────────────────────────────────────────
  ENV_GET:               "env:get",

  // ─── Memory (M5) ─────────────────────────────────────
  MEMORY_STORE:          "memory:store",
  MEMORY_SEARCH:         "memory:search",
  MEMORY_LIST:           "memory:list",
  MEMORY_DELETE:         "memory:delete",
  MEMORY_CLEAR:          "memory:clear",

  // ─── Voice (STT) ─────────────────────────────────────
  VOICE_START_RECORDING: "voice:start-recording",
  VOICE_STOP_RECORDING:  "voice:stop-recording",
  VOICE_TRANSCRIBE:      "voice:transcribe",
  VOICE_LIST_DEVICES:    "voice:list-devices",
  VOICE_SET_DEVICE:      "voice:set-device",

  // ─── Voice Output (TTS) ──────────────────────────────
  TTS_SPEAK:             "tts:speak",
  TTS_STOP:              "tts:stop",
  TTS_LIST_VOICES:       "tts:list-voices",
  TTS_SET_VOICE:         "tts:set-voice",

  // ─── Vision (Screen Capture + OCR) ───────────────────
  VISION_SCREENSHOT:     "vision:screenshot",
  VISION_OCR:            "vision:ocr",
  VISION_ANALYZE:        "vision:analyze",

  // ─── Application ─────────────────────────────────────
  APP_GET_VERSION:       "app:get-version",
  APP_QUIT:              "app:quit",
  APP_MINIMIZE:          "app:minimize",
  APP_MAXIMIZE:          "app:maximize",
  APP_TOGGLE:            "app:toggle",
  APP_SHOW:              "app:show",

  // ─── Automation (M8) ─────────────────────────────────
  AUTOMATION_LIST:       "automation:list",
  AUTOMATION_CREATE:     "automation:create",
  AUTOMATION_UPDATE:     "automation:update",
  AUTOMATION_DELETE:     "automation:delete",
  AUTOMATION_RUN:        "automation:run",
  AUTOMATION_TOGGLE:     "automation:toggle",

  // ─── Plugins (M9) ────────────────────────────────────
  PLUGIN_LIST:           "plugin:list",
  PLUGIN_INSTALL:        "plugin:install",
  PLUGIN_UNINSTALL:      "plugin:uninstall",
  PLUGIN_ENABLE:         "plugin:enable",
  PLUGIN_DISABLE:        "plugin:disable",
  PLUGIN_CALL:           "plugin:call",

  // ─── Auth (M10) ───────────────────────────────────────
  AUTH_LOCK:             "auth:lock",
  AUTH_UNLOCK_PIN:       "auth:unlock-pin",
  AUTH_UNLOCK_HELLO:     "auth:unlock-hello",
  AUTH_SET_PIN:          "auth:set-pin",
  AUTH_STATUS:           "auth:status",

  // ─── Audit (M10) ──────────────────────────────────────
  AUDIT_LOG:             "audit:log",
  AUDIT_QUERY:           "audit:query",
  AUDIT_CLEAR:           "audit:clear",
  AUDIT_EXPORT:          "audit:export",

  // ─── Tray ─────────────────────────────────────────────
  TRAY_UPDATE_TOOLTIP:   "tray:update-tooltip",
} as const;

export type IpcChannelName = typeof IpcChannels[keyof typeof IpcChannels];
