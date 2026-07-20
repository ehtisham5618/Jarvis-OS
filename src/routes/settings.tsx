import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Sparkles, Search, BrainCircuit, Trash2, Database } from "lucide-react";
import { useMemoryStore } from "@/stores/memory.store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · Jarvis" }, { name: "description", content: "Talk to your computer instead of clicking through menus." }],
  }),
  component: Settings,
});

const suggestions = [
  "I want maximum performance",
  "I want battery saving",
  "I want gaming mode",
  "I want a cleaner desktop",
  "Make the interface calmer",
  "Turn off all notifications after 9pm",
];

const categories = [
  { name: "Appearance", desc: "Themes, accents, wallpapers, transparency", color: "#61c7ff" },
  { name: "Performance", desc: "Power, thermals, GPU scheduling", color: "#7b5cff" },
  { name: "AI", desc: "Models, memory, personality, privacy", color: "#4f7dff" },
  { name: "Voice", desc: "Wake word, transcription, voice output", color: "#4ade80" },
  { name: "Privacy", desc: "Permissions, cameras, mics, screen access", color: "#fbbf24" },
  { name: "Automations", desc: "Triggers, schedules, integrations", color: "#f87171" },
  { name: "Plugins", desc: "Marketplace, installed, developer", color: "#61c7ff" },
  { name: "Developer", desc: "Runtime, logs, experimental features", color: "#7b5cff" },
];

function Settings() {
  const { entries, clearAllMemory } = useMemoryStore();

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader eyebrow="Conversational" title="Settings" subtitle="Toggles are exhausting. Just tell Jarvis what you want." />

        <div className="glass-strong mb-10 flex items-center gap-3 rounded-2xl p-2 pl-5">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            defaultValue="Make my Mac quieter after 10pm"
            className="flex-1 bg-transparent py-3 text-base font-light text-white/90 outline-none"
          />
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] px-4 py-2.5 text-xs font-medium">
            <Sparkles className="size-3.5" /> Apply
          </button>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-white/80 transition hover:border-[#4f7dff]/40 hover:bg-white/[0.06] hover:text-white">
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-12">
          {categories.map((c) => (
            <div key={c.name} className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${c.color}18`, boxShadow: `inset 0 0 0 1px ${c.color}30` }}>
                <div className="size-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
              </div>
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* M5: Memory Settings */}
        <div className="rounded-3xl border border-white/[0.06] bg-[#060809] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-xl bg-[#4f7dff]/20 p-2.5 text-[#4f7dff]">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white/90">Memory Engine</h2>
              <p className="text-sm text-white/40">Manage Jarvis's semantic vector storage.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              {/* Toggles */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/90">Auto-summarize conversations</div>
                  <div className="text-xs text-white/40">Save key facts in the background.</div>
                </div>
                <div className="h-5 w-9 rounded-full bg-[#4ade80]/20 p-0.5 border border-[#4ade80]/30 cursor-pointer">
                  <div className="h-full w-1/2 rounded-full bg-[#4ade80] ml-auto shadow-[0_0_8px_#4ade80]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/90">Inject memory context</div>
                  <div className="text-xs text-white/40">Use embeddings to recall facts during chat.</div>
                </div>
                <div className="h-5 w-9 rounded-full bg-[#4ade80]/20 p-0.5 border border-[#4ade80]/30 cursor-pointer">
                  <div className="h-full w-1/2 rounded-full bg-[#4ade80] ml-auto shadow-[0_0_8px_#4ade80]" />
                </div>
              </div>

              {/* Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white/90">Context window size</div>
                  <div className="text-xs font-mono text-[#61c7ff]">3 memories</div>
                </div>
                <input type="range" min="1" max="10" defaultValue="3" className="w-full accent-[#61c7ff]" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="size-4 text-white/40" />
                  <span className="text-sm font-medium text-white/70">Storage Statistics</span>
                </div>
                <div className="text-3xl font-light text-white/90">{entries.length} <span className="text-base text-white/40">entries</span></div>
                <div className="mt-1 text-xs text-white/30">Local LanceDB instance active</div>
              </div>

              <button
                onClick={() => {
                  if (confirm("Permanently wipe all semantic memory? This cannot be undone.")) {
                    clearAllMemory();
                  }
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 className="size-4" /> Clear All Memory
              </button>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </Shell>
  );
}
