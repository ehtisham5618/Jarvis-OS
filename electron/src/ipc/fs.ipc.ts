import { ipcMain, app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { IpcChannels } from "./channels";

/**
 * File System IPC Handlers
 *
 * Strictly sandboxed — all paths must resolve inside the user's home directory.
 * Path traversal attempts are rejected with a typed error.
 */

const ALLOWED_ROOT = app.getPath("home");

function assertSafePath(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(ALLOWED_ROOT)) {
    throw new Error(
      `[fs.ipc] Path traversal blocked: "${resolved}" is outside allowed root "${ALLOWED_ROOT}"`
    );
  }
  return resolved;
}

export function registerFsHandlers(): void {
  ipcMain.handle(IpcChannels.FS_READ_FILE, async (_event, filePath: string) => {
    const safe = assertSafePath(filePath);
    return await fs.readFile(safe, "utf-8");
  });

  ipcMain.handle(
    IpcChannels.FS_WRITE_FILE,
    async (_event, filePath: string, data: string) => {
      const safe = assertSafePath(filePath);
      // Ensure parent directory exists
      await fs.mkdir(path.dirname(safe), { recursive: true });
      await fs.writeFile(safe, data, "utf-8");
    }
  );

  ipcMain.handle(IpcChannels.FS_LIST_DIR, async (_event, dirPath: string) => {
    const safe = assertSafePath(dirPath);
    const entries = await fs.readdir(safe, { withFileTypes: true });
    return entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      path: path.join(safe, e.name),
    }));
  });
}
