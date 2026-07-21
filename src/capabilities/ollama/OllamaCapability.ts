import { BaseCapability } from "../base/BaseCapability";
import type { CapabilityContext } from "../base/CapabilityContext";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { IModelService, ModelRecord } from "@/services/interfaces/IModelService";

export interface OllamaCapabilityInput {
  action: "list_models" | "install_model" | "benchmark_model";
  modelId?: string;
}

export type OllamaCapabilityOutput = ModelRecord[] | void | unknown;

export class OllamaCapability extends BaseCapability<
  OllamaCapabilityInput,
  OllamaCapabilityOutput
> {
  readonly id = "ollama:manage";
  readonly description = "Manages local AI models via Ollama.";
  readonly requiredPermissions = ["ai.manage"];

  protected async performExecute(
    input: OllamaCapabilityInput,
    _context: CapabilityContext,
  ): Promise<OllamaCapabilityOutput> {
    const modelService = serviceRegistry.resolve<IModelService>(ServiceToken.Model);

    switch (input.action) {
      case "list_models":
        return await modelService.getInstalledModels();
      case "install_model":
        if (!input.modelId) throw new Error("modelId required for install_model");
        return await modelService.installModel(input.modelId);
      case "benchmark_model":
        if (!input.modelId) throw new Error("modelId required for benchmark_model");
        return await modelService.benchmarkModel(input.modelId);
      default:
        throw new Error(`Unknown ollama action: ${input.action}`);
    }
  }
}
