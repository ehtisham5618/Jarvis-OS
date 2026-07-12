import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Sparkles, Search } from "lucide-react";

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

        <div className="grid grid-cols-2 gap-3">
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
        <div className="h-24" />
      </div>
    </Shell>
  );
}
