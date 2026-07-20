/**
 * ModelRouter.ts
 *
 * Picks the best available model for a given RequestIntent.
 * Scoring: capability_score * 0.6 + speed_score * 0.4
 */

import type { ModelRecord } from "@/services/interfaces/IModelService";
import type { RequestIntent } from "./IntentDetector";
import { Logger } from "@/core/logger";

const log = Logger.for("model-router");

export interface RouterDecision {
  model: ModelRecord;
  intent: RequestIntent;
  score: number;
  reason: string;
}

/**
 * Select the best model for the given intent from a list of candidates.
 * Only considers installed models that are suitable for the current hardware.
 */
export function selectModel(intent: RequestIntent, available: ModelRecord[]): RouterDecision | null {
  // Filter: must be installed and hardware-suitable
  const candidates = available.filter(
    m => m.installed && m.suitableForCurrentHardware !== false
  );

  if (candidates.length === 0) {
    log.warn("No suitable candidates found — using first installed model as fallback.");
    const fallback = available.find(m => m.installed);
    if (!fallback) return null;
    return { model: fallback, intent, score: 0, reason: "Fallback: no hardware-suitable models available." };
  }

  const scored = candidates.map(m => {
    const cap = computeCapabilityScore(m, intent);
    const spd = computeSpeedScore(m);
    const total = cap * 0.6 + spd * 0.4;
    return { model: m, score: total, capScore: cap, spdScore: spd };
  });

  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0];

  const reason = buildReason(winner.model, intent, winner.capScore, winner.spdScore);
  log.info(`[model-router] Selected "${winner.model.id}" for intent "${intent}" (score: ${winner.score.toFixed(2)})`);

  return { model: winner.model, intent, score: winner.score, reason };
}

function computeCapabilityScore(model: ModelRecord, intent: RequestIntent): number {
  switch (intent) {
    case "code":       return model.coding     ? 1.0 : 0.4;
    case "reasoning":  return model.reasoning  ? 1.0 : 0.4;
    case "vision":     return model.vision     ? 1.0 : 0.0; // vision is a hard requirement
    case "embeddings": return model.embeddings ? 1.0 : 0.0; // embeddings is a hard requirement
    case "fast":       return 0.5; // capability less important for fast
    case "chat":
    default:           return (model.reasoning ? 0.5 : 0) + (model.multilingual ? 0.25 : 0) + 0.25;
  }
}

function computeSpeedScore(model: ModelRecord): number {
  // Use benchmarked speed if available; otherwise estimate from parameter size
  if (model.benchmark?.speedTokensPerSec) {
    // Normalize to 0-1 where 150 tok/s = 1.0
    return Math.min(model.benchmark.speedTokensPerSec / 150, 1.0);
  }

  // Rough heuristic from parameter count
  const paramEstimates: Record<string, number> = {
    "3b": 0.9, "7b": 0.75, "8b": 0.70, "13b": 0.55, "14b": 0.50,
    "24b": 0.35, "27b": 0.30, "32b": 0.25, "70b": 0.15, "72b": 0.13,
  };
  const key = Object.keys(paramEstimates).find(k =>
    model.parameters.toLowerCase().includes(k)
  );
  return key ? paramEstimates[key] : 0.3;
}

function buildReason(model: ModelRecord, intent: RequestIntent, cap: number, spd: number): string {
  const capLabel = intent === "code"
    ? (model.coding ? "strong coding" : "limited coding")
    : intent === "reasoning"
    ? (model.reasoning ? "strong reasoning" : "limited reasoning")
    : "balanced";

  return `Selected "${model.name} ${model.variant}" for "${intent}" — ${capLabel} capability (${(cap * 100).toFixed(0)}%), speed score ${(spd * 100).toFixed(0)}%.`;
}
