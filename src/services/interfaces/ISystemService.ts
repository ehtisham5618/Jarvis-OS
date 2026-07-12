/**
 * ISystemService — System Hardware Metrics Contract
 *
 * Any implementation (mock, Electron/Windows, Linux) must satisfy this interface.
 * The UI layer only ever depends on this interface — never on the concrete implementation.
 */

export interface CpuMetrics {
  usagePercent: number;
  coreCount: number;
  frequency: number;      // GHz
  model: string;
  temperatureC?: number;
}

export interface GpuMetrics {
  usagePercent: number;
  vramUsedGB: number;
  vramTotalGB: number;
  temperatureC: number;
  model: string;
  driverVersion?: string;
}

export interface RamMetrics {
  usedGB: number;
  totalGB: number;
  usagePercent: number;
  type?: string;          // "DDR5", "LPDDR5X", etc.
}

export interface StorageMetrics {
  usedGB: number;
  totalGB: number;
  usagePercent: number;
  readSpeedMBs?: number;
  writeSpeedMBs?: number;
  label?: string;
}

export interface BatteryMetrics {
  percent: number;
  isCharging: boolean;
  timeRemainingMinutes?: number;
  wattage?: number;
}

export interface NetworkMetrics {
  downloadMbps: number;
  uploadMbps: number;
  ssid?: string;
  type: "wifi" | "ethernet" | "cellular" | "none";
  signalStrengthPercent?: number;
}

export interface FanMetrics {
  rpm: number;
  label: string;
  maxRpm?: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  gpu?: GpuMetrics;
  ram: RamMetrics;
  storage: StorageMetrics[];
  battery?: BatteryMetrics;
  network: NetworkMetrics;
  fans: FanMetrics[];
  temperatureC?: number;   // Overall system temperature
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMB: number;
  status: "running" | "sleeping" | "stopped";
  user?: string;
}

export interface ISystemService {
  /** Get a single snapshot of all hardware metrics */
  getMetrics(): Promise<SystemMetrics>;

  /** Get all running processes */
  getProcesses(): Promise<ProcessInfo[]>;

  /** Check if running inside Electron (gives access to real OS data) */
  isElectron(): boolean;

  /** Human-readable description of this implementation */
  readonly implementationName: string;
}
