/**
 * ChatInput
 *
 * Auto-resizing textarea with Jarvis design language.
 * Enter = send, Shift+Enter = new line.
 * Disabled while streaming. Shows active model and stop-generating button.
 */

import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Mic, Square, Monitor, X } from "lucide-react";
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

  const [imageBuffer, setImageBuffer] = useState<Uint8Array | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      setImageBuffer(buffer);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCaptureScreen = async () => {
    try {
      const p = await window.jarvisOS.vision.screenshot();
      setImageBuffer(p);
      // Create blob from buffer
      const blob = new Blob([p], { type: "image/png" });
      setImagePreview(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to capture screen", err);
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed && !imageBuffer || isStreaming) return;
    
    // In a full implementation, onSend would accept the image buffer too
    // For now we just pass text as requested by the interface
    onSend(trimmed);
    
    setValue("");
    setImageBuffer(null);
    setImagePreview(null);
    
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

  const canSend = (value.trim().length > 0 || imagePreview) && !isStreaming;

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-[#4f7dff]/10 via-[#7b5cff]/8 to-[#61c7ff]/10 blur-2xl opacity-60" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[rgba(5,6,8,0.7)] backdrop-blur-xl">
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="px-5 pt-4">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Attached" className="h-20 w-auto rounded-lg border border-white/10 object-cover" />
              <button
                onClick={() => { setImageBuffer(null); setImagePreview(null); }}
                className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-400"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask Jarvis anything…"}
          disabled={isStreaming}
          rows={1}
          className={`w-full resize-none bg-transparent px-5 pb-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none disabled:opacity-50 ${imagePreview ? 'pt-3' : 'pt-4'}`}
          style={{ maxHeight: "192px", overflowY: "auto" }}
        />

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Left: attachment + file actions */}
          <div className="flex items-center gap-1">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="grid size-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
              title="Attach image"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              onClick={handleCaptureScreen}
              className="grid size-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
              title="Capture screen"
            >
              <Monitor className="size-4" />
            </button>
            <span className="ml-2 text-[11px] font-mono text-white/25">
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
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Square className="size-3 fill-current" />
                Stop
              </button>
            ) : (
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
      </div>


      {/* Hint */}
      <p className="mt-2 text-center text-[10px] text-white/20">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
