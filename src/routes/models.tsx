import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Download,
  Trash2,
  Eye,
  Code2,
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  BarChart3,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useModelsStore } from "@/stores/models.store";
import { useEffect } from "react";
import type { ModelRecord } from "@/services/interfaces/IModelService";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model Manager · Jarvis" },
      { name: "description", content: "Every AI model, benchmarked, tuned, and hardware-aware." },
    ],
  }),
  component: Models,
});

function SuitabilityBadge({ model }: { model: ModelRecord }) {
  if (!model.installed) return null;

  const reason = model.suitabilityReason ?? "";

  if (model.suitableForCurrentHardware === false) {
    return (
      <span
        title={reason}
        className="flex cursor-help items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-red-400"
      >
        <XCircle className="size-2.5" /> Insufficient
      </span>
    );
  }

  if (reason.includes("GPU")) {
    return (
      <span
        title={reason}
        className="flex cursor-help items-center gap-1 rounded-full bg-[#4ade80]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[#4ade80]"
      >
        <CheckCircle2 className="size-2.5" /> GPU Ready
      </span>
    );
  }

  return (
    <span
      title={reason}
      className="flex cursor-help items-center gap-1 rounded-full bg-[#fbbf24]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[#fbbf24]"
    >
      <AlertCircle className="size-2.5" /> CPU Only
    </span>
  );
}

function BenchmarkButton({ model }: { model: ModelRecord }) {
  const { runBenchmark, benchmarkProgress } = useModelsStore();
  const progress = benchmarkProgress[model.id];

  if (progress) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/50">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-[#4f7dff] transition-all duration-500"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <span className="w-16 capitalize">{progress.stage}…</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => runBenchmark(model.id)}
      className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-[#61c7ff]"
    >
      <PlayCircle className="size-3.5" />
      {model.benchmark ? "Re-benchmark" : "Run Benchmark"}
    </button>
  );
}

function Models() {
  const {
    models,
    isLoading,
    fetchModels,
    installModel,
    uninstallModel,
    installProgress,
    runAllBenchmarks,
    autoRoute,
    setAutoRoute,
  } = useModelsStore();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const installed = models.filter((m) => m.installed);
  const available = models.filter((m) => !m.installed);

  const totalVram = installed.reduce((acc, m) => acc + m.vramRequired, 0);
  const avgSpeed = installed
    .filter((m) => m.benchmark?.speedTokensPerSec)
    .reduce((acc, m, _, arr) => acc + m.benchmark!.speedTokensPerSec / arr.length, 0);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <div className="flex items-end justify-between mb-10">
          <PageHeader
            eyebrow="Intelligence layer"
            title="Model Manager"
            subtitle="Local, private, benchmarked. Swap the brain running Jarvis in one click."
          />
          <button
            onClick={runAllBenchmarks}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white/70 transition hover:border-[#4f7dff]/40 hover:text-[#4f7dff]"
          >
            <BarChart3 className="size-4" />
            Benchmark All
          </button>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: "Installed", value: installed.length.toString(), color: "#4f7dff" },
            { label: "Total VRAM", value: `${totalVram} GB`, color: "#7b5cff" },
            {
              label: "Avg Speed",
              value: avgSpeed > 0 ? `${avgSpeed.toFixed(0)} tok/s` : "—",
              color: "#61c7ff",
            },
            { label: "Catalog", value: models.length.toString(), color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 text-3xl font-light tabular-nums" style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Section 1: Installed Models ─────────────────────────────────────── */}
        {installed.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">
                Installed Models
              </h2>
              <div className="h-px flex-1 bg-white/[0.04]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {installed.map((m, i) => (
                <ModelCard key={m.id} model={m} idx={i} onUninstall={() => uninstallModel(m.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 2: Available Models ─────────────────────────────────────── */}
        {available.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">
                Available Models
              </h2>
              <div className="h-px flex-1 bg-white/[0.04]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {available.map((m, i) => (
                <div
                  key={m.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">{m.name}</h3>
                        {m.recommended && (
                          <span className="rounded-full bg-[#61c7ff]/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#61c7ff]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-white/40">
                        {m.variant} · {m.developer} · {m.parameters}
                      </div>
                    </div>
                    <div className="grid size-9 place-items-center rounded-xl bg-white/[0.05]">
                      <Sparkles className="size-3.5 text-[#4f7dff]" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { l: "VRAM", v: `${m.vramRequired} GB` },
                      { l: "RAM", v: `${m.ramRequired} GB` },
                      { l: "CONTEXT", v: `${(m.contextLength / 1000).toFixed(0)}K` },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl bg-white/[0.03] p-2">
                        <div className="text-[8px] uppercase tracking-widest text-white/30">
                          {s.l}
                        </div>
                        <div className="mt-0.5 font-mono text-white/70">{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => installModel(m.id)}
                    disabled={installProgress[m.id] !== undefined}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] py-2 text-xs font-medium transition hover:brightness-110 disabled:opacity-50"
                  >
                    {installProgress[m.id] !== undefined ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                        Installing…
                      </>
                    ) : (
                      <>
                        <Download className="size-3.5" /> Install
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Section 3: Model Router Status ──────────────────────────────────── */}
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">
              Model Router
            </h2>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#4f7dff]/20 p-2.5 text-[#4f7dff]">
                  <Zap className="size-5" />
                </div>
                <div>
                  <div className="font-medium">Intelligent Auto-Routing</div>
                  <div className="mt-0.5 text-sm text-white/40">
                    Automatically selects the best model per message intent: code, reasoning, chat,
                    vision.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAutoRoute(!autoRoute)}
                className="text-white/50 transition hover:text-white"
              >
                {autoRoute ? (
                  <ToggleRight className="size-8 text-[#4ade80]" />
                ) : (
                  <ToggleLeft className="size-8" />
                )}
              </button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                {
                  intent: "code",
                  label: "Code Request",
                  hint: "Routes to highest coding-score model",
                },
                {
                  intent: "reasoning",
                  label: "Reasoning",
                  hint: "Routes to reasoning-capable model",
                },
                { intent: "chat", label: "General Chat", hint: "Balances capability and speed" },
              ].map((r) => (
                <div key={r.intent} className="rounded-xl bg-white/[0.02] p-4">
                  <div className="text-xs font-medium text-white/70">{r.label}</div>
                  <div className="mt-1 text-[10px] text-white/30">{r.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-white/30">
            <div className="size-5 animate-spin rounded-full border-2 border-[#4f7dff] border-t-transparent" />
            <span className="ml-3 text-sm">Loading models…</span>
          </div>
        )}

        <div className="h-24" />
      </div>
    </Shell>
  );
}

function ModelCard({
  model,
  idx,
  onUninstall,
}: {
  model: ModelRecord;
  idx: number;
  onUninstall: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:-translate-y-0.5 hover:border-white/15"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-30"
        style={{ background: `radial-gradient(ellipse at 30% 0%, #4f7dff44, transparent 60%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-medium">{model.name}</h3>
              <SuitabilityBadge model={model} />
              {model.recommended && (
                <span className="rounded-full bg-[#61c7ff]/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#61c7ff]">
                  Recommended
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              {model.variant} · {model.developer}
            </div>
          </div>
          <button
            onClick={onUninstall}
            className="rounded p-1.5 text-white/20 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
            title="Uninstall model"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "PARAMS", v: model.parameters },
            { l: "VRAM", v: `${model.vramRequired} GB` },
            { l: "RAM", v: `${model.ramRequired} GB` },
            {
              l: "SPEED",
              v: model.benchmark?.speedTokensPerSec
                ? `${model.benchmark.speedTokensPerSec.toFixed(0)} t/s`
                : "—",
            },
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
          <Score
            label="Coding"
            icon={Code2}
            value={model.benchmark?.codingScore ?? 0}
            color="#61c7ff"
          />
          <Score
            label="Reasoning"
            icon={Brain}
            value={model.benchmark?.reasoningScore ?? 0}
            color="#7b5cff"
          />
          <div className="flex items-center gap-2 text-[11px]">
            <Eye className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Vision</span>
            <span className={model.vision ? "text-[#4ade80]" : "text-muted-foreground/60"}>
              {model.vision ? "Supported" : "—"}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-white/[0.04] pt-4">
          <BenchmarkButton model={model} />
        </div>
      </div>
    </div>
  );
}

function Score({
  label,
  icon: Icon,
  value,
  color,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[11px]">
      <Icon className="size-3 text-muted-foreground" />
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <span className="w-8 text-right font-mono tabular-nums text-white/80">
        {value > 0 ? value.toFixed(0) : "—"}
      </span>
    </div>
  );
}
