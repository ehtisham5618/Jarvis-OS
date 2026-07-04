/**
 * Jarvis Dependency Injection — Service Tokens
 *
 * We use unique Symbol tokens for dependency injection.
 * This avoids circular dependencies and string typo bugs.
 */

export const ServiceToken = {
  System: Symbol.for("jarvis.service.system"),
  AI: Symbol.for("jarvis.service.ai"),
  Memory: Symbol.for("jarvis.service.memory"),
  Model: Symbol.for("jarvis.service.model"),
  User: Symbol.for("jarvis.service.user"),
  Automation: Symbol.for("jarvis.service.automation"),
  Windows: Symbol.for("jarvis.service.windows"),
  Voice: Symbol.for("jarvis.service.voice"),
} as const;
