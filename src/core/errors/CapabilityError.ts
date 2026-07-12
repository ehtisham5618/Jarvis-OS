import { JarvisError, type JarvisErrorContext } from "./JarvisError";

/**
 * Thrown when a capability execution fails.
 * Examples: file not found, process already killed, command rejected.
 */
export class CapabilityError extends JarvisError {
  public readonly capabilityId: string;

  constructor(
    message: string,
    capabilityId: string,
    context: JarvisErrorContext = {},
  ) {
    super(message, `CAPABILITY_${capabilityId.toUpperCase().replace(/-/g, "_")}_FAILED`, {
      ...context,
      module: context.module ?? `capability:${capabilityId}`,
    });
    this.name = "CapabilityError";
    this.capabilityId = capabilityId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
