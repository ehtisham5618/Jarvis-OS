import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/desktop/Shell";
import { MemoryTimeline } from "@/components/memory/MemoryTimeline";
import { MemorySearch } from "@/components/memory/MemorySearch";
import { useMemoryStore } from "@/stores/memory.store";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Engine · Jarvis" },
      { name: "description", content: "Jarvis persistent long-term semantic memory." },
    ],
  }),
  component: MemoryRoute,
});

function MemoryRoute() {
  const [tab, setTab] = useState<"timeline" | "search">("timeline");
  const { entries, clearAllMemory } = useMemoryStore();

  const handleClear = () => {
    if (
      confirm("Are you sure you want to completely erase Jarvis's memory? This cannot be undone.")
    ) {
      clearAllMemory();
    }
  };

  return (
    <Shell showWidgets={false}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-white/[0.04] px-6 py-4">
          <div>
            <h1 className="text-xl font-medium text-white/90">Memory Engine</h1>
            <p className="mt-0.5 text-sm text-white/40">
              {entries.length} semantic vectors indexed
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-white/[0.04] bg-white/[0.02] p-1">
              <button
                onClick={() => setTab("timeline")}
                className={`rounded-md px-4 py-1.5 text-sm transition ${
                  tab === "timeline"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setTab("search")}
                className={`rounded-md px-4 py-1.5 text-sm transition ${
                  tab === "search" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
                }`}
              >
                Search
              </button>
            </div>

            <button
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              <AlertTriangle className="size-4" />
              Wipe Memory
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {tab === "timeline" ? <MemoryTimeline /> : <MemorySearch />}
        </div>
      </div>
    </Shell>
  );
}
