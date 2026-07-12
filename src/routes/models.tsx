import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Download, Check, Eye, Code2, Brain, Sparkles } from "lucide-react";
import { useModelsStore } from "@/stores/models.store";
import { useEffect } from "react";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model Manager · Jarvis" },
      { name: "description", content: "Every AI model, benchmarked, tuned, one click away." },
    ],
  }),
  component: Models,
});

const models = [
  {
    name: "Llama 3.1", variant: "70B Instruct", dev: "Meta",
    params: "70B", vram: "42 GB", ram: "48 GB", speed: "34 tok/s",
    coding: 92, reasoning: 89, vision: false,
    installed: true, active: true, recommended: true,
    accent: "#4f7dff",
  },
  {
    name: "Qwen 2.5", variant: "Coder 32B", dev: "Alibaba",
    params: "32B", vram: "22 GB", ram: "32 GB", speed: "58 tok/s",
    coding: 96, reasoning: 84, vision: false,
    installed: true, active: false, recommended: false,
    accent: "#7b5cff",
  },
  {
    name: "Gemma 3", variant: "27B Vision", dev: "Google",
    params: "27B", vram: "18 GB", ram: "28 GB", speed: "62 tok/s",
    coding: 78, reasoning: 82, vision: true,
    installed: true, active: false, recommended: false,
    accent: "#61c7ff",
  },
  {
    name: "DeepSeek R1", variant: "Distill 70B", dev: "DeepSeek",
    params: "70B", vram: "48 GB", ram: "56 GB", speed: "22 tok/s",
    coding: 90, reasoning: 97, vision: false,
    installed: false, active: false, recommended: true,
    accent: "#4ade80",
  },
  {
    name: "Mistral", variant: "Small 24B", dev: "Mistral AI",
    params: "24B", vram: "16 GB", ram: "24 GB", speed: "74 tok/s",
    coding: 82, reasoning: 79, vision: false,
    installed: false, active: false, recommended: false,
    accent: "#fbbf24",
  },
  {
    name: "Phi 4", variant: "Mini Reasoning", dev: "Microsoft",
    params: "14B", vram: "10 GB", ram: "16 GB", speed: "112 tok/s",
    coding: 74, reasoning: 88, vision: false,
    installed: false, active: false, recommended: false,
    accent: "#f87171",
  },
];

function Models() {
  const { models, fetchModels, installModel, installProgress } = useModelsStore();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <PageHeader
          eyebrow="Intelligence layer"
          title="Model Manager"
          subtitle="Local, private, benchmarked. Swap the brain running Jarvis in one click."
        />

        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: "Installed", value: models.filter(m => m.installed).length.toString(), color: "#4f7dff" },
            { label: "Total VRAM", value: `${models.reduce((acc, m) => m.installed ? acc + m.vramRequired : acc, 0)} GB`, color: "#7b5cff" },
            { label: "Avg speed", value: "51 tok/s", color: "#61c7ff" },
            { label: "Storage", value: "184 GB", color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div
                className="mt-2 text-3xl font-light tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {models.map((m, i) => (
            <div
              key={m.id}
              className="group animate-fade-in-scale relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/15"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-24 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at 30% 0%, #4f7dff55, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{m.name}</h3>
                      {/* m.active could come from ai.store, but we mock it for now */}
                      {m.installed && (
                        <span className="rounded-full bg-[#4ade80]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[#4ade80]">
                          Installed
                        </span>
                      )}
                      {m.recommended && (
                        <span className="rounded-full bg-[#61c7ff]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[#61c7ff]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.variant} · {m.developer}
                    </div>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-white/[0.05]">
                    <Sparkles
                      className="size-4 text-[#4f7dff]"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                  {[
                    { l: "PARAMS", v: m.parameters },
                    { l: "VRAM", v: `${m.vramRequired} GB` },
                    { l: "RAM", v: `${m.ramRequired} GB` },
                    { l: "SPEED", v: m.benchmark?.speedTokensPerSec ? `${Math.round(m.benchmark.speedTokensPerSec)} tok/s` : "—" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/[0.03] p-2.5">
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {s.l}
                      </div>
                      <div className="mt-1 text-xs font-mono">{s.v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2.5">
                  <Score label="Coding" icon={Code2} value={m.benchmark?.codingScore || 80} color="#61c7ff" />
                  <Score label="Reasoning" icon={Brain} value={m.benchmark?.reasoningScore || 80} color="#7b5cff" />
                  <div className="flex items-center gap-2 text-[11px]">
                    <Eye className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Vision</span>
                    <span
                      className={
                        m.vision ? "text-[#4ade80]" : "text-muted-foreground/60"
                      }
                    >
                      {m.vision ? "Supported" : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  {m.installed ? (
                    <button
                      className={`w-full rounded-xl border py-2.5 text-xs font-medium transition border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.1]`}
                    >
                      "Switch to this model"
                    </button>
                  ) : (
                    <button 
                      onClick={() => installModel(m.id)}
                      disabled={installProgress[m.id] !== undefined}
                      className="w-full rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] py-2.5 text-xs font-medium shadow-[0_10px_30px_-10px_rgba(79,125,255,0.5)] transition hover:brightness-110 disabled:opacity-50"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {installProgress[m.id] !== undefined ? (
                          <span className="flex items-center gap-2">
                            <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Installing...
                          </span>
                        ) : (
                          <>
                            <Download className="size-3.5" /> Install
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}

function Score({
  label, icon: Icon, value, color,
}: { label: string; icon: React.ComponentType<{ className?: string }>; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px]">
      <Icon className="size-3 text-muted-foreground" />
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
      <span className="w-8 text-right font-mono tabular-nums text-white/80">{value}</span>
    </div>
  );
}
