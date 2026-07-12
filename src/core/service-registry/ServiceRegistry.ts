/**
 * Jarvis Dependency Injection Container
 *
 * A simple, strongly-typed IoC container.
 * Registers and resolves services across the platform.
 * Allows seamless switching between Mock and Real implementations.
 */

import { JarvisError } from "../errors";

export class ServiceRegistrationError extends JarvisError {
  constructor(message: string) {
    super(message, "SERVICE_REGISTRATION_FAILED", { module: "service-registry" });
    this.name = "ServiceRegistrationError";
  }
}

export class ServiceResolutionError extends JarvisError {
  constructor(message: string) {
    super(message, "SERVICE_RESOLUTION_FAILED", { module: "service-registry" });
    this.name = "ServiceResolutionError";
  }
}

class JarvisServiceRegistry {
  private readonly instances = new Map<symbol, unknown>();

  /**
   * Register a singleton instance for a given token.
   * Throws if the token is already registered.
   */
  register<T>(token: symbol, instance: T): void {
    if (this.instances.has(token)) {
      throw new ServiceRegistrationError(
        `Service already registered for token: ${token.toString()}`
      );
    }
    this.instances.set(token, instance);
  }

  /**
   * Resolve an instance for a given token.
   * Throws if no instance is registered.
   */
  resolve<T>(token: symbol): T {
    const instance = this.instances.get(token);
    if (!instance) {
      throw new ServiceResolutionError(
        `No service registered for token: ${token.toString()}`
      );
    }
    return instance as T;
  }

  /**
   * Safely attempt to resolve an instance.
   * Returns undefined if not registered.
   */
  tryResolve<T>(token: symbol): T | undefined {
    return this.instances.get(token) as T | undefined;
  }

  /**
   * Check if a token is registered.
   */
  has(token: symbol): boolean {
    return this.instances.has(token);
  }

  /**
   * Clear all registrations (useful for testing).
   */
  clear(): void {
    this.instances.clear();
  }
}

/** Singleton Service Registry */
export const serviceRegistry = new JarvisServiceRegistry();
