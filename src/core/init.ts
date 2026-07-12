import { serviceRegistry, ServiceToken } from "./service-registry";
import { MockSystemService } from "@/services/mock/MockSystemService";
import { MockAIService } from "@/services/mock/MockAIService";
import { MockModelService } from "@/services/mock/MockModelService";
import { ElectronSystemService } from "@/services/electron/ElectronSystemService";
import { OllamaService } from "@/services/ollama/OllamaService";
import { Logger } from "./logger";

const log = Logger.for("boot");

let isInitialized = false;

/**
 * Returns true when the renderer is running inside Electron.
 * Checks for the contextBridge-exposed `window.jarvisOS` object.
 */
function isRunningInElectron(): boolean {
  return typeof window !== "undefined" && "jarvisOS" in window;
}

export async function initializeJarvis(): Promise<void> {
  if (isInitialized) return;

  const inElectron = isRunningInElectron();

  log.info(`Booting Jarvis OS core... [host: ${inElectron ? "Electron" : "Browser"}]`);

  // ─── 1. System Service ──────────────────────────────────────────────────
  if (inElectron) {
    // Real Windows hardware data via IPC bridge
    log.info("Electron detected — wiring native system service.");
    serviceRegistry.register(ServiceToken.System, new ElectronSystemService());
  } else {
    // Browser dev mode — realistic simulation
    log.warn("Browser context — wiring mock system service.");
    serviceRegistry.register(ServiceToken.System, new MockSystemService());
  }

  // ─── 2. Model Service ───────────────────────────────────────────────────
  serviceRegistry.register(ServiceToken.Model, new MockModelService());

  // ─── 3. AI Service: Ollama → Mock fallback ──────────────────────────────
  const ollama = new OllamaService();
  const isOllamaUp = await ollama.isAvailable();

  if (isOllamaUp) {
    log.info("Ollama online — wiring real AI engine.");
    serviceRegistry.register(ServiceToken.AI, ollama);
  } else {
    log.warn("Ollama unreachable — wiring mock AI engine.");
    serviceRegistry.register(ServiceToken.AI, new MockAIService());
  }

  isInitialized = true;
  log.info("Boot complete. Executive intelligence online.");
}
