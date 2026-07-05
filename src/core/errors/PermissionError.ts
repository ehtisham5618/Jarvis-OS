import { JarvisError, type JarvisErrorContext } from "./JarvisError";

/**
 * Permission denial reasons.
 */
export type PermissionDenialReason =
  | "AUTONOMY_LEVEL_INSUFFICIENT"
  | "USER_DENIED"
  | "CAPABILITY_NOT_DECLARED"
  | "SANDBOXED_CONTEXT"
  | "RATE_LIMITED";

/**
 * Thrown when the Permission Engine blocks a capability execution.
 */
export class PermissionError extends JarvisError {
  public readonly capabilityId: string;
  public readonly requiredPermission: string;
  public readonly denialReason: PermissionDenialReason;

  constructor(
    capabilityId: string,
    requiredPermission: string,
    denialReason: PermissionDenialReason,
    context: JarvisErrorContext = {},
  ) {
    super(
      `Permission denied for capability "${capabilityId}": ${requiredPermission} — ${denialReason}`,
      "PERMISSION_DENIED",
      {
        ...context,
        module: context.module ?? "permission-engine",
        metadata: {
          ...context.metadata,
          capabilityId,
          requiredPermission,
          denialReason,
        },
      },
    );
    this.name = "PermissionError";
    this.capabilityId = capabilityId;
    this.requiredPermission = requiredPermission;
    this.denialReason = denialReason;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
