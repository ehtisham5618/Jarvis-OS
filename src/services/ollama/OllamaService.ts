import type {
  IAIService,
  ChatThread,
  ChatOptions,
  StreamToken,
  IntentClassification,
} from "../interfaces/IAIService";
import { configManager } from "@/core/config";
import { Logger } from "@/core/logger";
import { ServiceError, ServiceUnavailableError } from "@/core/errors";
import type {
  OllamaChatRequest,
  OllamaChatResponseChunk,
  OllamaTagsResponse,
  OllamaModelTag,
} from "./OllamaTypes";

const log = Logger.for("ollama-service");

export class OllamaService implements IAIService {
  readonly providerName = "Ollama";

  private get baseUrl(): string {
    return configManager.get().ollama.host;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async *chat(thread: ChatThread, options: ChatOptions): AsyncIterable<StreamToken> {
    const timeout = AbortSignal.timeout(120000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    signal.throwIfAborted();
    const isUp = await this.isAvailable();
    if (!isUp) {
      throw new ServiceUnavailableError("Ollama");
    }

    const request: OllamaChatRequest = {
      model: options.model,
      messages: thread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
        stop: options.stopSequences,
      },
    };

    if (options.systemPrompt) {
      request.messages.unshift({ role: "system", content: options.systemPrompt });
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal,
      });
    } catch (err) {
      throw new ServiceError("Failed to connect to Ollama for chat", "Ollama", {
        cause: err as Error,
      });
    }

    if (!response.ok || !response.body) {
      throw new ServiceError(`Ollama chat failed: ${response.statusText}`, "Ollama");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const startTime = performance.now();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        if (done && buffer.trim()) buffer += "\n";
        const lines = buffer.split("\n");

        // Keep the last partial line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          {
            const chunk = JSON.parse(line) as OllamaChatResponseChunk & { error?: string };
            if (chunk.error) throw new ServiceError(chunk.error, "Ollama");

            yield {
              token: chunk.message?.content ?? "",
              isFinal: chunk.done,
              ...(chunk.done
                ? {
                    totalTokens: chunk.eval_count,
                    latencyMs: performance.now() - startTime,
                  }
                : {}),
            };
          }
        }
        if (done) break;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
  }

  async classifyIntent(_message: string): Promise<IntentClassification> {
    // In a real implementation, this would call a small local model (e.g., Llama3 8B)
    // with a strict JSON schema prompt to classify the intent.
    // For M1, we'll mock this specific method even in the real service.
    return {
      intent: "general",
      confidence: 0.8,
      requiredCapabilities: ["ai.chat"],
    };
  }

  async embed(text: string, model = "nomic-embed-text"): Promise<Float32Array> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      return new Float32Array(data.embedding);
    } catch (err) {
      throw new ServiceError("Failed to generate embeddings", "Ollama", { cause: err as Error });
    }
  }

  async listAvailableModels(): Promise<string[]> {
    return (await this.listModelTags()).map((model) => model.name);
  }

  async listModelTags(): Promise<OllamaModelTag[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return [];

      const data = (await response.json()) as OllamaTagsResponse;
      return data.models;
    } catch {
      return [];
    }
  }
}
