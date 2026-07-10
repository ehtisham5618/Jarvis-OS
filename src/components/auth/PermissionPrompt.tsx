import { useEffect, useRef } from "react";
import { Shield, X, Check, ChevronRight } from "lucide-react";

export interface PermissionRequest {
  id: string;
  capability: string;
  description: string;
  requestedBy: string;
  onAllow: () => void;
  onAllowAlways: () => void;
  onDeny: () => void;
}

interface PermissionPromptProps {
  request: PermissionRequest;
}

export function PermissionPrompt({ request }: PermissionPromptProps) {
  const allowRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcuts: Enter = Allow, Escape = Deny
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        request.onAllow();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        request.onDeny();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [request]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="animate-slide-in relative z-10 w-full max-w-sm rounded-3xl border border-white/[0.08] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        style={{ background: "rgba(7,10,16,0.95)" }}
      >
        {/* Header */}
        <div className="mb-5 flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Shield className="size-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-amber-400/80 mb-0.5">
              Permission Required
            </p>
            <h3 className="text-base font-semibold leading-snug">{request.capability}</h3>
            <p className="mt-1 text-xs text-white/40">
              Requested by: <span className="text-white/60">{request.requestedBy}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/70 leading-relaxed">
          {request.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            ref={allowRef}
            onClick={request.onAllow}
            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-5 py-3 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(79,125,255,0.5)] transition hover:brightness-110"
          >
            <span className="flex items-center gap-2">
              <Check className="size-4" /> Allow once
            </span>
            <span className="text-[10px] opacity-60">Enter ↵</span>
          </button>
          <button
            onClick={request.onAllowAlways}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 text-sm text-white/70 transition hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-2">
              <ChevronRight className="size-4" /> Allow always
            </span>
          </button>
          <button
            onClick={request.onDeny}
            className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <span className="flex items-center gap-2">
              <X className="size-4" /> Deny
            </span>
            <span className="text-[10px] opacity-60">Esc</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.19,1,0.22,1); }
      `}</style>
    </div>
  );
}
