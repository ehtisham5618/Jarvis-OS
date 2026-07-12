/**
 * Jarvis Permission Engine — Types
 */

import type { AutonomyLevel } from "@/services/interfaces/IUserService";

export interface PermissionCheckRequest {
  capabilityId: string;
  requiredPermissions: string[];
  currentAutonomy: AutonomyLevel;
  isSandboxed: boolean;
}

export interface PermissionCheckResult {
  granted: boolean;
  denialReason?: string;
  failedPermission?: string;
}
