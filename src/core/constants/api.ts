/**
 * Jarvis API Endpoint Constants
 *
 * All external and internal API URLs.
 * Never hardcode URLs in service implementations — import from here.
 */

export const OllamaApi = {
  /** Default Ollama host — overridable via ConfigManager */
  defaultHost: "http://localhost:11434",

  endpoints: {
    health: "/",
    tags: "/api/tags",
    chat: "/api/chat",
    generate: "/api/generate",
    embeddings: "/api/embeddings",
    modelInfo: "/api/show",
    pull: "/api/pull",
    delete: "/api/delete",
    running: "/api/ps",
  },
} as const;

export const JarvisApi = {
  /** Base path for any future Jarvis backend service */
  defaultHost: "http://localhost:7474",

  endpoints: {
    health: "/health",
    telemetry: "/api/telemetry",
    memory: "/api/memory",
    search: "/api/search",
    embed: "/api/embed",
  },
} as const;

/** localStorage / sessionStorage keys */
export const StorageKeys = {
  userProfile: "jarvis:user:profile",
  setupComplete: "jarvis:setup:complete",
  setupVersion: "jarvis:setup:version",
  ollamaHost: "jarvis:ollama:host",
  activeModel: "jarvis:ai:activeModel",
  conversationHistory: "jarvis:ai:conversations",
  systemPreferences: "jarvis:prefs:system",
} as const;

/** Current setup wizard version — increment to force re-onboarding on breaking changes */
export const SETUP_VERSION = 1;
