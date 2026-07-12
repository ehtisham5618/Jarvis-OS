/**
 * Capability Engine — Capability Registry
 *
 * Registers and resolves capabilities by ID.
 * This is the central hub where the Planner sends execution requests.
 */

import { JarvisError } from "../errors";
import { BaseCapability } from "../../capabilities/base/BaseCapability";

export class CapabilityRegistrationError extends JarvisError {
  constructor(message: string) {
    super(message, "CAPABILITY_REGISTRATION_FAILED", { module: "capability-registry" });
    this.name = "CapabilityRegistrationError";
  }
}

export class CapabilityNotFoundError extends JarvisError {
  constructor(message: string) {
    super(message, "CAPABILITY_NOT_FOUND", { module: "capability-registry" });
    this.name = "CapabilityNotFoundError";
  }
}

class JarvisCapabilityRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly capabilities = new Map<string, BaseCapability<any, any>>();

  /**
   * Register a capability instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(capability: BaseCapability<any, any>): void {
    if (this.capabilities.has(capability.id)) {
      throw new CapabilityRegistrationError(`Capability already registered: ${capability.id}`);
    }
    this.capabilities.set(capability.id, capability);
  }

  /**
   * Resolve a capability by its ID.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve<TInput = any, TOutput = any>(id: string): BaseCapability<TInput, TOutput> {
    const cap = this.capabilities.get(id);
    if (!cap) {
      throw new CapabilityNotFoundError(`Capability not found: ${id}`);
    }
    return cap as BaseCapability<TInput, TOutput>;
  }

  /**
   * Get all registered capability definitions.
   * Useful for the Planner to know what the system is capable of.
   */
  getAvailableCapabilities(): Array<{ id: string; description: string }> {
    return Array.from(this.capabilities.values()).map((cap) => ({
      id: cap.id,
      description: cap.description,
    }));
  }
}

export const capabilityRegistry = new JarvisCapabilityRegistry();
