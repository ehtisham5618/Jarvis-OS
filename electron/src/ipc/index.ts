import { registerSystemHandlers } from "./system.ipc";
import { registerFsHandlers } from "./fs.ipc";
import { registerShellHandlers } from "./shell.ipc";
import { registerClipboardHandlers } from "./clipboard.ipc";
import { registerNotificationHandlers } from "./notification.ipc";
import { registerDialogHandlers } from "./dialog.ipc";
import { registerProcessHandlers } from "./process.ipc";

/**
 * Register all IPC handlers in one place.
 * Called once from main.ts after the app is ready.
 */
export function registerAllHandlers(): void {
  registerSystemHandlers();
  registerFsHandlers();
  registerShellHandlers();
  registerClipboardHandlers();
  registerNotificationHandlers();
  registerDialogHandlers();
  registerProcessHandlers();
}
