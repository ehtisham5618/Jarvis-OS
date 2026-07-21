import { useState } from "react";
import {
  Play,
  Pause,
  Pencil,
  Trash2,
  Clock,
  Zap,
  Keyboard,
  FolderOpen,
  Clipboard,
  CheckCircle,
  XCircle,
  Loader,
  ChevronRight,
} from "lucide-react";
import type { Automation } from "@/services/interfaces/IAutomationService";
import { useAutomationStore } from "@/stores/automation.store";

interface AutomationCardProps {
  automation: Automation;
  onEdit: (a: Automation) => void;
}

/** Returns a human-readable trigger summary */
function triggerSummary(a: Automation): { icon: React.ElementType; label: string } {
  const t = a.trigger;
  switch (t.type) {
    case "schedule":
      return { icon: Clock, label: `Cron: ${t.cron}` };
    case "hotkey":
      return { icon: Keyboard, label: t.keys.join(" + ") };
    case "file_change":
      return { icon: FolderOpen, label: `${t.event} in ${t.path}` };
    case "clipboard_contains":
      return { icon: Clipboard, label: `Clipboard contains "${t.pattern}"` };
    case "process_start":
      return { icon: Zap, label: `${t.processName} starts` };
    case "ai_prompt":
      return { icon: Zap, label: `Matches: "${t.match}"` };
    default:
      return { icon: Zap, label: "Custom trigger" };
  }
}

/** Trigger accent color */
const TRIGGER_COLORS: Record<string, string> = {
  schedule: "#61c7ff",
  hotkey: "#7b5cff",
  file_change: "#4ade80",
  clipboard_contains: "#fbbf24",
  process_start: "#f97316",
  ai_prompt: "#c084fc",
};

export function AutomationCard({ automation, onEdit }: AutomationCardProps) {
  const { toggle, run, remove, runningId } = useAutomationStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isRunning = runningId === automation.id;

  const accent = TRIGGER_COLORS[automation.trigger.type] ?? "#61c7ff";
  const { icon: TriggerIcon, label } = triggerSummary(automation);

  const handleRun = async () => {
    if (isRunning) return;
    await run(automation.id);
  };

  const handleDelete = async () => {
    await remove(automation.id);
  };

  return (
    <div
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
      style={{
        boxShadow: automation.enabled
          ? `0 0 0 1px ${accent}10, inset 0 0 40px ${accent}05`
          : undefined,
      }}
    >
      {/* Status strip */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full"
        style={{ background: automation.enabled ? accent : "rgba(255,255,255,0.08)" }}
      />

      <div className="flex items-start justify-between gap-4 pl-3">
        {/* Left info */}
        <div className="min-w-0 flex-1">
          {/* Name + status */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-white/90 truncate">{automation.name}</span>
            {automation.lastStatus === "success" && (
              <CheckCircle className="size-3.5 shrink-0 text-emerald-400" />
            )}
            {automation.lastStatus === "failed" && (
              <XCircle className="size-3.5 shrink-0 text-red-400" />
            )}
          </div>

          {/* Description */}
          <p className="mb-3 text-[11px] text-white/40 leading-relaxed line-clamp-2">
            {automation.description}
          </p>

          {/* Trigger badge */}
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
            style={{ borderColor: `${accent}30`, background: `${accent}10`, color: accent }}
          >
            <TriggerIcon className="size-3" />
            {label}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-[10px] text-white/30">
            <span>
              {automation.actions.length} action{automation.actions.length !== 1 ? "s" : ""}
            </span>
            <ChevronRight className="size-2.5" />
            <span>
              {automation.runCount} run{automation.runCount !== 1 ? "s" : ""}
            </span>
            {automation.lastRanAt && (
              <>
                <ChevronRight className="size-2.5" />
                <span>Last: {new Date(automation.lastRanAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          {/* Toggle */}
          <button
            onClick={() => toggle(automation.id, !automation.enabled)}
            className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
              automation.enabled
                ? "bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] shadow-[0_4px_12px_-4px_rgba(79,125,255,0.5)]"
                : "bg-white/[0.08]"
            }`}
            title={automation.enabled ? "Disable" : "Enable"}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-300 ${
                automation.enabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="grid size-7 place-items-center rounded-lg border border-white/[0.06] text-white/40 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              title="Run now"
            >
              {isRunning ? (
                <Loader className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
            </button>
            <button
              onClick={() => onEdit(automation)}
              className="grid size-7 place-items-center rounded-lg border border-white/[0.06] text-white/40 transition hover:border-white/20 hover:text-white"
              title="Edit"
            >
              <Pencil className="size-3.5" />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/30"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/40 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="grid size-7 place-items-center rounded-lg border border-white/[0.06] text-white/40 transition hover:border-red-500/30 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
