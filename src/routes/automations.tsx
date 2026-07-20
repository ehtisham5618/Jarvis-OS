import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Plus,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Loader,
  Clock3,
} from "lucide-react";
import { AutomationCard } from "@/components/automation/AutomationCard";
import { AutomationBuilder } from "@/components/automation/AutomationBuilder";
import { useAutomationStore } from "@/stores/automation.store";
import type { Automation } from "@/services/interfaces/IAutomationService";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations · Jarvis" },
      { name: "description", content: "Visual workflow builder — Describe a workflow. Jarvis builds it." },
    ],
  }),
  component: Automations,
});

// ─── Template gallery ────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    icon: Clock,
    name: "Daily git pull",
    description: "Schedule → shell command",
    accent: "#61c7ff",
    prefill: {
      name: "Daily git pull",
      description: "Every day at 9 AM, run git pull in your projects directory",
      enabled: false,
      trigger: { type: "schedule" as const, cron: "0 9 * * *" },
      conditions: [],
      actions: [
        { type: "shell_exec" as const, command: "git", args: ["-C", "~/projects", "pull"] },
        { type: "show_notification" as const, title: "Jarvis", body: "Git pull completed ✓" },
      ],
    },
  },
  {
    icon: Zap,
    name: "Morning Briefing",
    description: "Schedule → AI prompt → notification",
    accent: "#7b5cff",
    prefill: {
      name: "Morning Briefing",
      description: "Every morning at 8 AM — ask Jarvis for a status briefing",
      enabled: false,
      trigger: { type: "schedule" as const, cron: "0 8 * * *" },
      conditions: [],
      actions: [
        { type: "ai_request" as const, prompt: "Give me my morning briefing for today", outputVar: "briefing" },
        { type: "show_notification" as const, title: "Morning Briefing", body: "Your briefing is ready in Jarvis" },
      ],
    },
  },
  {
    icon: Clock3,
    name: "Clipboard Translator",
    description: "Clipboard watch → AI → write back",
    accent: "#fbbf24",
    prefill: {
      name: "Clipboard Translator",
      description: "When clipboard contains 'translate:' → AI translates it",
      enabled: false,
      trigger: { type: "clipboard_contains" as const, pattern: "translate:" },
      conditions: [],
      actions: [
        { type: "ai_request" as const, prompt: "Translate the following to English: {{clipboard}}", outputVar: "translation" },
        { type: "clipboard_write" as const, content: "{{translation}}" },
      ],
    },
  },
  {
    icon: Play,
    name: "Focus Mode",
    description: "Hotkey → navigate to chat",
    accent: "#4ade80",
    prefill: {
      name: "Focus Mode",
      description: "Ctrl+Alt+F → opens Jarvis chat, closes distractions",
      enabled: false,
      trigger: { type: "hotkey" as const, keys: ["Ctrl", "Alt", "F"] },
      conditions: [],
      actions: [
        { type: "navigate" as const, route: "/chat" },
        { type: "show_notification" as const, title: "Focus Mode", body: "Time to focus 🎯" },
      ],
    },
  },
];

function Automations() {
  const { automations, isLoading, loadAll } = useAutomationStore();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState<Automation | undefined>(undefined);
  const [prefillData, setPrefillData] = useState<Partial<Automation> | undefined>(undefined);

  useEffect(() => { loadAll(); }, []);

  const enabled  = automations.filter((a) => a.enabled);
  const disabled = automations.filter((a) => !a.enabled);

  const openNew = (prefill?: Partial<Automation>) => {
    setEditTarget(undefined);
    setPrefillData(prefill);
    setBuilderOpen(true);
  };

  const openEdit = (a: Automation) => {
    setEditTarget(a);
    setPrefillData(undefined);
    setBuilderOpen(true);
  };

  const closeBuilder = () => {
    setBuilderOpen(false);
    setEditTarget(undefined);
    setPrefillData(undefined);
    loadAll();
  };

  const totalRuns = automations.reduce((s, a) => s + a.runCount, 0);
  const successRate = automations.length === 0 ? 100
    : Math.round(automations.filter((a) => a.lastStatus !== "failed").length / automations.length * 100);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <PageHeader
          eyebrow="No-code, no-config"
          title="Automations"
          subtitle="Visual workflow builder — create triggers, actions, and conditions without writing a single line of code."
          right={
            <button
              onClick={() => openNew()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-4 py-2.5 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(79,125,255,0.5)] transition hover:brightness-110"
            >
              <Plus className="size-4" /> New Automation
            </button>
          }
        />

        {/* Stats bar */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          {[
            { label: "Total",    value: automations.length, icon: Zap,         color: "#61c7ff" },
            { label: "Runs",     value: totalRuns,          icon: Play,         color: "#7b5cff" },
            { label: "Success%", value: `${successRate}%`,  icon: CheckCircle,  color: "#4ade80" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="grid size-10 place-items-center rounded-xl" style={{ background: `${color}18`, boxShadow: `inset 0 0 0 1px ${color}30` }}>
                <Icon className="size-4" style={{ color }} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-xl font-semibold">{isLoading ? "…" : value}</div>
                <div className="text-[11px] text-white/30">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active automations */}
        {enabled.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
              Active Automations ({enabled.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {enabled.map((a) => <AutomationCard key={a.id} automation={a} onEdit={openEdit} />)}
            </div>
          </section>
        )}

        {/* Disabled automations */}
        {disabled.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Inactive ({disabled.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {disabled.map((a) => <AutomationCard key={a.id} automation={a} onEdit={openEdit} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {automations.length === 0 && !isLoading && (
          <div className="mb-10 flex flex-col items-center py-20 text-center">
            <div className="mb-6 grid size-16 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Zap className="size-7 text-white/20" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-medium">No automations yet</h3>
            <p className="mb-6 max-w-xs text-sm text-white/40">Use a template below or create your own from scratch.</p>
            <button onClick={() => openNew()} className="rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-6 py-2.5 text-sm font-medium">
              Create Automation
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="size-6 animate-spin text-white/30" />
          </div>
        )}

        {/* Templates */}
        <section>
          <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Templates</h2>
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => openNew(tpl.prefill as Partial<Automation>)}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.04] group"
              >
                <div
                  className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl transition group-hover:scale-110"
                  style={{ background: `${tpl.accent}18`, boxShadow: `inset 0 0 0 1px ${tpl.accent}30` }}
                >
                  <tpl.icon className="size-4" style={{ color: tpl.accent }} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="mb-1 text-sm font-medium">{tpl.name}</div>
                  <div className="text-[11px] text-white/40">{tpl.description}</div>
                </div>
                <div className="ml-auto self-center text-[10px] font-medium uppercase tracking-wider text-white/20 group-hover:text-[#61c7ff] transition">
                  Use →
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="h-24" />
      </div>

      {/* AutomationBuilder modal */}
      {builderOpen && (
        <AutomationBuilder
          initial={editTarget ?? (prefillData ? { ...prefillData, id: "", runCount: 0, lastRanAt: null, lastStatus: null, createdAt: "" } as Automation : undefined)}
          onClose={closeBuilder}
        />
      )}
    </Shell>
  );
}
