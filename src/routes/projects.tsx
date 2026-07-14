import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { FolderKanban, GitBranch, Users, Clock, Plus } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Jarvis" },
      {
        name: "description",
        content:
          "Your intelligent workspaces. Files, git, tasks, meetings, and AI summaries — grouped.",
      },
    ],
  }),
  component: Projects,
});

const projects = [
  {
    name: "Project Aether",
    desc: "The Jarvis OS shell — glass, motion, spatial navigation.",
    accent: "#61c7ff",
    progress: 74,
    files: 128,
    commits: 214,
    people: ["S", "P", "K"],
    updated: "2 min ago",
    tags: ["Design", "Frontend", "Focus"],
    gradient: "linear-gradient(135deg, rgba(97,199,255,0.25), rgba(79,125,255,0.1))",
  },
  {
    name: "Icarus Kernel",
    desc: "Realtime autonomous flight controller with vision fallback.",
    accent: "#7b5cff",
    progress: 42,
    files: 44,
    commits: 89,
    people: ["S", "M"],
    updated: "1 hour ago",
    tags: ["Rust", "Embedded"],
    gradient: "linear-gradient(135deg, rgba(123,92,255,0.25), rgba(79,125,255,0.1))",
  },
  {
    name: "Neural Studio",
    desc: "Local generative UI kit powered by on-device diffusion.",
    accent: "#4f7dff",
    progress: 88,
    files: 62,
    commits: 340,
    people: ["S", "A", "J", "R"],
    updated: "Yesterday",
    tags: ["ML", "Toolkit"],
    gradient: "linear-gradient(135deg, rgba(79,125,255,0.25), rgba(97,199,255,0.1))",
  },
  {
    name: "Obsidian Papers",
    desc: "Personal research vault, cross-linked to Memory.",
    accent: "#4ade80",
    progress: 28,
    files: 312,
    commits: 12,
    people: ["S"],
    updated: "3 days ago",
    tags: ["Research"],
    gradient: "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(79,125,255,0.08))",
  },
];

function Projects() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <PageHeader
          eyebrow="Workspaces"
          title="Projects"
          subtitle="Folders are dead. Jarvis groups everything that belongs together — files, commits, meetings, screenshots — automatically."
          right={
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition hover:bg-white/[0.07]">
              <Plus className="size-4" /> New project
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-5">
          {projects.map((p) => (
            <div
              key={p.name}
              className="group animate-fade-in-scale relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_30px_80px_-20px_rgba(79,125,255,0.35)]"
            >
              <div
                className="absolute inset-x-0 top-0 h-40 opacity-60"
                style={{ background: p.gradient }}
              />
              <div className="relative">
                <div className="mb-8 flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.06] backdrop-blur">
                    <FolderKanban
                      className="size-5"
                      style={{ color: p.accent }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <ProgressRing value={p.progress} color={p.accent} />
                </div>

                <h3 className="text-xl font-medium tracking-tight">{p.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="size-3" />
                      {p.commits}
                    </span>
                    <span>{p.files} files</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3" /> {p.updated}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {p.people.map((i) => (
                      <div
                        key={i}
                        className="grid size-6 place-items-center rounded-full border-2 border-[#0e1117] bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] text-[9px] font-semibold"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
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

function ProgressRing({ value, color }: { value: number; color: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[10px] font-mono tabular-nums text-white/90">
        {value}
      </div>
    </div>
  );
}
