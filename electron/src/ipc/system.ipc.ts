import { ipcMain } from "electron";
import si from "systeminformation";
import { IpcChannels } from "./channels";

/**
 * System IPC Handlers
 *
 * Collects real hardware data from the OS using `systeminformation`
 * and returns it to the renderer via typed IPC channels.
 */

export function registerSystemHandlers(): void {
  // ─── Get Full System Metrics ──────────────────────────────────────────────
  ipcMain.handle(IpcChannels.SYSTEM_GET_METRICS, async () => {
    try {
      const [
        cpuLoad,
        cpuInfo,
        cpuTemp,
        memInfo,
        graphics,
        battery,
        networkStats,
        fsSize,
      ] = await Promise.all([
        si.currentLoad(),
        si.cpu(),
        si.cpuTemperature(),
        si.mem(),
        si.graphics(),
        si.battery(),
        si.networkStats(),
        si.fsSize(),
      ]);

      const gpuController = graphics.controllers?.[0];
      const primaryNetwork = networkStats?.[0];
      const primaryFs = fsSize?.[0];

      const metrics = {
        timestamp: new Date().toISOString(),

        cpu: {
          usagePercent: Math.round(cpuLoad.currentLoad ?? 0),
          coreCount: cpuInfo.physicalCores ?? cpuInfo.cores ?? 4,
          frequency: parseFloat(((cpuInfo.speed ?? 0) / 1000).toFixed(2)),
          model: `${cpuInfo.manufacturer ?? ""} ${cpuInfo.brand ?? ""}`.trim(),
          temperatureC: cpuTemp.main ?? undefined,
        },

        gpu: gpuController
          ? {
              usagePercent: gpuController.utilizationGpu ?? 0,
              vramUsedGB: parseFloat(
                ((gpuController.memoryUsed ?? 0) / 1024).toFixed(2)
              ),
              vramTotalGB: parseFloat(
                ((gpuController.vram ?? 0) / 1024).toFixed(2)
              ),
              temperatureC: gpuController.temperatureGpu ?? 0,
              model: gpuController.model ?? "Unknown GPU",
              driverVersion: gpuController.driverVersion ?? undefined,
            }
          : undefined,

        ram: {
          usedGB: parseFloat((memInfo.used / 1024 ** 3).toFixed(2)),
          totalGB: parseFloat((memInfo.total / 1024 ** 3).toFixed(2)),
          usagePercent: Math.round((memInfo.used / memInfo.total) * 100),
        },

        storage: fsSize
          .filter((fs: any) => fs.type !== "squashfs" && fs.size > 0)
          .slice(0, 3)
          .map((fs: any) => ({
            usedGB: parseFloat((fs.used / 1024 ** 3).toFixed(2)),
            totalGB: parseFloat((fs.size / 1024 ** 3).toFixed(2)),
            usagePercent: Math.round(fs.use ?? 0),
            label: fs.mount ?? fs.fs,
          })),

        battery: battery.hasBattery
          ? {
              percent: Math.round(battery.percent ?? 0),
              isCharging: battery.isCharging ?? false,
              timeRemainingMinutes: battery.timeRemaining > 0
                ? battery.timeRemaining
                : undefined,
              wattage: battery.acConnected ? undefined : battery.voltage ?? undefined,
            }
          : undefined,

        network: {
          downloadMbps: parseFloat(
            ((primaryNetwork?.rx_sec ?? 0) / 125000).toFixed(2)
          ),
          uploadMbps: parseFloat(
            ((primaryNetwork?.tx_sec ?? 0) / 125000).toFixed(2)
          ),
          type: "ethernet" as const,
        },

        fans: [],

        temperatureC: cpuTemp.main ?? undefined,
      };

      return metrics;
    } catch (err) {
      console.error("[system.ipc] Failed to collect metrics:", err);
      throw err;
    }
  });

  // ─── Get Top Processes ────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.SYSTEM_GET_PROCESSES, async () => {
    try {
      const data = await si.processes();
      return data.list
        .sort((a: any, b: any) => (b.cpu ?? 0) - (a.cpu ?? 0))
        .slice(0, 20)
        .map((p: any) => ({
          pid: p.pid,
          name: p.name,
          cpuPercent: parseFloat((p.cpu ?? 0).toFixed(1)),
          memoryMB: parseFloat(((p.mem_rss ?? 0) / 1024 / 1024).toFixed(1)),
          status: (p.state === "running" ? "running" : "sleeping") as
            | "running"
            | "sleeping"
            | "stopped",
        }));
    } catch (err) {
      console.error("[system.ipc] Failed to collect processes:", err);
      throw err;
    }
  });
}
