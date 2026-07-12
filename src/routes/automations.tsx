import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Zap,
  Clock,
  Play,
  Pause,
  Mail,
  FolderDown,
  Save,
  Cpu,
  Power,
  Sparkles,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations · Jarvis" },
      { name: "description", content: "Describe a workflow. Jarvis builds it." },
    ],
  }),
  component: Automations,
});

const nodes = [
  { icon: Power, title: "When Mac wakes", tag: "TRIGGER", color: "#61c7ff" },
  { icon: Mail, title: "Summarize overnight email", tag: "AI", color: "#7b5cff" },
  { icon: FolderDown, title: "Sort Downloads by type", tag: "SYSTEM", color: "#4f7dff" },
  { icon: Save, title: "Backup Aether to iCloud", tag: "SYSTEM", color: "#4ade80" },
  { icon: Cpu, title: "Warm up local Llama model", tag: "AI", color: "#7b5cff" },
];

const flows = [
  { title: "Morning briefing", schedule: "Every day · 07:00", runs: 142, on: true, accent: "#61c7ff" },
  { title: "Organize Downloads", schedule: "When new file added", runs: 3120, on: true, accent: "#4ade80" },
  { title: "Optimize before gaming", schedule: "When Steam launches", runs: 88, on: true, accent: "#7b5cff" },
  { title: "Shutdown after render", schedule: "When Blender finishes", runs: 24, on: false, accent: "#fbbf24" },
];

function Automations() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <PageHeader
          eyebrow="No-code, no-config"
          title="Automations"
          subtitle="Describe what should happen. Jarvis wires up the trigger, the AI, and the system calls."
          right={
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition hover:bg-white/[0.07]">
              <Plus className="size-4" /> New automation
            </button>
          }
        />

        {/* Natural language creator */}
        <div className="glass-strong relative mb-10 rounded-3xl p-2">
          <div className="rounded-[22px] bg-[rgba(5,6,8,0.5)] p-6">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#61c7ff]">
              <Sparkles className="size-3" /> Describe a workflow
            </div>
            <div className="text-lg font-light text-white/90">
              Every morning at 7am, summarize my emails, sort my Downloads
              folder, and back up Aether to iCloud.
              <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-[#61c7ff]" />
            </div>
          </div>
        </div>

        {/* Node canvas */}
        <div className="glass mb-10 overflow-hidden rounded-3xl p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium">Generated flow</div>
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-4 py-1.5 text-xs font-medium shadow-[0_8px_20px_-8px_rgba(79,125,255,0.6)]">
              <Play className="size-3" fill="white" /> Run once
            </button>
          </div>
          <div
            className="relative rounded-2xl border border-white/[0.06] p-8"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              {nodes.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="group animate-fade-in-scale relative w-40 rounded-2xl border border-white/10 bg-[rgba(14,17,23,0.85)] p-4 backdrop-blur transition hover:-translate-y-1"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      boxShadow: `0 20px 40px -20px ${n.color}55`,
                    }}
                  >
                    <div
                      className="mb-3 grid size-9 place-items-center rounded-xl"
                      style={{
                        background: `${n.color}22`,
                        boxShadow: `inset 0 0 0 1px ${n.color}44`,
                      }}
                    >
                      <n.icon
                        className="size-4"
                        style={{ color: n.color }}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {n.tag}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-white/90">
                      {n.title}
                    </div>
                  </div>
                  {i < nodes.length - 1 && (
                    <svg width="24" height="4" className="opacity-40">
                      <line x1="0" y1="2" x2="24" y2="2" stroke="url(#g)" strokeWidth="1" strokeDasharray="3 3" />
                      <defs>
                        <linearGradient id="g" x1="0" x2="24" y1="0" y2="0">
                          <stop stopColor={n.color} />
                          <stop offset="1" stopColor={nodes[i + 1].color} />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active flows */}
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Active automations
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {flows.map((f) => (
            <div
              key={f.title}
              className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="grid size-10 place-items-center rounded-xl"
                  style={{
                    background: `${f.accent}18`,
                    boxShadow: `inset 0 0 0 1px ${f.accent}30`,
                  }}
                >
                  <Zap className="size-4" style={{ color: f.accent }} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-3" />{f.schedule}</span>
                    <span>· {f.runs} runs</span>
                  </div>
                </div>
              </div>
              <button
                className={`relative h-6 w-11 rounded-full transition ${
                  f.on
                    ? "bg-gradient-to-r from-[#4f7dff] to-[#7b5cff]"
                    : "bg-white/[0.08]"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                    f.on ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}
