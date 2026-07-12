import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Terminal, Zap, Package, Undo2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History · Jarvis" }, { name: "description", content: "Every command, install, and change — with one-click rollback." }],
  }),
  component: History,
});

const entries = [
  { time: "19:04", tag: "AUTOMATION", icon: Zap, title: "Ran 'Morning briefing' — 4 steps", meta: "auto · 42s", color: "#7b5cff", undoable: false },
  { time: "18:22", tag: "INSTALL", icon: Package, title: "Installed Blender 4.3.0", meta: "312 MB · verified", color: "#4f7dff", undoable: true },
  { time: "17:41", tag: "COMMAND", icon: Terminal, title: "brew upgrade —greedy-latest", meta: "12 packages · success", color: "#61c7ff", undoable: false },
  { time: "16:58", tag: "SYSTEM", icon: Zap, title: "Switched active model to Llama 3.1 70B", meta: "GPU warmed · 8s", color: "#4ade80", undoable: true },
  { time: "15:11", tag: "CONVERSATION", icon: MessageSquare, title: "43-turn conversation about spatial layout", meta: "8,120 tokens", color: "#fbbf24", undoable: false },
  { time: "14:02", tag: "INSTALL", icon: Package, title: "Installed 3 VS Code extensions", meta: "Rust · Nix · Zed themes", color: "#4f7dff", undoable: true },
];

function History() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader eyebrow="Reversible" title="History" subtitle="Everything Jarvis has done for you. Reversible where safely possible." />
        <div className="space-y-2">
          {entries.map((e, i) => (
            <div
              key={i}
              className="animate-fade-in group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{e.time}</div>
              <div
                className="grid size-9 shrink-0 place-items-center rounded-xl"
                style={{ background: `${e.color}18`, boxShadow: `inset 0 0 0 1px ${e.color}30` }}
              >
                <e.icon className="size-4" style={{ color: e.color }} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: e.color }}>{e.tag}</span>
                </div>
                <div className="text-sm text-white/90">{e.title}</div>
                <div className="text-[11px] text-muted-foreground">{e.meta}</div>
              </div>
              {e.undoable && (
                <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground opacity-0 transition hover:bg-white/[0.08] hover:text-white group-hover:opacity-100">
                  <Undo2 className="size-3" /> Rollback
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}
