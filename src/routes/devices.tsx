import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import {
  Bluetooth,
  Wifi,
  Smartphone,
  Tablet,
  Printer,
  Monitor,
  HardDrive,
  Gamepad2,
} from "lucide-react";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices · Jarvis" },
      { name: "description", content: "Everything connected to your desktop, in one place." },
    ],
  }),
  component: Devices,
});

const devices = [
  {
    icon: Smartphone,
    name: "iPhone 16 Pro",
    tag: "Phone",
    status: "Handoff",
    meta: "84% · nearby",
    color: "#61c7ff",
  },
  {
    icon: Tablet,
    name: "iPad Pro",
    tag: "Tablet",
    status: "Sidecar",
    meta: "connected",
    color: "#4f7dff",
  },
  {
    icon: Monitor,
    name: "Studio Display",
    tag: "Display",
    status: "5K",
    meta: "primary",
    color: "#7b5cff",
  },
  {
    icon: Bluetooth,
    name: "AirPods Pro",
    tag: "Audio",
    status: "Playing",
    meta: "82%",
    color: "#4ade80",
  },
  {
    icon: Gamepad2,
    name: "DualSense",
    tag: "Controller",
    status: "Idle",
    meta: "72%",
    color: "#fbbf24",
  },
  {
    icon: Printer,
    name: "Brother HL-L2350DW",
    tag: "Printer",
    status: "Ready",
    meta: "network",
    color: "#7e8794",
  },
  {
    icon: HardDrive,
    name: "Samsung T7 · 2TB",
    tag: "Storage",
    status: "Encrypted",
    meta: "1.2 TB free",
    color: "#61c7ff",
  },
  {
    icon: Wifi,
    name: "aether-5G",
    tag: "Network",
    status: "5 GHz",
    meta: "420 Mb/s",
    color: "#4f7dff",
  },
];

function Devices() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        <PageHeader
          eyebrow="Ecosystem"
          title="Devices"
          subtitle="Every screen, controller, and disk within reach."
        />
        <div className="grid grid-cols-2 gap-3">
          {devices.map((d, i) => (
            <div
              key={d.name}
              className="animate-fade-in group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className="grid size-12 shrink-0 place-items-center rounded-2xl"
                style={{
                  background: `${d.color}18`,
                  boxShadow: `inset 0 0 0 1px ${d.color}30`,
                }}
              >
                <d.icon className="size-5" style={{ color: d.color }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{d.name}</span>
                  <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                    {d.tag}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {d.status} · {d.meta}
                </div>
              </div>
              <div
                className="size-1.5 rounded-full shadow-[0_0_6px_currentColor]"
                style={{ color: d.color, background: d.color }}
              />
            </div>
          ))}
        </div>
        <div className="h-24" />
      </div>
    </Shell>
  );
}
