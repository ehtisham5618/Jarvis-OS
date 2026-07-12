import { create } from "zustand";
import type { ModelRecord } from "@/services/interfaces/IModelService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { Logger } from "@/core/logger";

const log = Logger.for("models.store");

interface ModelsState {
  models: ModelRecord[];
  isLoading: boolean;
  installProgress: Record<string, number>; // modelId -> progress 0-100
  
  fetchModels: () => Promise<void>;
  installModel: (id: string) => Promise<void>;
}

export const useModelsStore = create<ModelsState>()((set) => ({
  models: [],
  isLoading: false,
  installProgress: {},

  fetchModels: async () => {
    set({ isLoading: true });
    try {
      const modelService = serviceRegistry.resolve<import("@/services/interfaces/IModelService").IModelService>(ServiceToken.Model);
      const models = await modelService.getModels();
      set({ models, isLoading: false });
    } catch (err) {
      log.error("Failed to fetch models", { error: err });
      set({ isLoading: false });
    }
  },

  installModel: async (id: string) => {
    set((state) => ({ installProgress: { ...state.installProgress, [id]: 0 } }));
    try {
      const modelService = serviceRegistry.resolve<import("@/services/interfaces/IModelService").IModelService>(ServiceToken.Model);
      // In a real implementation, this would emit events for progress
      await modelService.installModel(id);
      
      // Update local state to show as installed
      set((state) => {
        const newProgress = { ...state.installProgress };
        delete newProgress[id];
        
        return {
          installProgress: newProgress,
          models: state.models.map(m => m.id === id ? { ...m, installed: true, installedAt: new Date().toISOString() } : m)
        };
      });
    } catch (err) {
      log.error("Failed to install model", { modelId: id, error: err });
      set((state) => {
        const newProgress = { ...state.installProgress };
        delete newProgress[id];
        return { installProgress: newProgress };
      });
    }
  },
}));
