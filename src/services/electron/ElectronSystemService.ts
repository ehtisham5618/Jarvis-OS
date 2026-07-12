import type { ISystemService, SystemMetrics, ProcessInfo } from "@/services/interfaces/ISystemService";

/**
 * Electron System Service (Renderer Side)
 *
 * Thin wrapper around `window.jarvisOS.system` IPC calls.
 * Implements ISystemService with real OS data coming through the contextBridge.
 * Falls back to last known metrics if IPC fails.
 */
export class ElectronSystemService implements ISystemService {
  readonly implementationName = "Electron (Windows Native)";

  private lastKnownMetrics: SystemMetrics | null = null;

  async getMetrics(): Promise<SystemMetrics> {
    try {
      const raw = await window.jarvisOS.system.getMetrics();
      this.lastKnownMetrics = raw as SystemMetrics;
      return this.lastKnownMetrics;
    } catch (err) {
      console.error("[ElectronSystemService] getMetrics failed:", err);
      if (this.lastKnownMetrics) return this.lastKnownMetrics;
      throw err;
    }
  }

  async getProcesses(): Promise<ProcessInfo[]> {
    try {
      const raw = await window.jarvisOS.system.getProcesses();
      return raw as ProcessInfo[];
    } catch (err) {
      console.error("[ElectronSystemService] getProcesses failed:", err);
      return [];
    }
  }

  isElectron(): boolean {
    return true;
  }
}
