import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Shell } from "@/components/desktop/Shell";
import { useUserStore } from "@/stores/user.store";
import { useAIStore } from "@/stores/ai.store";
import {
  Mic,
  ArrowUp,
  Sparkles,
  Terminal,
  BookOpen,
  Rocket,
  Wand2,
  FileText,
  Zap,
  Paperclip,
  MessageSquare,
  Wifi,
  WifiOff,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Jarvis" },
      {
        name: "description",
        content:
          "Your intelligent desktop. Greeting, conversation, projects, activities, and live system status.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const {
    threads,
    activeThreadId,
    createThread,
    setActiveThread,
    sendMessage,
    providerStatus,
    checkProviderStatus,
  } = useAIStore();
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    checkProviderStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
  }, [inputValue]);

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Create or reuse thread
    let threadId = activeThreadId;
    if (!threadId) {
      threadId = createThread();
      setActiveThread(threadId);
    }

    setInputValue("");
    navigate({ to: "/chat" });

    // Send the message (navigated away, store handles it)
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  // Get recent threads for the "Continue" section
  const recentThreads = Object.values(threads)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-12 py-16">
        {/* Greeting */}
        <div className="mb-14 animate-fade-in">
          <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#61c7ff]">
            <span className="size-1.5 rounded-full bg-[#61c7ff] shadow-[0_0_8px_#61c7ff]" />
            Jarvis is listening
            {/* Provider status */}
            <span
              className={`ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] normal-case tracking-normal ${
                providerStatus === "online"
                  ? "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]"
                  : providerStatus === "offline"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-white/10 bg-white/5 text-white/40"
              }`}
            >
              {providerStatus === "online" ? (
                <>
                  <Wifi className="size-3" /> Ollama online
                </>
              ) : providerStatus === "offline" ? (
                <>
                  <WifiOff className="size-3" /> Ollama offline
                </>
              ) : (
                <>Checking…</>
              )}
            </span>
          </div>
          <h1 className="text-[56px] font-light leading-[1.05] tracking-tight text-gradient">
            {greeting}, {profile?.preferredName || "Commander"}.
          </h1>
          <p className="mt-4 text-xl font-light text-muted-foreground">How can I help you today?</p>
        </div>

        {/* Live Chat Input */}
        <div className="animate-fade-in-scale relative mb-6" style={{ animationDelay: "80ms" }}>
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-[#4f7dff]/20 via-[#7b5cff]/15 to-[#61c7ff]/20 blur-3xl opacity-70" />
          <div className="glass-strong relative rounded-3xl p-2">
            <div className="rounded-[22px] bg-[rgba(5,6,8,0.5)] p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-[0_0_20px_-4px_rgba(79,125,255,0.6)]">
                  <Sparkles className="size-3.5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <textarea
                    ref={textareaRef}
                    id="home-chat-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask me anything…"
                    className="w-full resize-none bg-transparent text-lg font-light text-white/90 placeholder:text-white/25 focus:outline-none"
                    style={{ maxHeight: "192px", overflowY: "auto" }}
                  />
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="grid size-9 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                        title="Attach file"
                      >
                        <Paperclip className="size-4" />
                      </button>
                      <button
                        className="grid size-9 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                        title="Insert file"
                      >
                        <FileText className="size-4" />
                      </button>
                      <div className="ml-2 text-[11px] font-mono text-muted-foreground">
                        Drop files, images, or paste code
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/voice"
                        className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition hover:border-[#4f7dff]/50 hover:bg-white/[0.06]"
                      >
                        <span className="relative">
                          <span className="absolute inset-0 rounded-full bg-[#61c7ff] blur-md opacity-70" />
                          <Mic className="relative size-3.5 text-[#61c7ff]" />
                        </span>
                        Voice
                      </Link>
                      <button
                        id="home-send-btn"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className="group flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-[0_8px_24px_-8px_rgba(79,125,255,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                      >
                        <ArrowUp className="size-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        <div
          className="mb-14 flex flex-wrap gap-2 animate-fade-in"
          style={{ animationDelay: "180ms" }}
        >
          {[
            { icon: Rocket, label: "Continue AI Project" },
            { icon: Zap, label: "Optimize my PC performance" },
            { icon: FileText, label: "Summarize my recent files" },
            { icon: Wand2, label: "Summarize today's work" },
            { icon: Terminal, label: "Help me debug this code" },
            { icon: BookOpen, label: "Start a study session" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              id={`prompt-${label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => handleSuggestedPrompt(label)}
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#4f7dff]/40 hover:bg-white/[0.06] hover:text-white"
            >
              <Icon className="size-3.5 text-[#61c7ff]" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {/* Recent conversations */}
        {recentThreads.length > 0 && (
          <section className="mb-14 animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-lg font-medium">Recent conversations</h2>
              <Link to="/history" className="text-xs text-[#61c7ff] transition hover:text-white">
                All history →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {recentThreads.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.id}
                    id={`thread-${thread.id}`}
                    onClick={() => {
                      setActiveThread(thread.id);
                      navigate({ to: "/chat" });
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    <div className="mb-3 grid size-8 place-items-center rounded-lg bg-white/[0.05]">
                      <MessageSquare className="size-4 text-[#61c7ff]" strokeWidth={1.75} />
                    </div>
                    <div className="text-sm font-medium text-white/80 truncate">{thread.title}</div>
                    {lastMsg && (
                      <div className="mt-1 truncate text-xs text-white/35">
                        {lastMsg.content.slice(0, 80)}
                      </div>
                    )}
                    <div className="mt-3 text-[10px] font-mono text-white/25">
                      {new Date(thread.updatedAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Projects (static for now — connected in M4) */}
        <section className="mb-14 animate-fade-in" style={{ animationDelay: "260ms" }}>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-medium">Continue where you left off</h2>
            <Link to="/projects" className="text-xs text-[#61c7ff] transition hover:text-white">
              All projects →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link
                to="/projects"
                key={p.name}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-20px_rgba(79,125,255,0.4)]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-24 opacity-40 transition-opacity group-hover:opacity-70"
                  style={{ background: p.gradient }}
                />
                <div className="relative">
                  <div className="mb-16 flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-white/[0.06] backdrop-blur">
                      <p.icon className="size-4" style={{ color: p.accent }} strokeWidth={1.75} />
                    </div>
                    <span
                      className="size-2 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ color: p.dotColor, background: p.dotColor }}
                    />
                  </div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span>{p.files} files</span>
                    <span>{p.updated}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Live activities */}
        <section
          className="grid grid-cols-2 gap-4 animate-fade-in"
          style={{ animationDelay: "340ms" }}
        >
          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Live activities
              </h3>
              <span className="text-[10px] font-mono text-[#4ade80]">3 running</span>
            </div>
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.title} className="flex items-center gap-3">
                  <div className="relative size-8 shrink-0">
                    <svg className="size-8 -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        fill="none"
                        stroke={a.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 13}
                        strokeDashoffset={2 * Math.PI * 13 * (1 - a.pct / 100)}
                        style={{ filter: `drop-shadow(0 0 4px ${a.color})` }}
                      />
                    </svg>
                    <span className="absolute inset-0 grid place-items-center text-[8px] font-mono">
                      {a.pct}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{a.title}</div>
                    <div className="text-[10px] text-muted-foreground">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Daily summary
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">Today</span>
            </div>
            <p className="text-sm font-light leading-relaxed text-white/85">
              You have{" "}
              <span className="text-[#61c7ff]">{Object.keys(threads).length} conversations</span>{" "}
              with Jarvis today. Your AI assistant is{" "}
              <span className={providerStatus === "online" ? "text-[#4ade80]" : "text-amber-400"}>
                {providerStatus === "online" ? "online and ready" : "offline"}
              </span>
              . Keep building.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Chats", value: Object.keys(threads).length.toString(), color: "#61c7ff" },
                {
                  label: "Messages",
                  value: Object.values(threads)
                    .reduce((acc, t) => acc + t.messages.length, 0)
                    .toString(),
                  color: "#7b5cff",
                },
                { label: "Model", value: "Llama", color: "#4ade80" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-lg font-light tabular-nums" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-24" />
      </div>
    </Shell>
  );
}

const projects = [
  {
    name: "Project Aether",
    desc: "Neural desktop shell · v0.4",
    files: 128,
    updated: "2m ago",
    icon: Sparkles,
    accent: "#61c7ff",
    dotColor: "#4ade80",
    gradient: "radial-gradient(ellipse at 30% 0%, rgba(97,199,255,0.35), transparent 60%)",
  },
  {
    name: "Icarus Kernel",
    desc: "Realtime flight controller",
    files: 44,
    updated: "1h ago",
    icon: Rocket,
    accent: "#7b5cff",
    dotColor: "#fbbf24",
    gradient: "radial-gradient(ellipse at 70% 0%, rgba(123,92,255,0.35), transparent 60%)",
  },
  {
    name: "Neural Studio",
    desc: "Generative UI toolkit",
    files: 62,
    updated: "yesterday",
    icon: Wand2,
    accent: "#4f7dff",
    dotColor: "#7e8794",
    gradient: "radial-gradient(ellipse at 50% 0%, rgba(79,125,255,0.35), transparent 60%)",
  },
];

const activities = [
  { title: "Indexing local memory", sub: "4,120 assets", pct: 62, color: "#61c7ff" },
  { title: "Optimizing storage", sub: "recovered 2.4 GB", pct: 88, color: "#4ade80" },
  { title: "Backing up Aether", sub: "iCloud · encrypted", pct: 34, color: "#7b5cff" },
];
