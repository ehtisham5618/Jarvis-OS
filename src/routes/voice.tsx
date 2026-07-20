import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { X, Mic } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { useAIStore } from "@/stores/ai.store";
import type { IVoiceService } from "@/services/interfaces/IVoiceService";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [{ title: "Voice · Jarvis" }, { name: "description", content: "Ambient conversation mode." }],
  }),
  component: Voice,
});

function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const voiceServiceRef = useRef<IVoiceService | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    voiceServiceRef.current = serviceRegistry.resolve<IVoiceService>(ServiceToken.Voice);
  }, []);

  const handleStartRecording = async () => {
    if (!voiceServiceRef.current) return;
    try {
      await voiceServiceRef.current.startRecording();
      setIsRecording(true);
      setTranscript("");
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const handleStopRecording = async () => {
    if (!voiceServiceRef.current || !isRecording) return;
    try {
      setIsRecording(false);
      setIsProcessing(true);
      const text = await voiceServiceRef.current.stopRecording();
      setTranscript(text);
      
      if (text.trim()) {
        // Send to AI Store and jump to chat
        const aiStore = useAIStore.getState();
        if (!aiStore.activeThreadId) {
          aiStore.createThread(text);
        }
        aiStore.sendMessage(text);
        // Add a slight delay before navigating to let the user read what was heard
        setTimeout(() => {
          navigate({ to: "/chat" });
        }, 1500);
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <Wallpaper />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-2xl" />

      <Link
        to="/"
        className="glass absolute right-8 top-8 z-30 grid size-11 place-items-center rounded-full text-muted-foreground transition hover:text-white"
      >
        <X className="size-5" />
      </Link>

      <div className="relative z-20 flex h-full flex-col items-center justify-center px-12">
        <div className="mb-12 text-[10px] font-medium uppercase tracking-[0.3em] text-[#61c7ff]">
          {isRecording ? "Jarvis is listening" : "Hold button to speak"}
        </div>

        {/* Orb */}
        <div className="relative mb-16 size-64">
          {isRecording && (
            <>
              <div className="animate-orb-pulse absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(79,125,255,0.7),transparent_60%)]" />
              <div className="animate-orb-pulse absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(123,92,255,0.6),transparent_60%)]" style={{ animationDelay: "1s" }} />
              <div className="animate-orb-pulse absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(97,199,255,0.8),transparent_50%)]" style={{ animationDelay: "2s" }} />
            </>
          )}
          <div className={`absolute inset-16 rounded-full bg-gradient-to-br from-[#61c7ff] via-[#4f7dff] to-[#7b5cff] shadow-[0_0_80px_20px_rgba(79,125,255,0.5)] transition-all duration-500 ${isRecording ? "scale-110" : "scale-100"}`}>
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-white/40 to-transparent blur-md" />
          </div>
        </div>

        {/* Waveform */}
        {isRecording && (
          <div className="mb-10 flex h-16 items-center gap-1">
            {Array.from({ length: 48 }).map((_, i) => {
              const delay = i * 60;
              return (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-b from-[#61c7ff] to-[#7b5cff]"
                  style={{
                    height: `${20 + Math.sin(i / 2) * 30 + Math.random() * 20}%`,
                    animation: `breathe 1.4s ease-in-out ${delay}ms infinite`,
                    boxShadow: "0 0 6px rgba(97,199,255,0.5)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Transcript */}
        <div className="max-w-2xl text-center min-h-[4rem]">
          <div className="text-3xl font-light leading-snug text-white/90">
            {transcript && `"${transcript}"`}
          </div>
        </div>

        {/* Working pill */}
        {isProcessing && (
          <div className="glass mt-16 flex items-center gap-3 rounded-full px-5 py-2.5">
            <div className="size-2 animate-pulse rounded-full bg-[#7b5cff] shadow-[0_0_8px_#7b5cff]" />
            <span className="text-xs font-medium text-white/85">Jarvis is transcribing...</span>
          </div>
        )}

        {/* Mic Button */}
        <button
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onMouseLeave={handleStopRecording}
          className={`mt-10 grid size-16 place-items-center rounded-full border border-white/10 backdrop-blur transition-all duration-300 ${isRecording ? 'bg-[#4f7dff]/30 text-white scale-110' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.1]'}`}
        >
          <Mic className="size-6" />
        </button>
        <div className="mt-4 text-[10px] text-white/30 uppercase tracking-widest">Push and hold</div>
      </div>
    </div>
  );
}
