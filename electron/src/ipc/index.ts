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
  registerMemoryHandlers();
  registerVoiceHandlers();
  registerTtsHandlers();
  registerVisionHandlers();
  registerAutomationHandlers();
  registerPluginHandlers();
  registerAuthHandlers();
  registerAuditHandlers();
}
