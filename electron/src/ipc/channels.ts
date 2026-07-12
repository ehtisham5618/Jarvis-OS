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

  // ─── File System ─────────────────────────────────────
  FS_READ_FILE:          "fs:read-file",
  FS_WRITE_FILE:         "fs:write-file",
  FS_LIST_DIR:           "fs:list-dir",

  // ─── Application ─────────────────────────────────────
  APP_GET_VERSION:       "app:get-version",
  APP_QUIT:              "app:quit",
  APP_MINIMIZE:          "app:minimize",
  APP_MAXIMIZE:          "app:maximize",
  APP_TOGGLE:            "app:toggle",
  APP_SHOW:              "app:show",

  // ─── Tray ─────────────────────────────────────────────
  TRAY_UPDATE_TOOLTIP:   "tray:update-tooltip",
} as const;

export type IpcChannelName = typeof IpcChannels[keyof typeof IpcChannels];
