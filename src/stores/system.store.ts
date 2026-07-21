import { create } from "zustand";
import type { SystemMetrics, ProcessInfo } from "@/services/interfaces/ISystemService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";

interface SystemState {
  metrics: SystemMetrics | null;
  processes: ProcessInfo[];
  isPolling: boolean;

  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  refreshNow: () => Promise<void>;
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useSystemStore = create<SystemState>()((set, get) => ({
  metrics: null,
  processes: [],
  isPolling: false,

  startPolling: (intervalMs = 1500) => {
    if (pollTimer) return;

    set({ isPolling: true });

    // Initial fetch
    get().refreshNow();

    // Poll
    pollTimer = setInterval(() => {
      get().refreshNow();
    }, intervalMs);
  },

  stopPolling: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    set({ isPolling: false });
  },

  refreshNow: async () => {
    try {
      const systemService = serviceRegistry.resolve<
        import("@/services/interfaces/ISystemService").ISystemService
      >(ServiceToken.System);
      const [metrics, processes] = await Promise.all([
        systemService.getMetrics(),
        systemService.getProcesses(),
      ]);
      set({ metrics, processes });
    } catch (err) {
      console.error("Failed to fetch system metrics", err);
    }
  },
}));
