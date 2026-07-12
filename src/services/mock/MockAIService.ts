import type {
  IAIService,
  ChatThread,
  ChatOptions,
  StreamToken,
  IntentClassification,
} from "../interfaces/IAIService";

/**
 * Mock AI implementation for when Ollama is unavailable.
 * Generates realistic streaming responses with artificial delay.
 */
export class MockAIService implements IAIService {
  readonly providerName = "Mock AI (Fallback)";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async *chat(
    thread: ChatThread,
    options: ChatOptions,
  ): AsyncIterable<StreamToken> {
    const lastMessage = thread.messages[thread.messages.length - 1]?.content ?? "";
    const responseText = this.generateMockResponse(lastMessage, options.model);
    
    // Split into words to simulate tokens
    const tokens = responseText.split(/(\s+)/);
    
    // Artificial latency for first token
    await new Promise(r => setTimeout(r, 800));

    let totalTokens = 0;
    const startTime = performance.now();

    for (let i = 0; i < tokens.length; i++) {
      const isFinal = i === tokens.length - 1;
      totalTokens++;

      yield {
        token: tokens[i],
        isFinal,
        ...(isFinal ? {
          totalTokens,
          latencyMs: performance.now() - startTime
        } : {})
      };

      // Artificial streaming delay (~20 tok/sec)
      if (!isFinal) {
        await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
      }
    }
  }

  async classifyIntent(message: string): Promise<IntentClassification> {
    const text = message.toLowerCase();
    
    if (text.includes("code") || text.includes("function") || text.includes("debug")) {
      return { intent: "coding", confidence: 0.95, requiredCapabilities: ["ai.chat"] };
    }
    
    if (text.includes("math") || text.includes("calculate") || text.includes("why")) {
      return { intent: "reasoning", confidence: 0.88, requiredCapabilities: ["ai.chat"] };
    }

    if (text.includes("what is on my screen") || text.includes("look at")) {
      return { intent: "vision", confidence: 0.99, requiredCapabilities: ["vision.read", "ai.chat"] };
    }

    if (text.includes("open") || text.includes("launch") || text.includes("start")) {
      return { intent: "system_control", confidence: 0.9, requiredCapabilities: ["system.execute"] };
    }

    return { intent: "general", confidence: 0.7, requiredCapabilities: ["ai.chat"] };
  }

  async embed(_text: string): Promise<Float32Array> {
    // Generate random 768d vector for mock
    const vec = new Float32Array(768);
    for (let i = 0; i < 768; i++) vec[i] = Math.random() * 2 - 1;
    return vec;
  }

  async listAvailableModels(): Promise<string[]> {
    return ["mock-assistant-7b", "mock-coder-32b", "mock-reasoner-70b"];
  }

  private generateMockResponse(prompt: string, model: string): string {
    if (prompt.toLowerCase().includes("summarize")) {
      return "Based on your afternoon activity, you shipped 14 commits to Project Aether, primarily focusing on the Neural Studio UI toolkit. You spent 3 hours in deep focus mode, with no unusual battery drain or security anomalies detected. Would you like me to prepare a changelog for these commits?";
    }
    
    return `This is a mock response from ${model}. Since I am running in offline fallback mode without Ollama, I am generating predefined text. The real Jarvis will stream live AI responses here once connected.`;
  }
}
