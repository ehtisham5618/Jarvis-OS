/**
 * Jarvis Structured Logger
 *
 * A singleton logger with:
 * - Configurable log levels
 * - Module context tagging (every log knows where it came from)
 * - Structured JSON output for future log aggregation
 * - Colored browser console output in development
 * - Silent mode for testing
 *
 * Usage:
 *   const log = Logger.for("ollama-service");
 *   log.info("Connected", { host: "localhost:11434" });
 *   log.error("Failed to stream", { error });
 */

import { LogLevel, LogLevelColor, LogLevelName } from "./LogLevel";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
}

export type LogTransport = (entry: LogEntry) => void;

class JarvisLogger {
  private level: LogLevel = LogLevel.DEBUG;
  private transports: LogTransport[] = [];

  constructor() {
    // Default: console transport
    this.transports.push(this.consoleTransport.bind(this));
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Returns a module-scoped child logger.
   * All logs emitted through this child are tagged with the module name.
   */
  for(module: string): ModuleLogger {
    return new ModuleLogger(this, module);
  }

  emit(entry: LogEntry): void {
    if (entry.level < this.level) return;
    for (const transport of this.transports) {
      transport(entry);
    }
  }

  private consoleTransport(entry: LogEntry): void {
    const color = LogLevelColor[entry.level];
    const levelName = LogLevelName[entry.level];
    const prefix = `%c[${levelName}]%c [${entry.module}]`;
    const styleLevel = `color: ${color}; font-weight: bold;`;
    const styleModule = "color: #b7bdc8; font-weight: normal;";

    const args: unknown[] = [prefix, styleLevel, styleModule, entry.message];
    if (entry.data && Object.keys(entry.data).length > 0) {
      args.push(entry.data);
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
    }
  }
}

/**
 * A logger bound to a specific module. Created via Logger.for("module-name").
 */
export class ModuleLogger {
  constructor(
    private readonly parent: JarvisLogger,
    private readonly module: string,
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.emit(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.emit(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.emit(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.emit(LogLevel.ERROR, message, data);
  }

  /** Create a child logger with a sub-module name */
  child(subModule: string): ModuleLogger {
    return new ModuleLogger(this.parent, `${this.module}:${subModule}`);
  }

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    this.parent.emit({
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
    });
  }
}

/** Singleton logger instance — use this throughout the application */
export const Logger = new JarvisLogger();
