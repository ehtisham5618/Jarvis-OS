/**
 * ModelSelector
 *
 * Popover to select which AI model to use for the next message.
 * Fetches installed models from the ModelStore (or AI Store).
 */

import { useState } from "react";
import { Cpu, ChevronDown, Check, Download, AlertTriangle } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeModel, setActiveModel, providerStatus } = useAIStore();

  // For now, hardcode the models until M6 when we build the full Model Router.
  // We'll assume the user has these installed in Ollama.
  const models = [
    { id: "llama3.1:8b", name: "Llama 3.1", size: "8B", params: "8.0B", vram: "6 GB" },
    { id: "llama3.1:70b", name: "Llama 3.1 70B", size: "70B", params: "70.5B", vram: "40 GB" },
    { id: "phi3:mini", name: "Phi-3 Mini", size: "3.8B", params: "3.8B", vram: "4 GB" },
    { id: "mistral:latest", name: "Mistral", size: "7B", params: "7.2B", vram: "5 GB" },
    { id: "llava:latest", name: "Llava (Vision)", size: "7B", params: "7.1B", vram: "6 GB" },
  ];

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
          <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-white/10 bg-[#0d0f12]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in-scale">
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
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#61c7ff] transition hover:bg-white/5">
                <Download className="size-3.5" />
                Manage models
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
