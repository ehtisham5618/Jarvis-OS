/**
 * HardwareSuitability.ts
 *
 * Computes how well a given model fits the current hardware.
 * Three outcomes: gpu (full speed), cpu (slow but usable), insufficient (can't run).
 */

import type { ModelRecord } from "@/services/interfaces/IModelService";
import type { SystemMetrics } from "@/services/interfaces/ISystemService";

export type SuitabilityMode = "gpu" | "cpu" | "insufficient";

export interface SuitabilityResult {
  mode: SuitabilityMode;
  reason: string;
  estimatedSpeedTokensPerSec: number;
}

/**
 * Given a model and current hardware metrics, determine if it can run.
 */
export function computeSuitability(model: ModelRecord, metrics: SystemMetrics): SuitabilityResult {
  const availableVram = metrics.gpu ? metrics.gpu.vramTotalGB - metrics.gpu.vramUsedGB : 0;

  const availableRam = metrics.ram.totalGB - metrics.ram.usedGB;

  // GPU path — fast
  if (metrics.gpu && availableVram >= model.vramRequired) {
    const headroom = availableVram - model.vramRequired;
    return {
      mode: "gpu",
      reason: `${availableVram.toFixed(1)} GB VRAM free, needs ${model.vramRequired} GB — runs on GPU.`,
      estimatedSpeedTokensPerSec: estimateGpuSpeed(model, headroom),
    };
  }

  // CPU path — slow but usable (requires RAM + 4 GB buffer)
  if (availableRam >= model.ramRequired + 4) {
    const headroom = availableRam - model.ramRequired;
    return {
      mode: "cpu",
      reason: `Not enough VRAM (${availableVram.toFixed(1)} GB free, needs ${model.vramRequired} GB). Falls back to CPU — expect reduced speed.`,
      estimatedSpeedTokensPerSec: estimateCpuSpeed(model, headroom),
    };
  }

  // Not enough resources
  return {
    mode: "insufficient",
    reason: `Insufficient resources. Needs ${model.vramRequired} GB VRAM or ${model.ramRequired + 4} GB RAM free. Only ${availableVram.toFixed(1)} GB VRAM / ${availableRam.toFixed(1)} GB RAM available.`,
    estimatedSpeedTokensPerSec: 0,
  };
}

function estimateGpuSpeed(model: ModelRecord, headroomGB: number): number {
  // Rough estimate: smaller models on GPU are faster
  const baseSpeedByParams: Record<string, number> = {
    "3B": 120,
    "7B": 90,
    "8B": 85,
    "13B": 60,
    "14B": 55,
    "24B": 45,
    "27B": 40,
    "32B": 35,
    "70B": 22,
    "72B": 20,
  };
  const paramKey = Object.keys(baseSpeedByParams).find((k) =>
    model.parameters.toUpperCase().includes(k.toUpperCase()),
  );
  const base = paramKey ? baseSpeedByParams[paramKey] : 30;
  // Headroom bonus (more VRAM headroom = can batch more)
  const bonus = Math.min(headroomGB * 1.5, 20);
  return Math.round(base + bonus);
}

function estimateCpuSpeed(model: ModelRecord, headroomGB: number): number {
  const baseSpeedByParams: Record<string, number> = {
    "3B": 15,
    "7B": 10,
    "8B": 9,
    "13B": 6,
    "14B": 5,
    "24B": 3,
    "27B": 2.5,
    "32B": 2,
    "70B": 0.8,
    "72B": 0.7,
  };
  const paramKey = Object.keys(baseSpeedByParams).find((k) =>
    model.parameters.toUpperCase().includes(k.toUpperCase()),
  );
  const base = paramKey ? baseSpeedByParams[paramKey] : 3;
  return Math.max(Math.round(base + headroomGB * 0.2), 0.5);
}
