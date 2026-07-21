import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Sparkles,
  Search,
  BrainCircuit,
  Trash2,
  Database,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useMemoryStore } from "@/stores/memory.store";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuditStore, type AuditEntry, type AuditCategory } from "@/stores/audit.store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Jarvis" },
      { name: "description", content: "Configure security, privacy, memory and more." },
    ],
  }),
  component: Settings,
});

const suggestions = [
  "I want maximum performance",
  "I want battery saving",
  "Enable privacy mode",
  "Lock Jarvis now",
  "Turn off all notifications after 9pm",
];

const STATUS_COLORS: Record<string, string> = {
  allowed: "text-emerald-400",
  denied: "text-red-400",
  failed: "text-amber-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  auth: "#61c7ff",
  capability: "#7b5cff",
  file: "#4ade80",
  shell: "#f97316",
  ai: "#c084fc",
  plugin: "#fbbf24",
  automation: "#4f7dff",
};

function AuditStatusIcon({ status }: { status: AuditEntry["status"] }) {
  if (status === "allowed") return <CheckCircle className="size-3.5 text-emerald-400" />;
  if (status === "denied") return <XCircle className="size-3.5 text-red-400" />;
  return <AlertCircle className="size-3.5 text-amber-400" />;
}

function Settings() {
  const { entries: memEntries, clearAllMemory } = useMemoryStore();
  const { security, setPrivacyMode, setRequireAuth, setAutoLockMinutes } = useSettingsStore();
  const {
    entries: auditEntries,
    isLoading: auditLoading,
    query,
    clear,
    exportLog,
  } = useAuditStore();
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | "">("");

  useEffect(() => {
    query({ limit: 50 });
  }, []);

  const handleExport = async () => {
    const json = await exportLog();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jarvis-audit.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLock = () => {
    if (typeof window !== "undefined" && window.jarvisOS?.auth) {
      window.jarvisOS.auth.lock();
    }
  };

  const filtered = categoryFilter
    ? auditEntries.filter((e) => e.category === categoryFilter)
    : auditEntries;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader
          eyebrow="Configuration"
          title="Settings"
          subtitle="Security, privacy, memory, and system preferences."
        />

        {/* AI search bar */}
        <div className="glass-strong mb-10 flex items-center gap-3 rounded-2xl p-2 pl-5">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ask Jarvis to configure something..."
            className="flex-1 bg-transparent py-3 text-base font-light text-white/90 outline-none"
          />
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] px-4 py-2.5 text-xs font-medium">
            <Sparkles className="size-3.5" /> Apply
          </button>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-white/80 transition hover:border-[#4f7dff]/40 hover:bg-white/[0.06] hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>

        {/* ─── Security Section ─────────────────────────────────────────── */}
        <div className="mb-8 rounded-3xl border border-white/[0.06] bg-[#060809] p-8">
          <div className="flex items-center gap-4 mb-7">
            <div className="rounded-xl bg-[#61c7ff]/15 p-2.5 text-[#61c7ff]">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Security & Privacy</h2>
              <p className="text-sm text-white/40">Auth, privacy mode, and data protection.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Privacy Mode */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
              <div className="flex items-center gap-3">
                {security.privacyMode ? (
                  <EyeOff className="size-4 text-amber-400" />
                ) : (
                  <Eye className="size-4 text-white/40" />
                )}
                <div>
                  <div className="text-sm font-medium">Privacy Mode</div>
                  <div className="text-xs text-white/40">
                    No cloud AI — Ollama only. Hotkey: Ctrl+Shift+P
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPrivacyMode(!security.privacyMode)}
                className={`relative h-6 w-11 rounded-full transition-all duration-300 ${security.privacyMode ? "bg-amber-400" : "bg-white/[0.08]"}`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-300 ${security.privacyMode ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>

            {/* Require Auth */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
              <div className="flex items-center gap-3">
                <Lock className="size-4 text-white/40" />
                <div>
                  <div className="text-sm font-medium">Require authentication on startup</div>
                  <div className="text-xs text-white/40">
                    Show PIN / Windows Hello lock screen when Jarvis starts
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRequireAuth(!security.requireAuth)}
                className={`relative h-6 w-11 rounded-full transition-all duration-300 ${security.requireAuth ? "bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] shadow-[0_4px_12px_-4px_rgba(79,125,255,0.5)]" : "bg-white/[0.08]"}`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-300 ${security.requireAuth ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>

            {/* Auto-lock */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">Auto-lock after inactivity</div>
                <span className="font-mono text-xs text-[#61c7ff]">
                  {security.autoLockMinutes} min
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={security.autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="w-full accent-[#61c7ff]"
              />
            </div>

            {/* Lock now */}
            <button
              onClick={handleLock}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#61c7ff]/20 bg-[#61c7ff]/5 py-3 text-sm font-medium text-[#61c7ff] transition hover:bg-[#61c7ff]/10"
            >
              <Lock className="size-4" /> Lock Jarvis Now
            </button>
          </div>
        </div>

        {/* ─── Audit Log Section ───────────────────────────────────────── */}
        <div className="mb-8 rounded-3xl border border-white/[0.06] bg-[#060809] p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#7b5cff]/15 p-2.5 text-[#7b5cff]">
                <Shield className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Audit Log</h2>
                <p className="text-sm text-white/40">
                  All actions performed by Jarvis and its components.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => query({ limit: 50 })}
                className="grid size-8 place-items-center rounded-lg border border-white/[0.06] text-white/40 hover:text-white transition"
              >
                <RefreshCw className="size-3.5" />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white/60 hover:text-white transition"
              >
                <Download className="size-3.5" /> Export
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear the entire audit log?")) clear();
                }}
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {(
              ["", "auth", "capability", "file", "shell", "ai", "plugin", "automation"] as const
            ).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide transition ${categoryFilter === c ? "bg-[#4f7dff]/20 text-[#61c7ff] border border-[#4f7dff]/30" : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60"}`}
              >
                {c || "All"}
              </button>
            ))}
          </div>

          {/* Log table */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.04]">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-[10px] font-medium uppercase tracking-widest text-white/25 border-b border-white/[0.04] px-4 py-2.5 bg-white/[0.01]">
              <span className="w-36">Time</span>
              <span>Action</span>
              <span className="w-24">Actor</span>
              <span className="w-24">Category</span>
              <span className="w-16 text-right">Status</span>
            </div>
            {auditLoading ? (
              <div className="flex items-center justify-center py-10 text-white/30 text-sm">
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-white/30 text-sm">
                No audit entries yet
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-0 border-b border-white/[0.03] px-4 py-2.5 text-xs hover:bg-white/[0.02] transition"
                  >
                    <span className="w-36 font-mono text-white/30 text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-white/70 truncate">{entry.action}</span>
                    <span className="w-24 text-white/40 text-[10px] truncate">{entry.actor}</span>
                    <span className="w-24">
                      <span
                        className="inline-block rounded-sm px-1.5 py-0.5 text-[9px] uppercase"
                        style={{
                          background: `${CATEGORY_COLORS[entry.category] ?? "#fff"}15`,
                          color: CATEGORY_COLORS[entry.category] ?? "#fff",
                        }}
                      >
                        {entry.category}
                      </span>
                    </span>
                    <span className="w-16 flex justify-end">
                      <AuditStatusIcon status={entry.status} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Memory Section ──────────────────────────────────────────── */}
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/90">
                    Auto-summarize conversations
                  </div>
                  <div className="text-xs text-white/40">Save key facts in the background.</div>
                </div>
                <div className="h-5 w-9 rounded-full bg-[#4ade80]/20 p-0.5 border border-[#4ade80]/30 cursor-pointer">
                  <div className="h-full w-1/2 rounded-full bg-[#4ade80] ml-auto shadow-[0_0_8px_#4ade80]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/90">Inject memory context</div>
                  <div className="text-xs text-white/40">
                    Use embeddings to recall facts during chat.
                  </div>
                </div>
                <div className="h-5 w-9 rounded-full bg-[#4ade80]/20 p-0.5 border border-[#4ade80]/30 cursor-pointer">
                  <div className="h-full w-1/2 rounded-full bg-[#4ade80] ml-auto shadow-[0_0_8px_#4ade80]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white/90">Context window size</div>
                  <div className="text-xs font-mono text-[#61c7ff]">3 memories</div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="3"
                  className="w-full accent-[#61c7ff]"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="size-4 text-white/40" />
                  <span className="text-sm font-medium text-white/70">Storage Statistics</span>
                </div>
                <div className="text-3xl font-light text-white/90">
                  {memEntries.length} <span className="text-base text-white/40">entries</span>
                </div>
                <div className="mt-1 text-xs text-white/30">Local LanceDB instance active</div>
              </div>
              <button
                onClick={() => {
                  if (confirm("Permanently wipe all semantic memory? This cannot be undone."))
                    clearAllMemory();
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
