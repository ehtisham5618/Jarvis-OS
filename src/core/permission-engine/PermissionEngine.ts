/**
 * Jarvis Permission Engine
 *
 * Enforces autonomy levels and capability permissions.
 * All capabilities MUST pass through this engine before executing.
 */

import type { AutonomyLevel } from "@/services/interfaces/IUserService";
import type { PermissionCheckRequest, PermissionCheckResult } from "./PermissionTypes";
import { PermissionError } from "../errors";
import type { CapabilityContext } from "../../capabilities/base/CapabilityContext";

const AUTONOMY_HIERARCHY: Record<AutonomyLevel, number> = {
  observe: 0, // Can only read data, no mutations
  assist: 1, // Can mutate data, but prompts for confirmation on destructive actions
  trusted: 2, // Can perform most actions without prompting
  power: 3, // Full system access, including registry and system files
};

/**
 * Mapping of permissions to the minimum autonomy level required to execute them without
 * explicit user interaction. (In a full implementation, this would be more complex and
 * handle explicit grants, but this serves Phase 1).
 */
const PERMISSION_REQUIREMENTS: Record<string, AutonomyLevel> = {
  "system.read": "observe",
  "system.write": "power",
  "ai.chat": "observe",
  "ai.manage": "assist",
  "memory.read": "observe",
  "memory.write": "assist",
  "file.read": "observe",
  "file.write": "trusted",
  "process.kill": "power",
};

export class JarvisPermissionEngine {
  /**
   * Evaluates if a capability is allowed to run.
   * Throws a PermissionError if denied.
   */
  enforce(request: PermissionCheckRequest): void {
    const result = this.check(request);

    if (!result.granted) {
      throw new PermissionError(
        request.capabilityId,
        result.failedPermission ?? "unknown",
        // Cast is safe here because we know denialReason is populated when granted=false
        (result.denialReason as any) ?? "AUTONOMY_LEVEL_INSUFFICIENT",
      );
    }
  }

  /**
   * Non-throwing permission check.
   */
  check(request: PermissionCheckRequest): PermissionCheckResult {
    const userLevelValue = AUTONOMY_HIERARCHY[request.currentAutonomy];

    for (const reqPerm of request.requiredPermissions) {
      // 1. Check sandbox
      // For Phase 1, we assume sandboxed environments cannot have write access
      if (request.isSandboxed && reqPerm.includes(".write")) {
        return {
          granted: false,
          denialReason: "SANDBOXED_CONTEXT",
          failedPermission: reqPerm,
        };
      }

      // 2. Check capability registry declaration
      const requiredLevel = PERMISSION_REQUIREMENTS[reqPerm];
      if (!requiredLevel) {
        return {
          granted: false,
          denialReason: "CAPABILITY_NOT_DECLARED",
          failedPermission: reqPerm,
        };
      }

      // 3. Check user autonomy level
      const requiredLevelValue = AUTONOMY_HIERARCHY[requiredLevel];
      if (userLevelValue < requiredLevelValue) {
        return {
          granted: false,
          denialReason: "AUTONOMY_LEVEL_INSUFFICIENT",
          failedPermission: reqPerm,
        };
      }
    }

    return { granted: true };
  }
}

export const permissionEngine = new JarvisPermissionEngine();
