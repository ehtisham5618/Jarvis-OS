/**
 * Jarvis Configuration Schema
 */
import { z } from "zod";

export const ConfigSchema = z.object({
  // Environment
  env: z.enum(["development", "production", "test"]).default("development"),
  isElectron: z.boolean().default(false),

  // Ollama
  ollama: z.object({
    host: z.string().url().default("http://localhost:11434"),
    timeoutMs: z.number().positive().default(5000),
  }).default({}),

  // Features
  features: z.object({
    enableMemory: z.boolean().default(true),
    enablePlugins: z.boolean().default(false), // Disabled in Phase 1
    enableVoice: z.boolean().default(false),   // Disabled in Phase 1
  }).default({}),

  // Telemetry (Internal platform telemetry, not user data)
  telemetry: z.object({
    logLevel: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "SILENT"]).default("INFO"),
  }).default({}),
});

export type JarvisConfig = z.infer<typeof ConfigSchema>;
