/**
 * notification.ipc.ts — Native Windows Notification Handler
 *
 * Shows a native OS notification. Clicking it brings the main window to focus.
 */

import { ipcMain, Notification, BrowserWindow } from "electron";
import { IpcChannels } from "./channels";
import path from "path";

export function registerNotificationHandlers(): void {
  ipcMain.handle(
    IpcChannels.NOTIFICATION_SHOW,
    async (_evt, opts: { title: string; body: string; icon?: string }) => {
      if (!Notification.isSupported()) {
        console.warn("[Jarvis] Native notifications are not supported on this platform.");
        return;
      }

      const notification = new Notification({
        title: opts.title,
        body: opts.body,
        // Use a bundled icon if provided path not given
        icon: opts.icon ?? path.join(__dirname, "../../public/icon.png"),
      });

      notification.on("click", () => {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          if (win.isMinimized()) win.restore();
          win.focus();
        }
      });

      notification.show();
    }
  );
}
