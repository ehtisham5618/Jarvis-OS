/**
 * clipboard.ipc.ts — Clipboard Read/Write Handlers
 */

import { ipcMain, clipboard } from "electron";
import { IpcChannels } from "./channels";

export function registerClipboardHandlers(): void {
  ipcMain.handle(IpcChannels.CLIPBOARD_READ, async () => {
    return clipboard.readText();
  });

  ipcMain.handle(IpcChannels.CLIPBOARD_WRITE, async (_evt, text: string) => {
    clipboard.writeText(text);
  });
}
