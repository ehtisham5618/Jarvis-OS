import { registerSystemHandlers } from "./system.ipc";
import { registerFsHandlers } from "./fs.ipc";

/**
 * Register all IPC handlers in one place.
 * Called once from main.ts after the app is ready.
 */
export function registerAllHandlers(): void {
  registerSystemHandlers();
  registerFsHandlers();
}
