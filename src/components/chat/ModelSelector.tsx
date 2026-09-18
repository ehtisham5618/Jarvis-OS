/**
 * ModelSelector
 *
 * Popover to select which AI model to use for the next message.
 * Fetches installed models from the ModelStore (or AI Store).
 */

import { useModelsStore } from "@/stores/models.store";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Cpu, ChevronDown, Check, Download, AlertTriangle } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeModel, setActiveModel, providerStatus } = useAIStore();

  const availableModels = useModelsStore((state) => state.models);
  const models = availableModels
    .filter((model) => model.installed && !model.embeddings)
    .map((model) => ({
      id: model.id,
      name: model.name,
      params: model.parameters,
      vram: `${model.vramRequired.toFixed(1)} GB`,
    }));

  const handleSelect = (modelId: string) => {
    setActiveModel(modelId);
    setIsOpen(false);
  };

  if (providerStatus === "offline") {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500/70"
      >
        <AlertTriangle className="size-3.5" />
        Ollama Offline
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
      >
        <Cpu className="size-3.5 text-[#61c7ff]" />
        {activeModel.split(":")[0]}
        <ChevronDown className="size-3 opacity-50 transition group-hover:opacity-100" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 bottom-full z-50 mb-2 w-64 origin-bottom-left rounded-xl border border-white/10 bg-[#0d0f12]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in-scale">
            <div className="mb-2 border-b border-white/10 px-3 pb-2 pt-1.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                Select Model
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-white/5"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      {m.name}
                      {activeModel === m.id && <Check className="size-3 text-[#4ade80]" />}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/40">
                      {m.params} params · {m.vram} VRAM
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-1 border-t border-white/10 pt-1">
              <Link
                to="/models"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#61c7ff] transition hover:bg-white/5"
              >
                <Download className="size-3.5" />
                Manage models
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
