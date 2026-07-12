import type { ReactNode } from "react";
import { Wallpaper } from "./Wallpaper";
import { Sidebar } from "./Sidebar";
import { WidgetsPanel } from "./WidgetsPanel";
import { TitleBar } from "./TitleBar";

export function Shell({
  children,
  showWidgets = true,
}: {
  children: ReactNode;
  showWidgets?: boolean;
}) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      {/* Electron-only: custom frameless window titlebar */}
      <TitleBar />
      <Wallpaper />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="animate-fade-in min-h-full">{children}</div>
        </main>
        {showWidgets && <WidgetsPanel />}
      </div>
      <WorkingPill />
    </div>
  );
}

function WorkingPill() {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="glass pointer-events-auto flex items-center gap-3 rounded-full px-5 py-2.5">
        <div className="flex gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-[#61c7ff]" />
          <span
            className="size-1.5 animate-bounce rounded-full bg-[#4f7dff]"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="size-1.5 animate-bounce rounded-full bg-[#7b5cff]"
            style={{ animationDelay: "240ms" }}
          />
        </div>
        <span className="text-xs font-medium text-white/85">
          Jarvis is analyzing 2,341 files
        </span>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#61c7ff] via-[#4f7dff] to-[#7b5cff]"
            style={{ width: "62%" }}
          />
        </div>
      </div>
    </div>
  );
}
