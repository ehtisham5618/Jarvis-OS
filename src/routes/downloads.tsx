import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Download, FileArchive, Film, Music, FileCode, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads · Jarvis" },
      {
        name: "description",
        content: "Beautiful download manager with virus scanning and AI categorization.",
      },
    ],
  }),
  component: Downloads,
});

const downloads = [
  {
    name: "Blender-4.3.0-arm64.dmg",
    size: "312 MB",
    progress: 62,
    speed: "24.4 MB/s",
    eta: "4s",
    icon: FileArchive,
    color: "#61c7ff",
    category: "Creative",
    status: "downloading",
  },
  {
    name: "llama3.1-70b-instruct-q4.gguf",
    size: "42.1 GB",
    progress: 88,
    speed: "112 MB/s",
    eta: "34s",
    icon: Sparkles,
    color: "#7b5cff",
    category: "AI Model",
    status: "downloading",
  },
  {
    name: "wwdc26-keynote-4k.mp4",
    size: "8.4 GB",
    progress: 100,
    speed: "—",
    eta: "done",
    icon: Film,
    color: "#4ade80",
    category: "Video",
    status: "scanning",
  },
  {
    name: "rust-analyzer-src.tar.gz",
    size: "18 MB",
    progress: 100,
    speed: "—",
    eta: "done",
    icon: FileCode,
    color: "#fbbf24",
    category: "Code",
    status: "safe",
  },
  {
    name: "nightbook.flac",
    size: "42 MB",
    progress: 100,
    speed: "—",
    eta: "done",
    icon: Music,
    color: "#f87171",
    category: "Music",
    status: "safe",
  },
];

function Downloads() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader
          eyebrow="Download center"
          title="Downloads"
          subtitle="Scanned, categorized, and ready to install — before you double-click."
        />

        <div className="mb-6 grid grid-cols-3 gap-4">
          <Stat label="In progress" value="2" color="#61c7ff" />
          <Stat label="Downloaded today" value="14.2 GB" color="#7b5cff" />
          <Stat label="Time saved" value="42 min" color="#4ade80" />
        </div>

        <div className="space-y-3">
          {downloads.map((d, i) => (
            <div
              key={d.name}
              className="animate-fade-in group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${d.color}18`, boxShadow: `inset 0 0 0 1px ${d.color}30` }}
                >
                  <d.icon className="size-5" style={{ color: d.color }} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">{d.name}</div>
                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                      {d.category}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{d.size}</span>
                    {d.status === "downloading" && (
                      <>
                        <span>·</span>
                        <span className="text-[#61c7ff]">{d.speed}</span>
                        <span>· {d.eta} remaining</span>
                      </>
                    )}
                    {d.status === "scanning" && (
                      <span className="flex items-center gap-1 text-[#fbbf24]">
                        <Shield className="size-3" /> Scanning for threats
                      </span>
                    )}
                    {d.status === "safe" && (
                      <span className="flex items-center gap-1 text-[#4ade80]">
                        <Shield className="size-3" /> Verified safe · Install
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.progress}%`,
                        background: `linear-gradient(90deg, ${d.color}, #7b5cff)`,
                        boxShadow: `0 0 10px ${d.color}`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right font-mono text-xs tabular-nums text-white/70">
                  {d.progress}%
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

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-light tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
