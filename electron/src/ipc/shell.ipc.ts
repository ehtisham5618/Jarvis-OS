/**
 * shell.ipc.ts — Shell Execution & Open Handlers
 *
 * SECURITY: Only commands from the ALLOWED_COMMANDS allowlist may be executed.
 * Any other command is rejected with a COMMAND_NOT_ALLOWED error.
 */

import { ipcMain, shell } from "electron";
import { execFile } from "child_process";
import { promisify } from "util";
import { IpcChannels } from "./channels";

const execFileAsync = promisify(execFile);

const ALLOWED_COMMANDS = new Set([
  "git", "node", "npm", "npx", "yarn", "pnpm",
  "python", "python3", "pip", "pip3",
  "cargo", "rustc",
  "code", "code-insiders",
  "echo", "where", "which",
]);

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function registerShellHandlers(): void {
  // ─── SHELL_EXEC ─────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.SHELL_EXEC, async (_evt, command: string, args: string[] = []) => {
    // Allowlist check
    const baseCmd = command.split("/").pop()?.split("\\").pop() ?? command;
    if (!ALLOWED_COMMANDS.has(baseCmd.toLowerCase())) {
      throw new Error(`COMMAND_NOT_ALLOWED: "${command}" is not on the Jarvis allowlist.`);
    }

    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        timeout: 30_000,
        maxBuffer: 5 * 1024 * 1024, // 5 MB
        windowsHide: true,
      });
      return { stdout, stderr, exitCode: 0 } as ShellResult;
    } catch (err: any) {
      return {
        stdout: err.stdout ?? "",
        stderr: err.stderr ?? String(err.message),
        exitCode: err.code ?? 1,
      } as ShellResult;
    }
  });

  // ─── SHELL_OPEN ─────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.SHELL_OPEN, async (_evt, pathOrUrl: string) => {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      await shell.openExternal(pathOrUrl);
    } else {
      const error = await shell.openPath(pathOrUrl);
      if (error) throw new Error(error);
    }
  });
}
