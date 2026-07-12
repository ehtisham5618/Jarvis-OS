import { useEffect, useState } from "react";
import { useSystemStore } from "@/stores/system.store";
import {
  Cpu,
  MemoryStick,
  Battery,
  Cloud,
  Calendar,
  Clipboard,
  Bluetooth,
  Wifi,
} from "lucide-react";

function useTicker(base: number, jitter = 6) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(
      () => setV(base + Math.random() * jitter - jitter / 2),
      1400,
    );
    return () => clearInterval(id);
  }, [base, jitter]);
  return Math.max(0, Math.min(100, v));
}

function Gauge({
  label,
  value,
  unit = "%",
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
      <div className="relative shrink-0">
        <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dash}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1)",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[10px] font-mono tabular-nums">
          {Math.round(value)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">
          {Math.round(value)}
          {unit}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ color }: { color: string }) {
  const [points, setPoints] = useState<number[]>(() =>
    Array.from({ length: 24 }, () => 30 + Math.random() * 40),
  );
  useEffect(() => {
    const id = setInterval(
      () =>
        setPoints((p) => [...p.slice(1), 30 + Math.random() * 50]),
      900,
    );
    return () => clearInterval(id);
  }, []);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 100} ${60 - p * 0.6}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-8 w-full">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100 40 L 0 40 Z`} fill={`url(#sg-${color})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="text-[38px] font-light leading-none tracking-tight tabular-nums text-gradient">
          {time}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{date}</div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-light tabular-nums">14°</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Clear · London
        </div>
      </div>
    </div>
  );
}

export function WidgetsPanel() {
  const { metrics, startPolling, stopPolling } = useSystemStore();

  useEffect(() => {
    startPolling(1500);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Fallback to tickers until first poll comes through
  const cpuMock = useTicker(18, 12);
  const gpuMock = useTicker(42, 20);
  const ramMock = useTicker(58, 8);
  const batMock = useTicker(87, 2);

  const cpu = metrics?.cpu.usagePercent ?? cpuMock;
  const gpu = metrics?.gpu?.usagePercent ?? gpuMock;
  const ram = metrics?.ram.usagePercent ?? ramMock;
  const bat = metrics?.battery?.percent ?? batMock;

  return (
    <aside className="relative z-20 flex h-full w-[340px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-white/[0.06] bg-[rgba(14,17,23,0.5)] p-6 backdrop-blur-2xl">
      {/* Clock + weather */}
      <div className="glass-subtle rounded-2xl p-5">
        <Clock />
      </div>

      {/* Telemetry */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Telemetry
          </h3>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4ade80]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Gauge label="CPU" value={cpu} color="#61c7ff" />
          <Gauge label="GPU" value={gpu} color="#7b5cff" />
          <Gauge label="RAM" value={ram} color="#4f7dff" />
          <Gauge label="Battery" value={bat} color="#4ade80" />
        </div>
        <div className="mt-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Neural Engine
            </span>
            <span className="text-[10px] font-mono text-[#61c7ff]">
              Llama 3.1 · 70B
            </span>
          </div>
          <Sparkline color="#61c7ff" />
        </div>
      </section>

      {/* Calendar */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Calendar className="size-3" /> Next up
        </h3>
        <div className="space-y-2">
          {[
            {
              time: "16:00",
              title: "Design review · Jarvis OS",
              tag: "Focus",
            },
            {
              time: "18:30",
              title: "1:1 with Priya",
              tag: "Meeting",
            },
            {
              time: "20:00",
              title: "Gym block",
              tag: "Personal",
            },
          ].map((e) => (
            <div
              key={e.time}
              className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05] transition hover:bg-white/[0.05]"
            >
              <span className="mt-0.5 text-[11px] font-mono text-[#61c7ff]">
                {e.time}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{e.title}</div>
                <div className="text-[10px] text-muted-foreground">{e.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clipboard */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Clipboard className="size-3" /> Clipboard
        </h3>
        <div className="space-y-1.5">
          {[
            "npm run build:prod --workspaces",
            "0xB4E3…9F21",
            "https://arxiv.org/abs/2410.11934",
          ].map((c, i) => (
            <div
              key={i}
              className="truncate rounded-lg bg-white/[0.02] px-3 py-2 font-mono text-[11px] text-muted-foreground ring-1 ring-white/[0.05] transition hover:bg-white/[0.05] hover:text-white"
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Devices */}
      <section>
        <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Connected
        </h3>
        <div className="space-y-1.5">
          {[
            { icon: Bluetooth, name: "AirPods Pro", meta: "82%" },
            { icon: Wifi, name: "aether-5G", meta: "420 Mb/s" },
            { icon: Cpu, name: "RTX 4090", meta: "64°C" },
          ].map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.05]"
            >
              <d.icon className="size-3.5 text-muted-foreground" />
              <span className="flex-1 text-xs">{d.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {d.meta}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
