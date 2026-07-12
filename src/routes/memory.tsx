import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Search,
  FileText,
  Image as ImageIcon,
  Globe,
  GitCommit,
  MessageSquare,
  Terminal,
  Camera,
} from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory · Jarvis" },
      { name: "description", content: "Everything Jarvis has ever seen — searchable in natural language." },
    ],
  }),
  component: Memory,
});

const items = [
  { time: "16:42", icon: MessageSquare, tag: "Conversation", title: "Discussed sidebar collapse behavior with Priya", meta: "2,140 tokens · Aether", color: "#61c7ff" },
  { time: "15:03", icon: GitCommit, tag: "Git", title: "feat(shell): spatial layering for panels", meta: "aether · main · ae28f9", color: "#7b5cff" },
  { time: "14:22", icon: ImageIcon, tag: "Screenshot", title: "UI_Ref_04.png captured during research call", meta: "1440×900 · 384 KB", color: "#4f7dff" },
  { time: "13:18", icon: Globe, tag: "Web", title: "Read: 'The Future of Ambient Computing' — Rauno.me", meta: "12 min · saved to Aether", color: "#61c7ff" },
  { time: "12:04", icon: FileText, tag: "PDF", title: "Opened arxiv/2410.11934 — Local Diffusion at 4-bit", meta: "42 pages · annotated", color: "#4ade80" },
  { time: "11:30", icon: Terminal, tag: "Command", title: "brew install ollama && ollama pull llama3.1:70b", meta: "success · 4m 12s", color: "#fbbf24" },
  { time: "10:14", icon: Camera, tag: "Meeting", title: "Design review — Jarvis OS · 47 min", meta: "3 people · transcript ready", color: "#7b5cff" },
];

function Memory() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader
          eyebrow="Second brain"
          title="Memory"
          subtitle="Everything opened, read, watched, said, or typed. Searchable the way you actually think."
        />

        {/* Search */}
        <div className="glass-strong mb-10 flex items-center gap-3 rounded-2xl p-2 pl-5">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            defaultValue="The PDF I opened yesterday about diffusion models"
            className="flex-1 bg-transparent py-3 text-base font-light text-white/90 outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] px-4 py-2.5 text-xs font-medium">
            Recall
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {["All", "Files", "Web", "Commits", "Conversations", "Screenshots", "Meetings"].map(
            (t, i) => (
              <button
                key={t}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  i === 0
                    ? "border-[#4f7dff]/40 bg-[#4f7dff]/10 text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {t}
              </button>
            ),
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[70px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="space-y-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="group animate-fade-in relative flex items-start gap-5 rounded-2xl p-3 transition hover:bg-white/[0.03]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="w-14 shrink-0 pt-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {it.time}
                </div>
                <div className="relative z-10 mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-[#0e1117] ring-1 ring-white/10">
                  <it.icon
                    className="size-3.5"
                    style={{ color: it.color }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition group-hover:border-white/15 group-hover:bg-white/[0.04]">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium uppercase tracking-widest"
                      style={{ color: it.color }}
                    >
                      {it.tag}
                    </span>
                  </div>
                  <div className="text-sm text-white/90">{it.title}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{it.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}
