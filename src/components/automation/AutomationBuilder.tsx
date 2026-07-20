import { useState } from "react";
import {
  Clock,
  Keyboard,
  FolderOpen,
  Clipboard,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  Terminal,
  FolderInput,
  Bell,
  FilePen,
  Navigation,
  Bot,
  X,
  Check,
  Loader,
} from "lucide-react";
import type { Automation, Trigger, Action } from "@/services/interfaces/IAutomationService";
import { useAutomationStore } from "@/stores/automation.store";

interface AutomationBuilderProps {
  initial?: Automation;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const TRIGGER_OPTIONS: { type: Trigger["type"]; icon: React.ElementType; label: string; description: string }[] = [
  { type: "schedule",           icon: Clock,      label: "Schedule",            description: "Run at a specific time or interval" },
  { type: "hotkey",             icon: Keyboard,   label: "Global Hotkey",       description: "Triggered by a keyboard shortcut" },
  { type: "file_change",        icon: FolderOpen, label: "File Change",         description: "When a file is created, modified or deleted" },
  { type: "clipboard_contains", icon: Clipboard,  label: "Clipboard Watch",     description: "When clipboard matches a pattern" },
  { type: "process_start",      icon: Zap,        label: "App Launch",          description: "When a specific process starts" },
  { type: "ai_prompt",          icon: Bot,        label: "AI Prompt Match",     description: "When a natural language phrase is spoken/typed" },
];

const ACTION_OPTIONS: { type: Action["type"]; icon: React.ElementType; label: string }[] = [
  { type: "shell_exec",        icon: Terminal,    label: "Run Command" },
  { type: "open_file",         icon: FolderInput, label: "Open File / URL" },
  { type: "show_notification", icon: Bell,        label: "Show Notification" },
  { type: "write_file",        icon: FilePen,     label: "Write File" },
  { type: "clipboard_write",   icon: Clipboard,   label: "Write to Clipboard" },
  { type: "navigate",          icon: Navigation,  label: "Navigate in Jarvis" },
  { type: "ai_request",        icon: Bot,         label: "AI Request" },
];

function buildDefaultAction(type: Action["type"]): Action {
  switch (type) {
    case "shell_exec":        return { type, command: "", args: [] };
    case "open_file":         return { type, path: "" };
    case "show_notification": return { type, title: "", body: "" };
    case "write_file":        return { type, path: "", content: "" };
    case "clipboard_write":   return { type, content: "" };
    case "navigate":          return { type, route: "/" };
    case "ai_request":        return { type, prompt: "", outputVar: "result" };
  }
}

function buildDefaultTrigger(type: Trigger["type"]): Trigger {
  switch (type) {
    case "schedule":           return { type, cron: "0 9 * * *" };
    case "hotkey":             return { type, keys: ["Ctrl", "Alt"] };
    case "file_change":        return { type, path: "", event: "create" };
    case "clipboard_contains": return { type, pattern: "" };
    case "process_start":      return { type, processName: "" };
    case "ai_prompt":          return { type, match: "" };
  }
}

/** Generates a natural-language summary of the automation */
function buildNLSummary(trigger: Trigger | null, actions: Action[]): string {
  if (!trigger) return "No trigger selected yet.";
  let when = "";
  switch (trigger.type) {
    case "schedule":           when = `Every cron: ${trigger.cron}`; break;
    case "hotkey":             when = `Pressing ${trigger.keys.join(" + ")}`; break;
    case "file_change":        when = `When a file is ${trigger.event}d in ${trigger.path || "[path]"}`; break;
    case "clipboard_contains": when = `When clipboard contains "${trigger.pattern || "[pattern]"}"`; break;
    case "process_start":      when = `When ${trigger.processName || "[app]"} starts`; break;
    case "ai_prompt":          when = `When you type/say "${trigger.match || "[phrase]"}"`; break;
  }
  if (actions.length === 0) return `${when} → [add an action]`;
  const acts = actions.map((a) => {
    switch (a.type) {
      case "shell_exec":        return `run \`${a.command}\``;
      case "show_notification": return `notify "${a.title}"`;
      case "open_file":         return `open ${a.path}`;
      case "write_file":        return `write to ${a.path}`;
      case "clipboard_write":   return `write to clipboard`;
      case "navigate":          return `navigate to ${a.route}`;
      case "ai_request":        return `ask AI`;
    }
  });
  return `${when} → ${acts.join(", then ")}`;
}

/** Inline editor for a single Action */
function ActionEditor({ action, onChange }: { action: Action; onChange: (a: Action) => void }) {
  const handleField = (field: string, value: unknown) =>
    onChange({ ...action, [field]: value } as Action);

  switch (action.type) {
    case "shell_exec":
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input className="input-field col-span-2" placeholder="command (e.g. git)" value={action.command} onChange={(e) => handleField("command", e.target.value)} />
          <input className="input-field col-span-2" placeholder='args (comma-separated, e.g. pull, --rebase)' value={action.args.join(", ")} onChange={(e) => handleField("args", e.target.value.split(",").map((s) => s.trim()))} />
        </div>
      );
    case "open_file":
      return <input className="input-field mt-2" placeholder="File path or URL" value={action.path} onChange={(e) => handleField("path", e.target.value)} />;
    case "show_notification":
      return (
        <div className="flex flex-col gap-2 mt-2">
          <input className="input-field" placeholder="Title" value={action.title} onChange={(e) => handleField("title", e.target.value)} />
          <input className="input-field" placeholder="Body" value={action.body} onChange={(e) => handleField("body", e.target.value)} />
        </div>
      );
    case "write_file":
      return (
        <div className="flex flex-col gap-2 mt-2">
          <input className="input-field" placeholder="File path" value={action.path} onChange={(e) => handleField("path", e.target.value)} />
          <textarea className="input-field resize-none" rows={3} placeholder="Content (use {{variables}} for dynamic values)" value={action.content} onChange={(e) => handleField("content", e.target.value)} />
        </div>
      );
    case "clipboard_write":
      return <input className="input-field mt-2" placeholder="Content (use {{result}} for AI output)" value={action.content} onChange={(e) => handleField("content", e.target.value)} />;
    case "navigate":
      return <input className="input-field mt-2" placeholder="Route (e.g. /chat, /models)" value={action.route} onChange={(e) => handleField("route", e.target.value)} />;
    case "ai_request":
      return (
        <div className="flex flex-col gap-2 mt-2">
          <textarea className="input-field resize-none" rows={3} placeholder='AI prompt (use {{clipboard}} for clipboard content)' value={action.prompt} onChange={(e) => handleField("prompt", e.target.value)} />
          <input className="input-field" placeholder="Output variable name (e.g. result)" value={action.outputVar} onChange={(e) => handleField("outputVar", e.target.value)} />
        </div>
      );
  }
}

/** Inline editor for trigger configuration */
function TriggerEditor({ trigger, onChange }: { trigger: Trigger; onChange: (t: Trigger) => void }) {
  const set = (field: string, value: unknown) => onChange({ ...trigger, [field]: value } as Trigger);
  switch (trigger.type) {
    case "schedule":
      return (
        <div className="mt-4">
          <label className="form-label">Cron expression</label>
          <input className="input-field" placeholder="e.g. 0 9 * * * (every day at 9am)" value={trigger.cron} onChange={(e) => set("cron", e.target.value)} />
          <p className="mt-1 text-[10px] text-white/30">Use <a href="https://crontab.guru" target="_blank" className="text-[#61c7ff] underline" rel="noreferrer">crontab.guru</a> to compose expressions</p>
        </div>
      );
    case "hotkey":
      return (
        <div className="mt-4">
          <label className="form-label">Key combination (comma-separated)</label>
          <input className="input-field" placeholder="e.g. Ctrl, Alt, J" value={trigger.keys.join(", ")} onChange={(e) => set("keys", e.target.value.split(",").map((s) => s.trim()))} />
        </div>
      );
    case "file_change":
      return (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="form-label">Watch path</label>
            <input className="input-field" placeholder="e.g. C:/Users/you/Downloads" value={trigger.path} onChange={(e) => set("path", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Event</label>
            <select className="input-field" value={trigger.event} onChange={(e) => set("event", e.target.value)}>
              <option value="create">File Created</option>
              <option value="modify">File Modified</option>
              <option value="delete">File Deleted</option>
            </select>
          </div>
        </div>
      );
    case "clipboard_contains":
      return (
        <div className="mt-4">
          <label className="form-label">Match pattern</label>
          <input className="input-field" placeholder='e.g. "translate:"' value={trigger.pattern} onChange={(e) => set("pattern", e.target.value)} />
        </div>
      );
    case "process_start":
      return (
        <div className="mt-4">
          <label className="form-label">Process name</label>
          <input className="input-field" placeholder="e.g. steam.exe" value={trigger.processName} onChange={(e) => set("processName", e.target.value)} />
        </div>
      );
    case "ai_prompt":
      return (
        <div className="mt-4">
          <label className="form-label">Match phrase</label>
          <input className="input-field" placeholder="e.g. open my project" value={trigger.match} onChange={(e) => set("match", e.target.value)} />
        </div>
      );
  }
}

export function AutomationBuilder({ initial, onClose }: AutomationBuilderProps) {
  const { create, update } = useAutomationStore();
  const isEdit = !!initial;

  const [step, setStep]         = useState<Step>(1);
  const [trigger, setTrigger]   = useState<Trigger | null>(initial?.trigger ?? null);
  const [actions, setActions]   = useState<Action[]>(initial?.actions ?? []);
  const [name, setName]         = useState(initial?.name ?? "");
  const [description, setDesc]  = useState(initial?.description ?? "");
  const [saving, setSaving]     = useState(false);

  const canNext = step === 1 ? !!trigger
                : step === 2 ? !!trigger
                : step === 3 ? true
                : step === 4 ? actions.length > 0
                : name.trim().length > 0;

  const handleSave = async () => {
    if (!trigger) return;
    setSaving(true);
    const payload = { name, description, enabled: initial?.enabled ?? false, trigger, conditions: [], actions };
    if (isEdit && initial) {
      await update(initial.id, payload);
    } else {
      await create(payload);
    }
    setSaving(false);
    onClose();
  };

  const addAction = (type: Action["type"]) => {
    setActions((prev) => [...prev, buildDefaultAction(type)]);
  };

  const updateAction = (idx: number, a: Action) => {
    setActions((prev) => prev.map((x, i) => i === idx ? a : x));
  };

  const removeAction = (idx: number) => {
    setActions((prev) => prev.filter((_, i) => i !== idx));
  };

  const STEPS = ["Trigger", "Configure", "Conditions", "Actions", "Save"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-[#070a10] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-6">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-[#61c7ff] mb-1">
              {isEdit ? "Edit Automation" : "New Automation"}
            </div>
            <h2 className="text-lg font-semibold">{name || "Untitled"}</h2>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 border-b border-white/[0.06] px-8 py-4">
          {STEPS.map((s, i) => {
            const idx = (i + 1) as Step;
            const done = idx < step;
            const active = idx === step;
            return (
              <div key={s} className="flex items-center gap-0">
                <button
                  onClick={() => idx < step && setStep(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition ${active ? "bg-[#4f7dff]/20 text-[#61c7ff]" : done ? "text-white/50 hover:text-white/70 cursor-pointer" : "text-white/20"}`}
                >
                  <span className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${active ? "bg-[#4f7dff]" : done ? "bg-white/10" : "bg-white/5"}`}>
                    {done ? <Check className="size-3" /> : idx}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="size-3 text-white/15" />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="p-8">

          {/* Step 1 — Trigger picker */}
          {step === 1 && (
            <div>
              <p className="mb-5 text-sm text-white/50">What triggers this automation?</p>
              <div className="grid grid-cols-2 gap-3">
                {TRIGGER_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => { setTrigger(buildDefaultTrigger(opt.type)); }}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition hover:border-white/20 ${trigger?.type === opt.type ? "border-[#4f7dff]/50 bg-[#4f7dff]/10" : "border-white/[0.06] bg-white/[0.02]"}`}
                  >
                    <opt.icon className="mt-0.5 size-4 shrink-0 text-[#61c7ff]" />
                    <div>
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-[11px] text-white/40">{opt.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Configure trigger */}
          {step === 2 && trigger && (
            <div>
              <p className="mb-4 text-sm text-white/50">Configure the <span className="text-white">{TRIGGER_OPTIONS.find((t) => t.type === trigger.type)?.label}</span> trigger</p>
              <TriggerEditor trigger={trigger} onChange={setTrigger} />
            </div>
          )}

          {/* Step 3 — Conditions (optional) */}
          {step === 3 && (
            <div>
              <p className="text-sm text-white/50">Conditions are optional. Leave empty to always run.</p>
              <p className="mt-4 text-center text-xs text-white/25 italic">Advanced condition editor coming in M9 →</p>
            </div>
          )}

          {/* Step 4 — Actions */}
          {step === 4 && (
            <div>
              <p className="mb-5 text-sm text-white/50">What should happen?</p>
              <div className="space-y-3 mb-5">
                {actions.map((a, idx) => {
                  const opt = ACTION_OPTIONS.find((o) => o.type === a.type);
                  return (
                    <div key={idx} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {opt && <opt.icon className="size-3.5 text-[#7b5cff]" />}
                          <span className="text-sm font-medium">{opt?.label ?? a.type}</span>
                        </div>
                        <button onClick={() => removeAction(idx)} className="text-white/30 hover:text-red-400">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <ActionEditor action={a} onChange={(updated) => updateAction(idx, updated)} />
                    </div>
                  );
                })}
              </div>

              {/* Add action picker */}
              <div className="border border-dashed border-white/10 rounded-xl p-4">
                <p className="mb-3 text-[11px] text-white/30 uppercase tracking-wide">Add action</p>
                <div className="flex flex-wrap gap-2">
                  {ACTION_OPTIONS.map((o) => (
                    <button
                      key={o.type}
                      onClick={() => addAction(o.type)}
                      className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/60 transition hover:border-white/20 hover:text-white"
                    >
                      <Plus className="size-3" />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Name + Save */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              {/* Preview */}
              <div className="rounded-xl border border-[#4f7dff]/20 bg-[#4f7dff]/5 px-5 py-4">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-[#61c7ff]">Preview</p>
                <p className="text-sm text-white/70 leading-relaxed">{buildNLSummary(trigger, actions)}</p>
              </div>
              <div>
                <label className="form-label">Name</label>
                <input className="input-field" placeholder="e.g. Morning Briefing" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Description (optional)</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Short description of what this automation does" value={description} onChange={(e) => setDesc(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-8 py-5">
          <button
            onClick={() => step > 1 && setStep((step - 1) as Step)}
            disabled={step === 1}
            className="text-sm text-white/40 transition hover:text-white disabled:opacity-0"
          >
            ← Back
          </button>
          {step < 5 ? (
            <button
              onClick={() => canNext && setStep((step + 1) as Step)}
              disabled={!canNext}
              className="rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-6 py-2.5 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(79,125,255,0.5)] transition hover:brightness-110 disabled:opacity-30"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canNext || saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-6 py-2.5 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(79,125,255,0.5)] transition hover:brightness-110 disabled:opacity-30"
            >
              {saving ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
              {isEdit ? "Save Changes" : "Create Automation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
