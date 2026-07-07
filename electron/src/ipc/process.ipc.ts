/**
 * process.ipc.ts — Process Kill Handler
 *
 * SECURITY: Only non-system processes (PID > 4 on Windows) may be killed.
 * Kills are sent as SIGTERM first.
 */

import { ipcMain } from "electron";
import { IpcChannels } from "./channels";

// Windows reserved PIDs — never allow killing these
const PROTECTED_PIDS = new Set([0, 1, 2, 3, 4]);

export function registerProcessHandlers(): void {
  ipcMain.handle(IpcChannels.PROCESS_KILL, async (_evt, pid: number) => {
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error(`INVALID_PID: "${pid}" is not a valid process ID.`);
    }
    if (PROTECTED_PIDS.has(pid)) {
      throw new Error(`PROTECTED_PID: Process ${pid} is a protected system process.`);
    }
    if (pid === process.pid) {
      throw new Error("PROTECTED_PID: Cannot kill the Jarvis main process.");
    }

    try {
      process.kill(pid, "SIGTERM");
    } catch (err: any) {
      throw new Error(`KILL_FAILED: ${err.message}`);
    }
  });

  ipcMain.handle(IpcChannels.ENV_GET, async (_evt, key: string) => {
    // Allowlist of readable env vars
    const ALLOWED_ENV_KEYS = new Set([
      "USERPROFILE",
      "USERNAME",
      "HOME",
      "APPDATA",
      "LOCALAPPDATA",
      "TEMP",
      "TMP",
      "COMPUTERNAME",
      "OS",
      "PROCESSOR_ARCHITECTURE",
      "NUMBER_OF_PROCESSORS",
      "SYSTEMDRIVE",
      "WINDIR",
      "PATH",
      "NODE_ENV",
      "NODE_VERSION",
    ]);
    if (!ALLOWED_ENV_KEYS.has(key.toUpperCase())) {
      throw new Error(
        `ENV_ACCESS_DENIED: "${key}" is not on the readable environment variable allowlist.`,
      );
    }
    return process.env[key] ?? null;
  });
}
