import type { ISystemService, SystemMetrics, ProcessInfo } from "../interfaces/ISystemService";

/**
 * Realistic hardware telemetry simulation for Phase 1.
 * Evolves values naturally over time rather than jumping randomly.
 */
export class MockSystemService implements ISystemService {
  readonly implementationName = "Mock (Browser Simulation)";
  
  private currentCpu = 24;
  private currentGpu = 12;
  private currentRam = 48; // GB
  private batteryPercent = 87;

  constructor() {
    // Slowly drain battery over time
    setInterval(() => {
      this.batteryPercent = Math.max(0, this.batteryPercent - 0.1);
    }, 60000); // every minute

    // Evolve metrics naturally
    setInterval(() => {
      this.currentCpu = Math.max(5, Math.min(100, this.currentCpu + (Math.random() * 10 - 5)));
      this.currentGpu = Math.max(2, Math.min(100, this.currentGpu + (Math.random() * 8 - 4)));
      this.currentRam = Math.max(32, Math.min(128, this.currentRam + (Math.random() * 2 - 1)));
    }, 1500);
  }

  async getMetrics(): Promise<SystemMetrics> {
    const temperature = 45 + (this.currentCpu * 0.4);

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usagePercent: this.currentCpu,
        coreCount: 14,
        frequency: 3.4,
        model: "M4 Max",
        temperatureC: temperature,
      },
      gpu: {
        usagePercent: this.currentGpu,
        vramUsedGB: 6.2,
        vramTotalGB: 18.0,
        temperatureC: temperature + 5,
        model: "40-core GPU",
      },
      ram: {
        usedGB: this.currentRam,
        totalGB: 128,
        usagePercent: (this.currentRam / 128) * 100,
        type: "LPDDR5X",
      },
      storage: [
        {
          usedGB: 1240,
          totalGB: 2000,
          usagePercent: 62,
          label: "Macintosh HD",
        }
      ],
      battery: {
        percent: this.batteryPercent,
        isCharging: false,
        timeRemainingMinutes: this.batteryPercent * 4.5,
      },
      network: {
        downloadMbps: Math.random() * 500 + 100,
        uploadMbps: Math.random() * 150 + 50,
        type: "wifi",
        ssid: "aether-5G",
      },
      fans: [
        { label: "Left", rpm: this.currentCpu > 50 ? 2400 : 1200 },
        { label: "Right", rpm: this.currentCpu > 50 ? 2500 : 1250 },
      ],
      temperatureC: temperature,
    };
  }

  async getProcesses(): Promise<ProcessInfo[]> {
    return [
      { pid: 1, name: "WindowServer", cpuPercent: 12.4, memoryMB: 850, status: "running" },
      { pid: 442, name: "Cursor", cpuPercent: 8.2, memoryMB: 1200, status: "running" },
      { pid: 891, name: "Ghostty", cpuPercent: 2.1, memoryMB: 400, status: "running" },
      { pid: 902, name: "Node", cpuPercent: 4.5, memoryMB: 350, status: "running" },
      { pid: 1042, name: "Arc", cpuPercent: 18.9, memoryMB: 2400, status: "running" },
    ];
  }

  isElectron(): boolean {
    return false;
  }
}
