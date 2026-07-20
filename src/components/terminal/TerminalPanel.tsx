/**
 * TerminalPanel
 *
 * Sandboxed terminal UI — input is validated against the shell allowlist
 * before being sent to the main process via shell.exec().
 * Supports: command history (up/down arrows), ANSI color stripping,
 * "BLOCKED" indicator for non-allowlist commands.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Terminal, X, ChevronRight, ShieldX } from "lucide-react";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { IWindowsService } from "@/services/interfaces/IWindowsService";

interface OutputLine {
  id: string;
  type: "command" | "stdout" | "stderr" | "blocked" | "info";
  text: string;
}

// Strip ANSI escape codes for clean display
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[mGKHF]/g, "");
}

// Commands that map to the backend allowlist
const ALLOWED_PREFIXES = [
  "git", "node", "npm", "npx", "yarn", "pnpm",
  "python", "python3", "pip", "pip3",
  "cargo", "rustc",
  "code", "code-insiders",
  "echo", "where", "which",
];

function isAllowed(cmd: string): boolean {
  const base = cmd.trim().split(/\s+/)[0].toLowerCase();
  return ALLOWED_PREFIXES.some((a) => a === base);
}

export function TerminalPanel() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([
    { id: "welcome", type: "info", text: "Jarvis Terminal — sandboxed shell. Type `help` for allowed commands." },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const windowsService = serviceRegistry.resolve<IWindowsService>(ServiceToken.Windows);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const appendLine = (line: Omit<OutputLine, "id">) => {
    setOutput((prev) => [...prev, { ...line, id: crypto.randomUUID() }]);
  };

  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Record history
    setHistory((h) => [trimmed, ...h.slice(0, 49)]);
    setHistoryIdx(-1);

    appendLine({ type: "command", text: trimmed });

    // Help shortcut
    if (trimmed === "help") {
      appendLine({ type: "info", text: `Allowed commands: ${ALLOWED_PREFIXES.join(", ")}` });
      return;
    }

    // Clear
    if (trimmed === "clear" || trimmed === "cls") {
      setOutput([]);
      return;
    }

    // Allowlist check
    if (!isAllowed(trimmed)) {
      appendLine({ type: "blocked", text: `BLOCKED: "${trimmed.split(/\s+/)[0]}" is not on the Jarvis allowlist.` });
      return;
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    setRunning(true);
    try {
      const result = await windowsService.exec(cmd, args);
      if (result.stdout) {
        for (const line of stripAnsi(result.stdout).split("\n")) {
          if (line) appendLine({ type: "stdout", text: line });
        }
      }
      if (result.stderr) {
        for (const line of stripAnsi(result.stderr).split("\n")) {
          if (line) appendLine({ type: "stderr", text: line });
        }
      }
      if (!result.stdout && !result.stderr) {
        appendLine({ type: "info", text: `Process exited with code ${result.exitCode}` });
      }
    } catch (err: any) {
      appendLine({ type: "stderr", text: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !running) {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : history[next]);
    }
  };

  const lineColor = (type: OutputLine["type"]) => {
    switch (type) {
      case "command": return "text-[#61c7ff]";
      case "stderr":  return "text-red-400/90";
      case "blocked": return "text-amber-400";
      case "info":    return "text-white/40";
      default:        return "text-white/80";
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#060809] font-mono text-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-2.5">
        <Terminal className="size-4 text-[#61c7ff]" />
        <span className="text-xs font-medium text-white/60">Sandboxed Terminal</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-[#4ade80]/30 bg-[#4ade80]/10 px-2 py-0.5 text-[10px] text-[#4ade80]">
          <span className="size-1.5 rounded-full bg-[#4ade80]" />
          {running ? "Running…" : "Ready"}
        </span>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}
        onClick={() => inputRef.current?.focus()}
      >
        {output.map((line) => (
          <div key={line.id} className="flex items-start gap-2">
            {line.type === "command" && <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#61c7ff]" />}
            {line.type === "blocked" && <ShieldX className="mt-0.5 size-3 shrink-0 text-amber-400" />}
            {(line.type === "stdout" || line.type === "stderr" || line.type === "info") && (
              <span className="size-3 shrink-0" />
            )}
            <span className={`leading-relaxed whitespace-pre-wrap break-all ${lineColor(line.type)}`}>
              {line.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 border-t border-white/[0.04] px-4 py-3">
        <ChevronRight className="size-4 shrink-0 text-[#61c7ff]" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
          placeholder={running ? "Running…" : "Enter command…"}
          className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 focus:outline-none disabled:opacity-50"
          autoFocus
        />
        {input && (
          <button onClick={() => setInput("")} className="text-white/20 hover:text-white/50">
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
