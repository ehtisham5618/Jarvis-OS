import { JarvisError, type JarvisErrorContext } from "./JarvisError";

/**
 * Thrown when a service is unavailable or a service call fails.
 * Examples: Ollama offline, SQLite locked, indexing service crashed.
 */
export class ServiceError extends JarvisError {
  public readonly serviceName: string;
  public readonly isTransient: boolean;

  constructor(
    message: string,
    serviceName: string,
    options: JarvisErrorContext & { isTransient?: boolean } = {},
  ) {
    const { isTransient = true, ...context } = options;
    super(message, `SERVICE_${serviceName.toUpperCase().replace(/-/g, "_")}_ERROR`, {
      ...context,
      module: context.module ?? `service:${serviceName}`,
    });
    this.name = "ServiceError";
    this.serviceName = serviceName;
    this.isTransient = isTransient;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown specifically when a service is completely unavailable / unreachable.
 */
export class ServiceUnavailableError extends ServiceError {
  constructor(serviceName: string, context: JarvisErrorContext = {}) {
    super(
      `Service "${serviceName}" is currently unavailable.`,
      serviceName,
      { ...context, isTransient: true },
    );
    this.name = "ServiceUnavailableError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
