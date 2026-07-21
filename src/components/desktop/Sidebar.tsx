import { Link, useRouterState } from "@tanstack/react-router";
import { useUserStore } from "@/stores/user.store";
import {
  Home,
  FolderKanban,
  Brain,
  Cpu,
  Zap,
  Laptop,
  Download,
  History,
  Settings,
  Code2,
  Activity,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/models", label: "Models", icon: Cpu },
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/devices", label: "Devices", icon: Laptop },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/history", label: "History", icon: History },
  { to: "/system", label: "System", icon: Activity },
  { to: "/developer", label: "Developer", icon: Code2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [expanded, setExpanded] = useState(false);
  const { profile } = useUserStore();

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`relative z-30 flex h-full shrink-0 flex-col justify-between border-r border-white/[0.06] bg-[rgba(14,17,23,0.6)] py-6 backdrop-blur-2xl transition-[width] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        expanded ? "w-60" : "w-[72px]"
      }`}
    >
      {/* Brand */}
      <div className="flex flex-col gap-1">
        <div className="mb-6 flex items-center gap-3 px-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle,#4f7dff,transparent_70%)] blur-lg opacity-80" />
            <div className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-[0_0_20px_-4px_rgba(79,125,255,0.6)]">
              <Sparkles className="size-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              expanded ? "w-32 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="text-[15px] font-semibold tracking-tight">Jarvis</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              OS 1.0
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 px-3">
          {items.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex h-11 items-center gap-3 rounded-xl px-3 transition-all duration-300 ${
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#61c7ff] to-[#4f7dff] shadow-[0_0_10px_rgba(79,125,255,0.7)]" />
                )}
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                <span
                  className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-500 ${
                    expanded ? "w-32 opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3">
        <Link
          to="/settings"
          className={`flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-all hover:bg-white/[0.05]`}
        >
          <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] grid place-items-center text-xs font-semibold">
            {profile?.avatarInitials || "JS"}
          </div>
          <div
            className={`min-w-0 overflow-hidden transition-all duration-500 ${
              expanded ? "w-32 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="truncate text-xs font-medium">
              {profile?.preferredName || "Commander"}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">Local · Online</div>
          </div>
        </Link>
      </div>
    </nav>
  );
}
