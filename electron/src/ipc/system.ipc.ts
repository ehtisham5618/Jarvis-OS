import { ipcMain } from "electron";
import si from "systeminformation";
import * as os from "os";
import { IpcChannels } from "./channels";

/**
 * System IPC Handlers
 *
 * Collects real hardware data from the OS using `systeminformation`
 * and returns it to the renderer via typed IPC channels.
 */

// Cache each source separately and share pending work across every IPC caller.
// A timed-out query stays in flight until it settles, so retries cannot pile up WMI processes.
function cached<T>(query: () => Promise<T>, ttl: number, timeoutMs = 1500): () => Promise<T> {
  let value: T | undefined;
  let expires = 0;
  let pending: Promise<T> | undefined;
  return async () => {
    if (value !== undefined && Date.now() < expires) return value;
    if (!pending)
      pending = query()
        .then((result) => {
          value = result;
          expires = Date.now() + ttl;
          return result;
        })
        .finally(() => {
          pending = undefined;
        });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        pending,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Hardware query timed out")), timeoutMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
}
const cpu = cached(() => si.cpu(), 3600000);
const load = cached(() => si.currentLoad(), 3000);
const temperature = cached(() => si.cpuTemperature(), 30000);
const gpu = cached(() => si.graphics(), 30000);
const batteryInfo = cached(() => si.battery(), 30000);
const network = cached(() => si.networkStats(), 5000);
const disks = cached(() => si.fsSize(), 60000);
const processes = cached(() => si.processes(), 15000, 15000);

export function registerSystemHandlers(): void {
  ipcMain.handle(IpcChannels.SYSTEM_POWER_STATUS, () => batteryInfo());
  // ─── Get Full System Metrics ──────────────────────────────────────────────
  ipcMain.handle(IpcChannels.SYSTEM_GET_METRICS, async () => {
    try {
      const [cpuLoad, cpuInfo, cpuTemp, memInfo, graphics, battery, networkStats, fsSize] =
        await Promise.all([
          load(),
          cpu().catch(() => ({
            physicalCores: os.cpus().length,
            cores: os.cpus().length,
            speed: (os.cpus()[0]?.speed ?? 0) / 1000,
            manufacturer: "",
            brand: os.cpus()[0]?.model ?? "Unknown CPU",
          })),
          temperature().catch(() => ({ main: undefined })),
          Promise.resolve({ total: os.totalmem(), used: os.totalmem() - os.freemem() }),
          gpu().catch(() => ({ controllers: [] })),
          batteryInfo().catch(
            () => ({ hasBattery: false }) as Awaited<ReturnType<typeof si.battery>>,
          ),
          network().catch(() => []),
          disks().catch(() => []),
        ]);

      const gpuController = graphics.controllers?.[0];
      const primaryNetwork = networkStats?.[0];
      const primaryFs = fsSize?.[0];

      const metrics = {
        timestamp: new Date().toISOString(),

        cpu: {
          usagePercent: Math.round(cpuLoad.currentLoad ?? 0),
          coreCount: cpuInfo.physicalCores ?? cpuInfo.cores ?? 4,
          frequency: parseFloat((cpuInfo.speed || (os.cpus()[0]?.speed ?? 0) / 1000).toFixed(2)),
          model:
            `${cpuInfo.manufacturer ?? ""} ${cpuInfo.brand ?? ""}`.trim() || os.cpus()[0]?.model,
          temperatureC: cpuTemp.main ?? undefined,
        },

        gpu: gpuController
          ? {
              usagePercent: gpuController.utilizationGpu ?? 0,
              vramUsedGB: parseFloat(((gpuController.memoryUsed ?? 0) / 1024).toFixed(2)),
              vramTotalGB: parseFloat(((gpuController.vram ?? 0) / 1024).toFixed(2)),
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
              timeRemainingMinutes: battery.timeRemaining > 0 ? battery.timeRemaining : undefined,
              wattage: battery.acConnected ? undefined : (battery.voltage ?? undefined),
            }
          : undefined,

        network: {
          downloadMbps: parseFloat(((primaryNetwork?.rx_sec ?? 0) / 125000).toFixed(2)),
          uploadMbps: parseFloat(((primaryNetwork?.tx_sec ?? 0) / 125000).toFixed(2)),
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
      const data = await processes();
      return data.list
        .sort((a: any, b: any) => (b.cpu ?? 0) - (a.cpu ?? 0))
        .slice(0, 20)
        .map((p: any) => ({
          pid: p.pid,
          name: p.name,
          cpuPercent: parseFloat((p.cpu ?? 0).toFixed(1)),
          memoryMB: parseFloat(((p.mem_rss ?? 0) / 1024).toFixed(1)),
          status: (p.state === "running" ? "running" : "sleeping") as
            "running" | "sleeping" | "stopped",
        }));
    } catch (err) {
      console.warn("[hardware] Process inventory temporarily unavailable");
      return [];
    }
  });
}
