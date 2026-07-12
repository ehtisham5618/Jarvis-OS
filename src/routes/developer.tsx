import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { GitBranch, Terminal, Box, Bug, FileCode, Play } from "lucide-react";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [{ title: "Developer · Jarvis" }, { name: "description", content: "Integrated coding workspace: terminal, git, docker, logs, AI review." }],
  }),
  component: Developer,
});

function Developer() {
  return (
    <Shell showWidgets={false}>
      <div className="mx-auto max-w-7xl px-12 py-16">
        <PageHeader
          eyebrow="Full stack"
          title="Developer"
          subtitle="Terminal, git, containers, logs and an AI co-pilot living in one surface."
          right={
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-muted-foreground">
              <GitBranch className="size-3" /> aether · main · ae28f9
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-4">
          {/* Explorer */}
          <div className="col-span-1 glass rounded-2xl p-5">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Explorer</div>
            <div className="space-y-1 font-mono text-xs">
              {[
                { n: "src/", d: 0 },
                { n: "components/", d: 1 },
                { n: "desktop/", d: 2 },
                { n: "Shell.tsx", d: 3, active: true },
                { n: "Sidebar.tsx", d: 3 },
                { n: "WidgetsPanel.tsx", d: 3 },
                { n: "routes/", d: 1 },
                { n: "index.tsx", d: 2 },
                { n: "voice.tsx", d: 2 },
                { n: "styles.css", d: 1 },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${
                    f.active ? "bg-[#4f7dff]/15 text-[#61c7ff]" : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                  }`}
                  style={{ paddingLeft: `${f.d * 12 + 8}px` }}
                >
                  <FileCode className="size-3 opacity-70" />
                  {f.n}
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="col-span-2 glass overflow-hidden rounded-2xl">
            <div className="flex border-b border-white/[0.06]">
              {["Shell.tsx", "WidgetsPanel.tsx"].map((t, i) => (
                <div
                  key={t}
                  className={`border-r border-white/[0.06] px-4 py-2 text-xs ${
                    i === 0 ? "bg-white/[0.03] text-white" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed">
              <code>
                <span className="text-muted-foreground">// desktop shell — 2035</span>
                {"\n"}
                <span className="text-[#7b5cff]">import</span>{" "}
                <span className="text-[#61c7ff]">{"{"} Wallpaper {"}"}</span>{" "}
                <span className="text-[#7b5cff]">from</span>{" "}
                <span className="text-[#4ade80]">"./Wallpaper"</span>
                {"\n\n"}
                <span className="text-[#7b5cff]">export function</span>{" "}
                <span className="text-[#61c7ff]">Shell</span>({"{ children }"}) {"{"}
                {"\n  "}
                <span className="text-[#7b5cff]">return</span> (
                {"\n    "}&lt;<span className="text-[#f87171]">div</span>{" "}
                <span className="text-[#fbbf24]">className</span>=
                <span className="text-[#4ade80]">"fixed inset-0"</span>&gt;
                {"\n      "}&lt;<span className="text-[#f87171]">Wallpaper</span> /&gt;
                {"\n      "}
                {"{ children }"}
                {"\n    "}&lt;/<span className="text-[#f87171]">div</span>&gt;
                {"\n  "})
                {"\n"}
                {"}"}
              </code>
            </pre>
          </div>

          {/* Terminal */}
          <div className="col-span-2 glass overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2 text-[11px] font-mono text-muted-foreground">
              <Terminal className="size-3" />
              zsh · aether · main
              <button className="ml-auto flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px]">
                <Play className="size-2.5" /> run
              </button>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed">
              <div><span className="text-[#61c7ff]">~/aether</span> <span className="text-muted-foreground">$</span> bun run build:desktop</div>
              <div className="text-muted-foreground">→ compiling 342 modules</div>
              <div className="text-muted-foreground">→ tree-shaking</div>
              <div className="text-[#4ade80]">✓ built in 2.4s · 184 KB gz</div>
              <div><span className="text-[#61c7ff]">~/aether</span> <span className="text-muted-foreground">$</span> <span className="animate-pulse">▊</span></div>
            </div>
          </div>

          {/* Docker */}
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Box className="size-3" /> Containers
            </div>
            <div className="space-y-2">
              {[
                { n: "postgres:16", s: "running", c: "#4ade80" },
                { n: "redis:7", s: "running", c: "#4ade80" },
                { n: "ollama", s: "running", c: "#4ade80" },
                { n: "vector-db", s: "idle", c: "#fbbf24" },
              ].map((c) => (
                <div key={c.n} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs font-mono">
                  <span>{c.n}</span>
                  <span className="flex items-center gap-1.5" style={{ color: c.c }}>
                    <span className="size-1.5 rounded-full" style={{ background: c.c, boxShadow: `0 0 4px ${c.c}` }} />
                    {c.s}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI review */}
          <div className="col-span-3 glass relative overflow-hidden rounded-2xl p-5">
            <div className="absolute -top-10 right-0 h-40 w-1/3 bg-[radial-gradient(circle,rgba(79,125,255,0.25),transparent_70%)] blur-2xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#61c7ff]">
                <Bug className="size-3" /> AI Code Review — Shell.tsx
              </div>
              <div className="text-sm font-light leading-relaxed text-white/85">
                Your <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#61c7ff]">Wallpaper</code> component
                mounts three drifting blobs that each layer <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#7b5cff]">blur-3xl</code>.
                On integrated GPUs this triggers full-frame recomposition at 60fps.
                <span className="text-[#4ade80]"> Suggested fix:</span> promote each blob to its own layer with
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs"> will-change: transform</code> and lower the blur radius on battery.
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-3 py-1.5 text-xs font-medium">Apply fix</button>
                <button className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">Explain more</button>
              </div>
            </div>
          </div>
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}
