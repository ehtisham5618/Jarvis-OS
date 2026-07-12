/**
 * Ollama API Response Types
 */

export interface OllamaModelTag {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaTagsResponse {
  models: OllamaModelTag[];
}

export interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    images?: string[];
  }>;
  stream?: boolean;
  format?: string;
  keep_alive?: string | number;
  options?: Record<string, unknown>;
}

export interface OllamaChatResponseChunk {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
  
  // Only present in the final chunk
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}
