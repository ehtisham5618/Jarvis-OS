/**
 * Benchmarker.ts
 *
 * Runs a standardised three-test benchmark suite on any Ollama model:
 *  1. Speed  — simple generation, measures tokens/sec
 *  2. Coding — sends a Python problem, checks if response contains code
 *  3. Reasoning — simple math problem, checks answer correctness
 */

import type { IAIService, ChatThread } from "@/services/interfaces/IAIService";
import type { ModelBenchmark } from "@/services/interfaces/IModelService";
import { Logger } from "@/core/logger";

const log = Logger.for("benchmarker");

export interface BenchmarkProgress {
  stage: "speed" | "coding" | "reasoning" | "done";
  progressPercent: number;
}

type ProgressCallback = (p: BenchmarkProgress) => void;

export async function runBenchmark(
  modelId: string,
  aiService: IAIService,
  onProgress?: ProgressCallback,
): Promise<ModelBenchmark> {
  log.info(`Starting benchmark for model: ${modelId}`);

  // ── 1. SPEED TEST ──────────────────────────────────────────────────────────
  onProgress?.({ stage: "speed", progressPercent: 10 });
  const speedResult = await measureSpeed(modelId, aiService);
  log.info(
    `Speed: ${speedResult.tokensPerSec.toFixed(1)} tok/s, latency: ${speedResult.latencyMs}ms`,
  );

  onProgress?.({ stage: "coding", progressPercent: 40 });

  // ── 2. CODING TEST ─────────────────────────────────────────────────────────
  const codingScore = await measureCoding(modelId, aiService);
  log.info(`Coding score: ${codingScore}`);

  onProgress?.({ stage: "reasoning", progressPercent: 70 });

  // ── 3. REASONING TEST ──────────────────────────────────────────────────────
  const reasoningScore = await measureReasoning(modelId, aiService);
  log.info(`Reasoning score: ${reasoningScore}`);

  onProgress?.({ stage: "done", progressPercent: 100 });

  return {
    speedTokensPerSec: speedResult.tokensPerSec,
    codingScore,
    reasoningScore,
    avgLatencyMs: speedResult.latencyMs,
    benchmarkedAt: new Date().toISOString(),
  };
}

async function streamFull(
  modelId: string,
  aiService: IAIService,
  prompt: string,
): Promise<{ text: string; durationMs: number; tokenCount: number }> {
  const thread: ChatThread = {
    id: `benchmark-${Date.now()}`,
    messages: [{ id: "1", role: "user", content: prompt, timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const start = Date.now();
  let text = "";
  let tokenCount = 0;

  const stream = aiService.chat(thread, { model: modelId, maxTokens: 300 });
  for await (const chunk of stream) {
    text += chunk.token;
    tokenCount++;
    if (chunk.isFinal && chunk.totalTokens) tokenCount = chunk.totalTokens;
  }

  return { text, durationMs: Date.now() - start, tokenCount };
}

async function measureSpeed(modelId: string, aiService: IAIService) {
  try {
    const { text, durationMs, tokenCount } = await streamFull(
      modelId,
      aiService,
      "Describe the sky in one sentence.",
    );
    const tokensPerSec = tokenCount > 0 ? tokenCount / (durationMs / 1000) : 0;
    return { tokensPerSec, latencyMs: durationMs };
  } catch (err) {
    log.error("Speed test failed", { error: err });
    return { tokensPerSec: 0, latencyMs: 9999 };
  }
}

async function measureCoding(modelId: string, aiService: IAIService): Promise<number> {
  try {
    const { text } = await streamFull(
      modelId,
      aiService,
      "Write a Python function to compute the Fibonacci sequence up to N terms.",
    );
    // Heuristic: good response contains code, def keyword, and a loop/recursion
    const hasCode = text.includes("def ") || text.includes("```python") || text.includes("```");
    const hasLoop =
      text.includes("for ") ||
      text.includes("while ") ||
      text.includes("range(") ||
      text.includes("return");
    const hasFib = text.toLowerCase().includes("fibonacci") || text.toLowerCase().includes("fib");

    let score = 50;
    if (hasCode) score += 25;
    if (hasLoop) score += 15;
    if (hasFib) score += 10;
    return Math.min(score, 100);
  } catch (err) {
    log.error("Coding test failed", { error: err });
    return 0;
  }
}

async function measureReasoning(modelId: string, aiService: IAIService): Promise<number> {
  try {
    const { text } = await streamFull(
      modelId,
      aiService,
      "What is 17 × 24? Show your work briefly, then give the final answer.",
    );
    // Correct answer is 408
    const containsCorrectAnswer = text.includes("408");
    const showsWork =
      text.includes("×") ||
      text.includes("*") ||
      text.includes("+") ||
      text.toLowerCase().includes("step");

    let score = 40;
    if (containsCorrectAnswer) score += 50;
    if (showsWork) score += 10;
    return Math.min(score, 100);
  } catch (err) {
    log.error("Reasoning test failed", { error: err });
    return 0;
  }
}
