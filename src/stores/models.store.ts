import { create } from "zustand";
import type { ModelRecord, ModelBenchmark } from "@/services/interfaces/IModelService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { computeSuitability } from "@/core/model-router/HardwareSuitability";
import { runBenchmark, type BenchmarkProgress } from "@/core/model-router/Benchmarker";
import { Logger } from "@/core/logger";

const log = Logger.for("models.store");

interface ModelsState {
  models: ModelRecord[];
  isLoading: boolean;
  autoRoute: boolean;
  installProgress: Record<string, number>;
  benchmarkProgress: Record<string, BenchmarkProgress>;

  fetchModels: () => Promise<void>;
  installModel: (id: string) => Promise<void>;
  uninstallModel: (id: string) => Promise<void>;
  runBenchmark: (modelId: string) => Promise<void>;
  runAllBenchmarks: () => Promise<void>;
  setAutoRoute: (value: boolean) => void;
}

export const useModelsStore = create<ModelsState>()((set, get) => ({
  models: [],
  isLoading: false,
  autoRoute: true,
  installProgress: {},
  benchmarkProgress: {},

  // ─── Fetch & enrich with suitability ────────────────────────────────────────
  fetchModels: async () => {
    set({ isLoading: true });
    try {
      const modelService = serviceRegistry.resolve<
        import("@/services/interfaces/IModelService").IModelService
      >(ServiceToken.Model);
      const systemService = serviceRegistry.resolve<
        import("@/services/interfaces/ISystemService").ISystemService
      >(ServiceToken.System);

      const [rawModels, metrics] = await Promise.all([
        modelService.getModels(),
        systemService.getMetrics(),
      ]);

      // Compute suitability for each model
      const models = rawModels.map((m) => {
        const result = computeSuitability(m, metrics);
        return {
          ...m,
          suitableForCurrentHardware: result.mode !== "insufficient",
          suitabilityReason: result.reason,
        } satisfies ModelRecord;
      });

      set({ models, isLoading: false });
    } catch (err) {
      log.error("Failed to fetch models", { error: err });
      set({ isLoading: false });
    }
  },

  // ─── Install ─────────────────────────────────────────────────────────────────
  installModel: async (id: string) => {
    set((state) => ({ installProgress: { ...state.installProgress, [id]: 0 } }));
    try {
      const modelService = serviceRegistry.resolve<
        import("@/services/interfaces/IModelService").IModelService
      >(ServiceToken.Model);
      await modelService.installModel(id);
      set((state) => {
        const newProgress = { ...state.installProgress };
        delete newProgress[id];
        return {
          installProgress: newProgress,
          models: state.models.map((m) =>
            m.id === id ? { ...m, installed: true, installedAt: new Date().toISOString() } : m,
          ),
        };
      });
    } catch (err) {
      log.error("Failed to install model", { modelId: id, error: err });
      set((state) => {
        const p = { ...state.installProgress };
        delete p[id];
        return { installProgress: p };
      });
    }
  },

  // ─── Uninstall ────────────────────────────────────────────────────────────────
  uninstallModel: async (id: string) => {
    try {
      const modelService = serviceRegistry.resolve<
        import("@/services/interfaces/IModelService").IModelService
      >(ServiceToken.Model);
      await modelService.uninstallModel(id);
      set((state) => ({
        models: state.models.map((m) => (m.id === id ? { ...m, installed: false } : m)),
      }));
    } catch (err) {
      log.error("Failed to uninstall model", { modelId: id, error: err });
    }
  },

  // ─── Benchmark single model ───────────────────────────────────────────────────
  runBenchmark: async (modelId: string) => {
    const aiService = serviceRegistry.resolve<
      import("@/services/interfaces/IAIService").IAIService
    >(ServiceToken.AI);

    set((state) => ({
      benchmarkProgress: {
        ...state.benchmarkProgress,
        [modelId]: { stage: "speed", progressPercent: 0 },
      },
    }));

    try {
      const result: ModelBenchmark = await runBenchmark(
        modelId,
        aiService,
        (progress: BenchmarkProgress) => {
          set((state) => ({
            benchmarkProgress: { ...state.benchmarkProgress, [modelId]: progress },
          }));
        },
      );

      set((state) => {
        const newProgress = { ...state.benchmarkProgress };
        delete newProgress[modelId];
        return {
          benchmarkProgress: newProgress,
          models: state.models.map((m) => (m.id === modelId ? { ...m, benchmark: result } : m)),
        };
      });

      log.info(`Benchmark complete for ${modelId}`, result as unknown as Record<string, unknown>);
    } catch (err) {
      log.error("Benchmark failed", { modelId, error: err });
      set((state) => {
        const p = { ...state.benchmarkProgress };
        delete p[modelId];
        return { benchmarkProgress: p };
      });
    }
  },

  // ─── Benchmark all installed models sequentially ──────────────────────────────
  runAllBenchmarks: async () => {
    const { models, runBenchmark: bench } = get();
    const installed = models.filter((m) => m.installed);
    for (const m of installed) {
      await bench(m.id);
    }
  },

  setAutoRoute: (value) => set({ autoRoute: value }),
}));
