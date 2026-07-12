import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { useEffect, useState } from "react";
import { useSystemStore } from "@/stores/system.store";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [{ title: "System · Jarvis" }, { name: "description", content: "Live hardware telemetry, temperature, and process intelligence." }],
  }),
  component: System,
});

function useLive(base: number, jitter = 8) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV(Math.max(0, Math.min(100, base + (Math.random() - 0.5) * jitter))), 1200);
    return () => clearInterval(id);
  }, [base, jitter]);
  return v;
}

function BigGauge({ label, value, color, unit = "%", detail }: { label: string; value: number; color: string; unit?: string; detail?: string }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const dash = c - (value / 100) * c;
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="size-1.5 animate-pulse rounded-full shadow-[0_0_6px_currentColor]" style={{ color, background: color }} />
      </div>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            <defs>
              <linearGradient id={`g-${label}`} x1="0" x2="1" y1="0" y2="1">
                <stop stopColor={color} />
                <stop offset="1" stopColor="#7b5cff" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="80" cy="80" r={r}
              fill="none"
              stroke={`url(#g-${label})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1)", filter: `drop-shadow(0 0 12px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <div className="text-center text-4xl font-light tabular-nums text-white">{Math.round(value)}<span className="text-lg text-muted-foreground">{unit}</span></div>
              {detail && <div className="mt-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">{detail}</div>}
            </div>
          </div>
        </div>
        <Bars color={color} />
      </div>
    </div>
  );
}

function Bars({ color }: { color: string }) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 24 }, () => 20 + Math.random() * 60));
  useEffect(() => {
    const id = setInterval(() => setBars((b) => [...b.slice(1), 20 + Math.random() * 80]), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-32 flex-1 items-end gap-1">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${color}, ${color}22)`, boxShadow: `0 0 4px ${color}44` }} />
      ))}
    </div>
  );
}

function System() {
  const { metrics, startPolling, stopPolling } = useSystemStore();

  useEffect(() => {
    startPolling(1500);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const cpuMock = useLive(24, 15);
  const gpuMock = useLive(58, 20);
  const ramMock = useLive(62, 5);
  const batMock = useLive(87, 1);

  const cpu = metrics?.cpu.usagePercent ?? cpuMock;
  const gpu = metrics?.gpu?.usagePercent ?? gpuMock;
  const ram = metrics?.ram.usagePercent ?? ramMock;
  const bat = metrics?.battery?.percent ?? batMock;

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-12 py-16">
        <PageHeader eyebrow="Hardware" title="System" subtitle="Live at 60fps. Jarvis suggests optimizations before you notice a problem." />

        <div className="grid grid-cols-2 gap-4">
          <BigGauge label={`CPU · ${metrics?.cpu.model || "M4 Max"}`} value={cpu} color="#61c7ff" detail={`${metrics?.cpu.coreCount || 14} cores · ${metrics?.cpu.frequency || 3.4} GHz`} />
          <BigGauge label={`GPU · ${metrics?.gpu?.model || "40-core"}`} value={gpu} color="#7b5cff" detail={`${Math.round(metrics?.gpu?.temperatureC || 64)}°C · ${metrics?.gpu?.vramTotalGB || 18} GB VRAM`} />
          <BigGauge label={`Memory · ${metrics?.ram.totalGB || 128} GB`} value={ram} color="#4f7dff" detail={`unified · ${metrics?.ram.type || "LPDDR5X"}`} />
          <BigGauge label="Battery" value={bat} color="#4ade80" detail={`${Math.round((metrics?.battery?.timeRemainingMinutes || 382) / 60)}h ${Math.round((metrics?.battery?.timeRemainingMinutes || 382) % 60)}m remaining`} />
        </div>

        {/* Secondary row */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <MiniStat label="Storage" value={metrics ? `${Math.round(metrics.storage[0]?.usedGB || 1240) / 1000} TB` : "1.24 TB"} sub={`of ${metrics ? Math.round(metrics.storage[0]?.totalGB || 2000) / 1000 : 2} TB · ${Math.round(metrics?.storage[0]?.usagePercent || 62)}%`} bar={metrics?.storage[0]?.usagePercent || 62} color="#fbbf24" />
          <MiniStat label="Temperature" value={`${Math.round(metrics?.temperatureC || 42)}°C`} sub="nominal" bar={metrics?.temperatureC || 42} color="#61c7ff" />
          <MiniStat label="Fans" value={`${metrics?.fans[0]?.rpm || 1240} RPM`} sub="quiet mode" bar={35} color="#7b5cff" />
          <MiniStat label="Network" value={`↓ ${Math.round(metrics?.network.downloadMbps || 420)} · ↑ ${Math.round(metrics?.network.uploadMbps || 112)}`} sub="Mb/s" bar={78} color="#4ade80" />
        </div>

        {/* Suggestion */}
        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#61c7ff]/20 bg-[#61c7ff]/[0.04] p-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#61c7ff]/15">
            <div className="size-2 animate-pulse rounded-full bg-[#61c7ff]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Jarvis suggests: recover 4.2 GB</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Node modules from 12 abandoned projects, build caches from Blender, and 8 old iOS simulators are safe to remove.
            </div>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-4 py-2 text-xs font-medium shadow-[0_10px_30px_-10px_rgba(79,125,255,0.6)]">
            Run cleanup
          </button>
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}

function MiniStat({ label, value, sub, bar, color }: { label: string; value: string; sub: string; bar: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-light tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}
