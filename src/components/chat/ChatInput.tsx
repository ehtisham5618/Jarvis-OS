/**
 * ChatInput
 *
 * Auto-resizing textarea with Jarvis design language.
 * Enter = send, Shift+Enter = new line.
 * Disabled while streaming. Shows active model and stop-generating button.
 */

import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Mic, Square } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAIStore } from "@/stores/ai.store";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ChatInput({ onSend, onStop, placeholder, autoFocus = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, activeModel } = useAIStore();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 8 * 24; // 8 lines * ~24px line height
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-[#4f7dff]/10 via-[#7b5cff]/8 to-[#61c7ff]/10 blur-2xl opacity-60" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[rgba(5,6,8,0.7)] backdrop-blur-xl">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask Jarvis anything…"}
          disabled={isStreaming}
          rows={1}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none disabled:opacity-50"
          style={{ maxHeight: "192px", overflowY: "auto" }}
        />

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Left: attachment + file actions */}
          <div className="flex items-center gap-2">
            <button
              className="grid size-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
              title="Attach file"
            >
              <Paperclip className="size-4" />
            </button>
            {/* Model indicator */}
            <span className="text-[11px] font-mono text-white/25">
              {activeModel.split(":")[0]}
            </span>
          </div>

          {/* Right: voice + send/stop */}
          <div className="flex items-center gap-2">
            <Link
              to="/voice"
              className="grid size-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
              title="Voice input"
            >
              <Mic className="size-4" />
            </Link>

            {isStreaming ? (
              /* Stop generating button */
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Square className="size-3 fill-current" />
                Stop
              </button>
            ) : (
              /* Send button */
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                className="group flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-[0_8px_24px_-8px_rgba(79,125,255,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
              >
                <ArrowUp className="size-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Character warning */}
        {value.length > 2000 && (
          <div className="px-5 pb-2 text-[11px] text-amber-400/70">
            Long message ({value.length.toLocaleString()} chars) — consider splitting into multiple messages.
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="mt-2 text-center text-[10px] text-white/20">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
