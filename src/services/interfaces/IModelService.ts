/**
 * IModelService — Model Registry Contract
 *
 * Manages the discovery, installation, and metadata of AI models.
 * Drives the "Model Manager" UI and provides data to the Model Router.
 */

export interface ModelBenchmark {
  speedTokensPerSec: number;
  codingScore: number;
  reasoningScore: number;
  avgLatencyMs: number;
  benchmarkedAt: string;
}

export interface ModelRecord {
  id: string; // e.g., "llama3.1:70b"
  name: string; // e.g., "Llama 3.1"
  variant: string; // e.g., "70B Instruct"
  developer: string; // e.g., "Meta"
  parameters: string; // e.g., "70B"
  contextLength: number; // e.g., 128000
  vramRequired: number; // GB
  ramRequired: number; // GB
  quantization: string; // e.g., "Q4_K_M"
  installed: boolean;
  installedAt?: string;

  // Capabilities
  vision: boolean;
  embeddings: boolean;
  reasoning: boolean;
  coding: boolean;
  multilingual: boolean;

  benchmark?: ModelBenchmark;

  // Hardware suitability (computed at runtime based on SystemMetrics)
  suitableForCurrentHardware?: boolean;
  suitabilityReason?: string;
  recommended?: boolean;
}

export interface IModelService {
  /** Get all models (both installed and available in the catalog) */
  getModels(): Promise<ModelRecord[]>;

  /** Get a specific model by ID */
  getModel(id: string): Promise<ModelRecord | undefined>;

  /** Get only models that are currently installed */
  getInstalledModels(): Promise<ModelRecord[]>;

  /** Install a model (downloads from Ollama or other provider) */
  installModel(id: string): Promise<void>;

  /** Uninstall a model */
  uninstallModel(id: string): Promise<void>;

  /** Run the standard benchmark suite on a model */
  benchmarkModel(id: string): Promise<ModelBenchmark>;

  /** Refresh the list of installed models from the underlying provider */
  refreshInstalledStatus(): Promise<void>;
}
