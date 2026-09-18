import type { IModelService, ModelRecord, ModelBenchmark } from "../interfaces/IModelService";
import { OllamaService } from "../ollama/OllamaService";
import { Logger } from "@/core/logger";
import { configManager } from "@/core/config";

const log = Logger.for("mock:model");

/** Full curated model catalog with capability metadata */
const CATALOG: ModelRecord[] = [
  {
    id: "llama3.1:8b",
    name: "Llama 3.1",
    variant: "8B Instruct",
    developer: "Meta",
    parameters: "8B",
    contextLength: 128000,
    vramRequired: 6,
    ramRequired: 10,
    quantization: "Q4_K_M",
    installed: false,
    recommended: true,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: true,
  },
  {
    id: "llama3.1:70b",
    name: "Llama 3.1",
    variant: "70B Instruct",
    developer: "Meta",
    parameters: "70B",
    contextLength: 128000,
    vramRequired: 42,
    ramRequired: 48,
    quantization: "Q4_K_M",
    installed: false,
    recommended: true,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: true,
  },
  {
    id: "qwen2.5-coder:32b",
    name: "Qwen 2.5",
    variant: "Coder 32B",
    developer: "Alibaba",
    parameters: "32B",
    contextLength: 32000,
    vramRequired: 22,
    ramRequired: 32,
    quantization: "Q4_K_M",
    installed: false,
    recommended: false,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: true,
  },
  {
    id: "qwen2.5-coder:7b",
    name: "Qwen 2.5",
    variant: "Coder 7B",
    developer: "Alibaba",
    parameters: "7B",
    contextLength: 32000,
    vramRequired: 5,
    ramRequired: 8,
    quantization: "Q4_K_M",
    installed: false,
    recommended: false,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: true,
  },
  {
    id: "deepseek-r1:70b",
    name: "DeepSeek R1",
    variant: "Distill 70B",
    developer: "DeepSeek",
    parameters: "70B",
    contextLength: 65536,
    vramRequired: 48,
    ramRequired: 56,
    quantization: "Q4_K_M",
    installed: false,
    recommended: true,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: false,
  },
  {
    id: "mistral:7b",
    name: "Mistral",
    variant: "7B Instruct",
    developer: "Mistral AI",
    parameters: "7B",
    contextLength: 32000,
    vramRequired: 5,
    ramRequired: 8,
    quantization: "Q4_K_M",
    installed: false,
    recommended: false,
    vision: false,
    embeddings: false,
    reasoning: false,
    coding: true,
    multilingual: true,
  },
  {
    id: "phi4:14b",
    name: "Phi 4",
    variant: "14B",
    developer: "Microsoft",
    parameters: "14B",
    contextLength: 16000,
    vramRequired: 10,
    ramRequired: 16,
    quantization: "Q4_K_M",
    installed: false,
    recommended: false,
    vision: false,
    embeddings: false,
    reasoning: true,
    coding: true,
    multilingual: false,
  },
  {
    id: "nomic-embed-text:latest",
    name: "Nomic Embed",
    variant: "Text v1.5",
    developer: "Nomic",
    parameters: "137M",
    contextLength: 8192,
    vramRequired: 1,
    ramRequired: 2,
    quantization: "F32",
    installed: false,
    recommended: true,
    vision: false,
    embeddings: true,
    reasoning: false,
    coding: false,
    multilingual: true,
  },
];

/**
 * Mock Model Service for browser dev mode.
 * Uses real Ollama discovery when available and merges with curated catalog.
 */
export class MockModelService implements IModelService {
  private ollama = new OllamaService();
  private localState = new Map<string, Partial<ModelRecord>>();

  async getModels(): Promise<ModelRecord[]> {
    const tags = await this.ollama.listModelTags();
    const catalog = CATALOG.map((model) => ({
      ...model,
      installed: tags.some((tag) => tag.name === model.id),
    }));
    for (const tag of tags) {
      if (catalog.some((model) => model.id === tag.name)) continue;
      const sizeGB = tag.size / 1024 ** 3;
      catalog.push({
        id: tag.name,
        name: tag.name,
        variant: tag.details.parameter_size,
        developer: tag.details.family || "Local",
        parameters: tag.details.parameter_size,
        contextLength: 0,
        vramRequired: sizeGB,
        ramRequired: sizeGB,
        quantization: tag.details.quantization_level,
        installed: true,
        vision: false,
        embeddings: /embed/i.test(tag.name),
        reasoning: false,
        coding: /coder|code/i.test(tag.name),
        multilingual: false,
      });
    }
    return catalog;
  }

  async getModel(id: string): Promise<ModelRecord | undefined> {
    const models = await this.getModels();
    return models.find((m) => m.id === id);
  }

  async getInstalledModels(): Promise<ModelRecord[]> {
    const models = await this.getModels();
    return models.filter((m) => m.installed);
  }

  async installModel(id: string): Promise<void> {
    const response = await fetch(`${configManager.get().ollama.host}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: id, stream: false }),
      signal: AbortSignal.timeout(1800000),
    });
    if (!response.ok) throw new Error(`Model download failed (${response.status})`);
  }

  async uninstallModel(id: string): Promise<void> {
    const response = await fetch(`${configManager.get().ollama.host}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: id }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Model removal failed (${response.status})`);
  }

  async benchmarkModel(id: string): Promise<ModelBenchmark> {
    const { runBenchmark } = await import("@/core/model-router/Benchmarker");
    return runBenchmark(id, this.ollama);
  }

  async refreshInstalledStatus(): Promise<void> {
    // no-op: getModels() always re-checks Ollama
  }
}
