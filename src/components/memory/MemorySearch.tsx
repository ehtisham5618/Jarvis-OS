/**
 * MemorySearch
 *
 * Instant semantic search across all memories.
 */

import { useState, useEffect } from "react";
import { Search, BrainCircuit, MessageSquare, FileText, Globe } from "lucide-react";
import { useMemoryStore } from "@/stores/memory.store";
import { format } from "date-fns";

export function MemorySearch() {
  const [query, setQuery] = useState("");
  const { searchMemory, lastSearch, isLoading, deleteMemory } = useMemoryStore();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMemory(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, searchMemory]);

  const results = lastSearch?.results;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.04] p-6">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your memories semantically (e.g. 'flight controller logic')..."
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] py-4 pl-12 pr-4 text-sm text-white/90 placeholder:text-white/30 focus:border-[#61c7ff]/50 focus:outline-none"
            autoFocus
          />
          {isLoading && query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="size-4 animate-spin rounded-full border-2 border-[#61c7ff] border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>
        <div className="mx-auto max-w-2xl">
          {!query && !results && (
            <div className="mt-20 flex flex-col items-center justify-center text-white/20">
              <BrainCircuit className="mb-4 size-16 opacity-10" />
              <p>Type a concept to explore your memory vector space.</p>
            </div>
          )}

          {query && results?.length === 0 && !isLoading && (
            <div className="mt-20 flex flex-col items-center justify-center text-white/20">
              <Search className="mb-4 size-10 opacity-20" />
              <p>No semantic matches found for "{query}".</p>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="space-y-4">
              {results.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="relative rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {entry.source === "conversation" && (
                        <MessageSquare className="size-3.5 text-white/40" />
                      )}
                      {entry.source === "file" && <FileText className="size-3.5 text-white/40" />}
                      {entry.source === "web" && <Globe className="size-3.5 text-white/40" />}
                      {entry.source === "manual" && (
                        <BrainCircuit className="size-3.5 text-white/40" />
                      )}
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                        {entry.source}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed text-white/80">{entry.content}</div>
                  <div className="mt-4 flex items-center gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[#61c7ff]/10 px-2 py-0.5 text-[10px] text-[#61c7ff]"
                      >
                        #{tag}
                      </span>
                    ))}
                    {/* Simulated similarity badge based on rank */}
                    <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/30">
                      Top {idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
