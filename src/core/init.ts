import { serviceRegistry, ServiceToken } from "./service-registry";
import { MockSystemService } from "@/services/mock/MockSystemService";
import { MockAIService } from "@/services/mock/MockAIService";
import { MockModelService } from "@/services/mock/MockModelService";
import { OllamaService } from "@/services/ollama/OllamaService";
import { configManager } from "./config";
import { Logger } from "./logger";

const log = Logger.for("boot");

let isInitialized = false;

export async function initializeJarvis(): Promise<void> {
  if (isInitialized) return;

  log.info("Booting Jarvis OS core...");

  // 1. Register base services
  serviceRegistry.register(ServiceToken.System, new MockSystemService());
  serviceRegistry.register(ServiceToken.Model, new MockModelService());
  
  // 2. Initialize AI Service (Check Ollama first, fallback to Mock)
  const ollama = new OllamaService();
  const isOllamaUp = await ollama.isAvailable();
  
  if (isOllamaUp) {
    log.info("Ollama detected. Wiring real AI engine.");
    serviceRegistry.register(ServiceToken.AI, ollama);
  } else {
    log.warn("Ollama unreachable. Wiring Mock AI engine.");
    serviceRegistry.register(ServiceToken.AI, new MockAIService());
  }

  isInitialized = true;
  log.info("Boot complete. Executive intelligence online.");
}
