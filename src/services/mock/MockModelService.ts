import type { IModelService, ModelRecord, ModelBenchmark } from "../interfaces/IModelService";
import { OllamaService } from "../ollama/OllamaService";

/**
 * Mock Model Service for Phase 1.
 * Uses real Ollama service for discovery if available, otherwise falls back to mock data.
 */
export class MockModelService implements IModelService {
  private ollama = new OllamaService();
  
  private mockModels: ModelRecord[] = [
    {
      id: "llama3.1:70b", name: "Llama 3.1", variant: "70B Instruct", developer: "Meta",
      parameters: "70B", contextLength: 128000, vramRequired: 42, ramRequired: 48, quantization: "Q4_K_M",
      installed: true, active: true, recommended: true,
      vision: false, embeddings: false, reasoning: true, coding: true, multilingual: true,
    },
    {
      id: "qwen2.5-coder:32b", name: "Qwen 2.5", variant: "Coder 32B", developer: "Alibaba",
      parameters: "32B", contextLength: 32000, vramRequired: 22, ramRequired: 32, quantization: "Q4_K_M",
      installed: true, active: false, recommended: false,
      vision: false, embeddings: false, reasoning: true, coding: true, multilingual: true,
    },
  ];

  async getModels(): Promise<ModelRecord[]> {
    return this.mockModels;
  }

  async getModel(id: string): Promise<ModelRecord | undefined> {
    return this.mockModels.find(m => m.id === id);
  }

  async getInstalledModels(): Promise<ModelRecord[]> {
    // Try to get real installed models from Ollama first
    try {
      if (await this.ollama.isAvailable()) {
        const ollamaModels = await this.ollama.listAvailableModels();
        if (ollamaModels.length > 0) {
          return ollamaModels.map(name => ({
            id: name,
            name: name.split(":")[0],
            variant: name.split(":")[1] || "latest",
            developer: "Unknown",
            parameters: "?",
            contextLength: 4096,
            vramRequired: 8,
            ramRequired: 16,
            quantization: "?",
            installed: true,
            vision: false, embeddings: false, reasoning: false, coding: false, multilingual: false,
          }));
        }
      }
    } catch {
      // Fallback
    }
    
    return this.mockModels.filter(m => m.installed);
  }

  async installModel(id: string): Promise<void> {
    const model = this.mockModels.find(m => m.id === id);
    if (model) {
      // Fake download delay
      await new Promise(r => setTimeout(r, 2000));
      model.installed = true;
    }
  }

  async uninstallModel(id: string): Promise<void> {
    const model = this.mockModels.find(m => m.id === id);
    if (model) model.installed = false;
  }

  async benchmarkModel(id: string): Promise<ModelBenchmark> {
    await new Promise(r => setTimeout(r, 3000));
    return {
      speedTokensPerSec: 42 + Math.random() * 20,
      codingScore: 85 + Math.random() * 10,
      reasoningScore: 80 + Math.random() * 15,
      avgLatencyMs: 300 + Math.random() * 200,
      benchmarkedAt: new Date().toISOString(),
    };
  }

  async refreshInstalledStatus(): Promise<void> {
    // No-op for mock
  }
}
