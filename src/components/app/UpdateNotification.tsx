/**
 * UpdateNotification.tsx (M12)
 *
 * A persistent, dismissible notification bar shown when an app update
 * is available. Shows download progress and install prompt.
 */

import { useEffect, useState, useCallback } from "react";
import { Download, RefreshCw, X, CheckCircle, Loader2 } from "lucide-react";

type UpdateState =
  | { status: "idle" }
  | { status: "available"; version: string }
  | { status: "downloading"; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

export function UpdateNotification() {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: "idle" });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const api = (window as any).jarvisOS?.update;
    if (!api) return;

    const unsubAvailable = api.onAvailable((info: any) => {
      setUpdateState({ status: "available", version: info.version });
      setDismissed(false);
    });

    const unsubProgress = api.onProgress((p: any) => {
      setUpdateState({ status: "downloading", percent: Math.round(p.percent) });
    });

    const unsubDownloaded = api.onDownloaded((info: any) => {
      setUpdateState({ status: "downloaded", version: info.version });
    });

    return () => {
      unsubAvailable?.();
      unsubProgress?.();
      unsubDownloaded?.();
    };
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      await (window as any).jarvisOS?.update?.download();
    } catch (err: any) {
      setUpdateState({ status: "error", message: err.message });
    }
  }, []);

  const handleInstall = useCallback(() => {
    (window as any).jarvisOS?.update?.install();
  }, []);

  if (dismissed || updateState.status === "idle") return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9980] flex items-center justify-between gap-4 px-6 py-2.5 text-sm"
      style={{
        background: "linear-gradient(90deg, rgba(79,125,255,0.15) 0%, rgba(123,92,255,0.12) 100%)",
        borderBottom: "1px solid rgba(79,125,255,0.25)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Status content */}
      <div className="flex items-center gap-3">
        {updateState.status === "available" && (
          <>
            <div className="flex size-6 items-center justify-center rounded-full bg-[#4f7dff]/20">
              <RefreshCw className="size-3 text-[#61c7ff]" />
            </div>
            <span className="text-white/80">
              <span className="font-medium text-white">Jarvis v{updateState.version}</span> is
              available
            </span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-[#4f7dff]/40 bg-[#4f7dff]/15 px-3 py-1 text-xs font-medium text-[#61c7ff] transition hover:bg-[#4f7dff]/25"
            >
              <Download className="size-3" />
              Download update
            </button>
          </>
        )}

        {updateState.status === "downloading" && (
          <>
            <Loader2 className="size-4 animate-spin text-[#61c7ff]" />
            <span className="text-white/80">Downloading update…</span>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] transition-all duration-300"
                style={{ width: `${updateState.percent}%` }}
              />
            </div>
            <span className="tabular-nums text-xs text-white/50">{updateState.percent}%</span>
          </>
        )}

        {updateState.status === "downloaded" && (
          <>
            <div className="flex size-6 items-center justify-center rounded-full bg-[#4ade80]/20">
              <CheckCircle className="size-3.5 text-[#4ade80]" />
            </div>
            <span className="text-white/80">
              <span className="font-medium text-white">v{updateState.version}</span> downloaded —
              restart to apply
            </span>
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 rounded-lg border border-[#4ade80]/40 bg-[#4ade80]/15 px-3 py-1 text-xs font-medium text-[#4ade80] transition hover:bg-[#4ade80]/25"
            >
              <RefreshCw className="size-3" />
              Restart &amp; install
            </button>
          </>
        )}

        {updateState.status === "error" && (
          <span className="text-red-400/80">Update failed: {updateState.message}</span>
        )}
      </div>

      {/* Dismiss */}
      {updateState.status !== "downloading" && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto rounded-md p-1 text-white/30 transition hover:text-white/60"
          aria-label="Dismiss update notification"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
