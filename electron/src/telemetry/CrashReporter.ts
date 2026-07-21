/**
 * CrashReporter.ts (M12)
 *
 * Sets up Electron's built-in crash reporter and hooks renderer-side
 * unhandled errors into electron-log for diagnostics.
 */

import { crashReporter, app } from "electron";
import log from "electron-log";

export function initCrashReporter(): void {
  try {
    crashReporter.start({
      submitURL: "https://submit.backtrace.io/jarvis-os/crash",
      uploadToServer: false, // Disabled by default — privacy-first
      ignoreSystemCrashHandler: false,
      extra: {
        "jarvis-version": app.getVersion(),
        "os-platform": process.platform,
        "os-arch": process.arch,
        "electron-version": process.versions.electron,
        "node-version": process.versions.node,
      },
    });
    log.info("[crash-reporter] Crash reporter initialized (upload disabled by default).");
  } catch (err) {
    log.warn("[crash-reporter] Failed to initialize crash reporter:", err);
  }
}
