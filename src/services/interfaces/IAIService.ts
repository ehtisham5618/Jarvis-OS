/**
 * IAIService — AI Language Model Contract
 *
 * Streaming-first design. The chat method returns an AsyncIterable of tokens,
 * allowing the UI to render tokens as they arrive without buffering.
 *
 * Both the Ollama implementation and the mock implementation satisfy this interface.
 */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  model?: string;
  timestamp: string;
  /** Number of tokens in this message (filled after completion) */
  tokenCount?: number;
  /** Latency to first token in ms */
  latencyMs?: number;
}

export interface ChatThread {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  title?: string;
  model?: string;
}

export interface ChatOptions {
  model: string;
  temperature?: number;         // 0.0 – 2.0
  maxTokens?: number;
  systemPrompt?: string;
  /** Stop generation at these strings */
  stopSequences?: string[];
}

export interface StreamToken {
  token: string;
  isFinal: boolean;
  totalTokens?: number;
  latencyMs?: number;
}

/**
 * Intent classification result.
 * Used by the Model Router to select the appropriate model for a task.
 */
export interface IntentClassification {
  intent: string;               // e.g., "coding", "reasoning", "vision", "general"
  confidence: number;           // 0.0 – 1.0
  requiredCapabilities: string[]; // e.g., ["vision"], ["code-execution"]
  suggestedModel?: string;
}

export interface IAIService {
  /** Name of the AI provider (e.g., "Ollama", "MockAI") */
  readonly providerName: string;

  /** Whether this service is currently available */
  isAvailable(): Promise<boolean>;

  /**
   * Stream a chat response, yielding tokens as they arrive.
   * The stream completes when the model finishes or an error occurs.
   */
  chat(
    thread: ChatThread,
    options: ChatOptions,
  ): AsyncIterable<StreamToken>;

  /**
   * Classify the intent of a user message.
   * Used by the Model Router to select the appropriate capability/model.
   */
  classifyIntent(message: string): Promise<IntentClassification>;

  /**
   * Generate embeddings for a text string.
   * Used by the Memory Engine for semantic search.
   */
  embed(text: string, model?: string): Promise<Float32Array>;

  /** List models available from this provider */
  listAvailableModels(): Promise<string[]>;
}
