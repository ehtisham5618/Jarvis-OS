/**
 * MemoryTimeline
 *
 * Chronological view of memory entries.
 */

import { useState, useEffect } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Trash2, MessageSquare, FileText, Globe, BrainCircuit } from "lucide-react";
import { useMemoryStore } from "@/stores/memory.store";
import type { MemoryEntry } from "@/services/interfaces/IMemoryService";

function getSourceIcon(source: MemoryEntry["source"]) {
  switch (source) {
    case "conversation": return MessageSquare;
    case "file":         return FileText;
    case "web":          return Globe;
    case "manual":       return BrainCircuit;
    default:             return BrainCircuit;
  }
}

export function MemoryTimeline() {
  const { entries, isLoading, loadRecent, deleteMemory } = useMemoryStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#61c7ff]">
          <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <div className="text-xs font-medium uppercase tracking-widest text-current/80">
            Indexing Memory
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/30">
        <BrainCircuit className="mb-4 size-12 opacity-20" />
        <p>No memories indexed yet.</p>
        <p className="mt-1 text-xs text-white/20">Chat with Jarvis to start building memory.</p>
      </div>
    );
  }

  // Group by date
  const groups: Record<string, MemoryEntry[]> = {
    "Today": [],
    "Yesterday": [],
    "This Week": [],
    "Older": [],
  };

  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    if (isToday(d)) groups["Today"].push(entry);
    else if (isYesterday(d)) groups["Yesterday"].push(entry);
    else if (isThisWeek(d)) groups["This Week"].push(entry);
    else groups["Older"].push(entry);
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>
      <div className="mx-auto max-w-3xl space-y-10">
        {Object.entries(groups).filter(([_, items]) => items.length > 0).map(([label, items]) => (
          <div key={label}>
            <div className="mb-4 flex items-center gap-4">
              <div className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</div>
              <div className="h-px flex-1 bg-white/[0.04]" />
            </div>
            
            <div className="space-y-3">
              {items.map((entry) => {
                const Icon = getSourceIcon(entry.source);
                const isExpanded = expandedId === entry.id;
                
                return (
                  <div
                    key={entry.id}
                    className="group relative flex gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/50 group-hover:bg-[#61c7ff]/20 group-hover:text-[#61c7ff]">
                      <Icon className="size-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-white/30">
                          {format(new Date(entry.createdAt), "HH:mm")}
                        </span>
                        {entry.tags.map((tag) => (
                          <span key={tag} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className={`mt-2 text-sm leading-relaxed text-white/80 ${!isExpanded && "line-clamp-2"}`}>
                        {entry.content}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMemory(entry.id); }}
                      className="absolute right-4 top-4 rounded p-1.5 text-white/20 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
