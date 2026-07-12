import { BaseCapability } from "../base/BaseCapability";
import type { CapabilityContext } from "../base/CapabilityContext";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { ISystemService, SystemMetrics } from "@/services/interfaces/ISystemService";

export interface SystemCapabilityInput {
  action: "get_metrics" | "get_processes";
}

export type SystemCapabilityOutput = SystemMetrics | unknown; // expanded in future

export class SystemCapability extends BaseCapability<SystemCapabilityInput, SystemCapabilityOutput> {
  readonly id = "system:info";
  readonly description = "Retrieves live telemetry and hardware metrics from the system.";
  readonly requiredPermissions = ["system.read"];

  protected async performExecute(
    input: SystemCapabilityInput,
    _context: CapabilityContext,
  ): Promise<SystemCapabilityOutput> {
    const systemService = serviceRegistry.resolve<ISystemService>(ServiceToken.System);

    switch (input.action) {
      case "get_metrics":
        return await systemService.getMetrics();
      case "get_processes":
        return await systemService.getProcesses();
      default:
        throw new Error(`Unknown system action: ${input.action}`);
    }
  }
}
