/**
 * dialog.ipc.ts — Native OS File/Folder/Save Dialogs
 */

import { ipcMain, dialog, BrowserWindow } from "electron";
import { IpcChannels } from "./channels";

export function registerDialogHandlers(): void {
  // ─── DIALOG_OPEN_FILE ────────────────────────────────────────────────────
  ipcMain.handle(
    IpcChannels.DIALOG_OPEN_FILE,
    async (_evt, opts: { title?: string; filters?: Electron.FileFilter[]; multiSelections?: boolean }) => {
      const win = BrowserWindow.getFocusedWindow();
      const result = await dialog.showOpenDialog(win!, {
        title: opts?.title ?? "Select File",
        properties: [
          "openFile",
          ...(opts?.multiSelections ? (["multiSelections"] as const) : []),
        ],
        filters: opts?.filters ?? [{ name: "All Files", extensions: ["*"] }],
      });
      return result.canceled ? null : result.filePaths;
    }
  );

  // ─── DIALOG_OPEN_DIR ─────────────────────────────────────────────────────
  ipcMain.handle(
    IpcChannels.DIALOG_OPEN_DIR,
    async (_evt, opts: { title?: string } = {}) => {
      const win = BrowserWindow.getFocusedWindow();
      const result = await dialog.showOpenDialog(win!, {
        title: opts?.title ?? "Select Folder",
        properties: ["openDirectory"],
      });
      return result.canceled ? null : result.filePaths[0];
    }
  );

  // ─── DIALOG_SAVE_FILE ────────────────────────────────────────────────────
  ipcMain.handle(
    IpcChannels.DIALOG_SAVE_FILE,
    async (_evt, opts: { title?: string; defaultPath?: string; filters?: Electron.FileFilter[] } = {}) => {
      const win = BrowserWindow.getFocusedWindow();
      const result = await dialog.showSaveDialog(win!, {
        title: opts?.title ?? "Save File",
        defaultPath: opts?.defaultPath,
        filters: opts?.filters ?? [{ name: "All Files", extensions: ["*"] }],
      });
      return result.canceled ? null : result.filePath;
    }
  );
}
