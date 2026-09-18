import { create } from "zustand";
import type {
  SystemMetrics,
  ProcessInfo,
  ISystemService,
} from "@/services/interfaces/ISystemService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";

interface SystemState {
  metrics: SystemMetrics | null;
  processes: ProcessInfo[];
  isPolling: boolean;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  refreshNow: () => Promise<void>;
}
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers = 0;
let generation = 0;
let pending: Promise<void> | null = null;

export const useSystemStore = create<SystemState>()((set, get) => ({
  metrics: null,
  processes: [],
  isPolling: false,
  startPolling: (intervalMs = 3000) => {
    subscribers++;
    if (subscribers > 1) return;
    const current = ++generation;
    set({ isPolling: true });
    const poll = async () => {
      await get().refreshNow();
      if (subscribers > 0 && generation === current) {
        pollTimer = setTimeout(poll, Math.max(3000, intervalMs));
      }
    };
    void poll();
  },
  stopPolling: () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers > 0) return;
    generation++;
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = null;
    set({ isPolling: false });
  },
  refreshNow: () => {
    if (pending) return pending;
    pending = (async () => {
      try {
        const service = serviceRegistry.resolve<ISystemService>(ServiceToken.System);
        await Promise.all([
          service.getMetrics().then((metrics) => set({ metrics })),
          service.getProcesses().then((processes) => set({ processes })),
        ]);
      } catch (error) {
        console.error("[hardware] Metrics unavailable", error);
      }
    })().finally(() => {
      pending = null;
    });
    return pending;
  },
}));
