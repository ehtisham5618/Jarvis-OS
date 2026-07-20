/**
 * ProcessManager
 *
 * Live table of running processes with sorting, filtering, and kill capability.
 * Auto-refreshes every 3 seconds. Color-coded CPU usage.
 */

import { useState, useEffect, useCallback } from "react";
import { RefreshCcw, Search, X, AlertTriangle } from "lucide-react";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { IWindowsService } from "@/services/interfaces/IWindowsService";

interface ProcessEntry {
  pid: number;
  name: string;
  cpu: number;
  mem: number; // MB
  status?: string;
}

type SortKey = "cpu" | "mem" | "name" | "pid";

function cpuColor(cpu: number) {
  if (cpu > 60) return "text-red-400";
  if (cpu > 30) return "text-amber-400";
  return "text-[#4ade80]";
}

function cpuBarColor(cpu: number) {
  if (cpu > 60) return "bg-red-500";
  if (cpu > 30) return "bg-amber-500";
  return "bg-[#4ade80]";
}

export function ProcessManager() {
  const [processes, setProcesses] = useState<ProcessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("cpu");
  const [search, setSearch] = useState("");
  const [killPid, setKillPid] = useState<number | null>(null);
  const [killError, setKillError] = useState<string | null>(null);

  const windowsService = serviceRegistry.resolve<IWindowsService>(ServiceToken.Windows);

  const fetchProcesses = useCallback(async () => {
    try {
      const api = (window as any).jarvisOS?.system;
      let procs: ProcessEntry[];
      if (api) {
        procs = await api.getProcesses();
      } else {
        // Mock data for browser dev mode
        procs = Array.from({ length: 20 }, (_, i) => ({
          pid: 1000 + i * 7,
          name: ["chrome.exe", "code.exe", "node.exe", "electron.exe", "explorer.exe"][i % 5],
          cpu: Math.random() * 80,
          mem: Math.floor(Math.random() * 500) + 10,
          status: "running",
        }));
      }
      setProcesses(procs.slice(0, 50));
    } catch (err) {
      // Keep old data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, [fetchProcesses]);

  const handleKill = async (pid: number) => {
    if (!confirm(`Kill process PID ${pid}? This cannot be undone.`)) return;
    setKillError(null);
    try {
      await windowsService.killProcess(pid);
      setProcesses((p) => p.filter((x) => x.pid !== pid));
    } catch (err: any) {
      setKillError(err.message);
      setTimeout(() => setKillError(null), 4000);
    }
  };

  const sorted = [...processes]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "pid")  return a.pid - b.pid;
      if (sort === "mem")  return b.mem - a.mem;
      return b.cpu - a.cpu; // cpu default
    });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort(k)}
      className={`text-xs transition ${sort === k ? "text-white/90 font-medium" : "text-white/30 hover:text-white/60"}`}
    >
      {label} {sort === k && "↓"}
    </button>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter processes…"
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-1.5 pl-8 pr-3 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/15"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30">
              <X className="size-3" />
            </button>
          )}
        </div>
        <button
          onClick={fetchProcesses}
          className="grid size-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
        >
          <RefreshCcw className="size-3.5" />
        </button>
        <span className="ml-auto text-xs text-white/30">{sorted.length} processes</span>
      </div>

      {/* Kill error banner */}
      {killError && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-400 animate-fade-in">
          <AlertTriangle className="size-3.5" />
          {killError}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
        {/* Header */}
        <div className="sticky top-0 grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-white/[0.04] bg-[#060809]/90 px-4 py-2 backdrop-blur">
          <SortBtn k="name" label="Process" />
          <SortBtn k="pid"  label="PID" />
          <SortBtn k="cpu"  label="CPU %" />
          <SortBtn k="mem"  label="RAM (MB)" />
          <span className="text-xs text-white/30">Kill</span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="size-5 animate-spin rounded-full border-2 border-[#61c7ff] border-t-transparent" />
          </div>
        ) : (
          sorted.map((p) => (
            <div
              key={p.pid}
              className="group grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-white/[0.02] px-4 py-2.5 transition hover:bg-white/[0.02]"
            >
              {/* Name */}
              <span className="truncate text-xs text-white/80">{p.name}</span>

              {/* PID */}
              <span className="font-mono text-xs text-white/40">{p.pid}</span>

              {/* CPU */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all ${cpuBarColor(p.cpu)}`}
                    style={{ width: `${Math.min(p.cpu, 100)}%` }}
                  />
                </div>
                <span className={`font-mono text-xs ${cpuColor(p.cpu)}`}>
                  {p.cpu.toFixed(1)}
                </span>
              </div>

              {/* RAM */}
              <span className="font-mono text-xs text-white/50">{p.mem.toFixed(0)}</span>

              {/* Kill */}
              <button
                onClick={() => handleKill(p.pid)}
                className="rounded px-2 py-0.5 text-[10px] font-medium text-white/20 opacity-0 ring-1 ring-white/10 transition hover:bg-red-500/10 hover:text-red-400 hover:ring-red-500/30 group-hover:opacity-100"
              >
                Kill
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
