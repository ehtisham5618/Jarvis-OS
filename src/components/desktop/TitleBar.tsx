import { useState, useEffect } from "react";
import { Sparkles, Minus, Square, X } from "lucide-react";

/**
 * Jarvis OS Custom Titlebar
 *
 * Rendered only when running inside Electron (frameless window).
 * Provides drag region + window controls (minimize, maximize, close-to-tray).
 * Uses -webkit-app-region CSS to mark draggable vs. interactive zones.
 */

function isElectron(): boolean {
  return typeof window !== "undefined" && "jarvisOS" in window;
}

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  // Detect maximize state changes
  useEffect(() => {
    // We can't listen to window state directly from renderer without IPC event,
    // so we check via CSS media query / window size comparison as a heuristic
    const checkMaximized = () => {
      setIsMaximized(
        window.innerWidth === window.screen.width &&
          window.innerHeight === window.screen.height
      );
    };
    window.addEventListener("resize", checkMaximized);
    checkMaximized();
    return () => window.removeEventListener("resize", checkMaximized);
  }, []);

  if (!isElectron()) return null;

  return (
    <div
      className="relative z-50 flex h-10 w-full shrink-0 select-none items-center
                 border-b border-white/[0.05] bg-[rgba(5,6,8,0.95)]"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2 px-4">
        <div className="grid size-5 place-items-center rounded-md bg-gradient-to-br from-[#4f7dff] to-[#7b5cff]">
          <Sparkles className="size-3 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-semibold tracking-tight text-white/80">
          Jarvis OS
        </span>
      </div>

      {/* Spacer (draggable) */}
      <div className="flex-1" />

      {/* Window controls — must NOT be draggable */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={() => window.jarvisOS.app.minimize()}
          className="flex h-10 w-12 items-center justify-center text-white/40
                     transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title="Minimize"
        >
          <Minus className="size-3.5" strokeWidth={2} />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={() => window.jarvisOS.app.maximize()}
          className="flex h-10 w-12 items-center justify-center text-white/40
                     transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          <Square className="size-3" strokeWidth={2} />
        </button>

        {/* Close (hides to tray) */}
        <button
          onClick={() => window.jarvisOS.app.quit()}
          className="flex h-10 w-12 items-center justify-center text-white/40
                     transition-colors hover:bg-[#f87171]/20 hover:text-[#f87171]"
          title="Close to tray"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
