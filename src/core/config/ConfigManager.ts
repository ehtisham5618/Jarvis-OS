/**
 * Jarvis Config Manager
 *
 * Provides typed, validated configuration based on the environment.
 */

import { ConfigSchema, type JarvisConfig } from "./ConfigSchema";
import { Logger, LogLevel } from "../logger";

const log = Logger.for("config");

class JarvisConfigManager {
  private config: JarvisConfig;

  constructor() {
    this.config = this.loadConfig();
    this.applyConfig(this.config);
  }

  /** Get the current configuration */
  get(): JarvisConfig {
    return this.config;
  }

  /** Update configuration at runtime (e.g., from settings UI) */
  update(partial: Partial<JarvisConfig>): void {
    const updated = { ...this.config, ...partial };
    
    // Validate
    const result = ConfigSchema.safeParse(updated);
    if (!result.success) {
      log.error("Invalid configuration update", { errors: result.error.format() });
      throw new Error("Invalid configuration update");
    }

    this.config = result.data;
    this.applyConfig(this.config);
    log.info("Configuration updated");
  }

  private loadConfig(): JarvisConfig {
    // In a real app, this would merge process.env, localStorage, and defaults
    const isElectron = typeof window !== "undefined" && window.navigator.userAgent.includes("Electron");
    
    const rawConfig = {
      env: import.meta.env?.MODE ?? "development",
      isElectron,
      // Attempt to load saved Ollama host from storage, otherwise use default
      ollama: {
        host: typeof localStorage !== "undefined" 
          ? localStorage.getItem("jarvis:ollama:host") ?? "http://localhost:11434"
          : "http://localhost:11434",
        timeoutMs: 5000,
      }
    };

    const result = ConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      // If default parse fails, something is fundamentally wrong with the schema defaults
      console.error("CRITICAL: Default configuration failed validation", result.error);
      throw new Error("Configuration validation failed on boot");
    }

    return result.data;
  }

  private applyConfig(config: JarvisConfig): void {
    // Apply log level
    switch (config.telemetry.logLevel) {
      case "DEBUG": Logger.setLevel(LogLevel.DEBUG); break;
      case "INFO": Logger.setLevel(LogLevel.INFO); break;
      case "WARN": Logger.setLevel(LogLevel.WARN); break;
      case "ERROR": Logger.setLevel(LogLevel.ERROR); break;
      case "SILENT": Logger.setLevel(LogLevel.SILENT); break;
    }
  }
}

export const configManager = new JarvisConfigManager();
