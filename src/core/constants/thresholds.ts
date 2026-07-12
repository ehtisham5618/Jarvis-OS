/**
 * Jarvis Hardware Thresholds
 *
 * Warning and critical alert levels for hardware metrics.
 * The Hardware Intelligence module uses these to surface proactive suggestions.
 */

export const CpuThresholds = {
  warningPercent: 75,
  criticalPercent: 90,
  sustainedWarningMs: 30_000,  // Warn after sustained high usage for 30s
} as const;

export const GpuThresholds = {
  warningPercent: 80,
  criticalPercent: 95,
  temperatureWarningC: 80,
  temperatureCriticalC: 90,
} as const;

export const RamThresholds = {
  warningPercent: 80,
  criticalPercent: 92,
} as const;

export const VramThresholds = {
  warningPercent: 85,
  criticalPercent: 95,
  /** Minimum VRAM headroom to offer running a model */
  minimumHeadroomGB: 1,
} as const;

export const StorageThresholds = {
  warningPercent: 85,
  criticalPercent: 95,
  /** Below this free GB, warn user */
  minimumFreeGB: 10,
} as const;

export const BatteryThresholds = {
  warningPercent: 20,
  criticalPercent: 10,
  /** Below this, prefer smaller/faster AI models */
  aiModelThrottlePercent: 30,
} as const;

export const TemperatureThresholds = {
  warningC: 75,
  criticalC: 90,
  fanActivationC: 60,
} as const;

export const NetworkThresholds = {
  /** Below this Mbps, warn about slow connection */
  slowMbps: 5,
} as const;
