import { registerSystemHandlers } from "./system.ipc";
import { registerFsHandlers } from "./fs.ipc";
import { registerShellHandlers } from "./shell.ipc";
import { registerClipboardHandlers } from "./clipboard.ipc";
import { registerNotificationHandlers } from "./notification.ipc";
import { registerDialogHandlers } from "./dialog.ipc";
import { registerProcessHandlers } from "./process.ipc";
import { registerMemoryHandlers } from "./memory.ipc";
import { registerVoiceHandlers } from "./voice.ipc";
import { registerTtsHandlers } from "./tts.ipc";
import { registerVisionHandlers } from "./vision.ipc";
import { registerAutomationHandlers } from "../automation/AutomationEngine";
import { registerPluginHandlers } from "../plugins/PluginLoader";
import { registerAuthHandlers } from "../auth/AuthService";
import { registerAuditHandlers } from "../auth/AuditService";
import log from "electron-log";

let criticalRegistered = false;
let deferredRegistered = false;

/**
 * Register critical IPC handlers needed immediately for startup.
 */
export function registerCriticalHandlers(): void {
  if (criticalRegistered) return;
  criticalRegistered = true;
  registerSystemHandlers();
  registerFsHandlers();
  registerShellHandlers();
  registerAuthHandlers();
  registerAuditHandlers();
}

/**
 * Register non-critical IPC handlers after the window is shown.
 */
export function registerDeferredHandlers(): void {
  if (deferredRegistered) return;
  deferredRegistered = true;
  for (const register of [
    registerClipboardHandlers,
    registerNotificationHandlers,
    registerDialogHandlers,
    registerProcessHandlers,
    registerMemoryHandlers,
    registerVoiceHandlers,
    registerTtsHandlers,
    registerVisionHandlers,
    registerAutomationHandlers,
    registerPluginHandlers,
  ]) {
    try {
      register();
    } catch (error) {
      log.error(`[ipc] ${register.name} unavailable`, error);
    }
  }
}
