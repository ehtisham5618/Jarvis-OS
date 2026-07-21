import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { useAIStore } from "@/stores/ai.store";
import { MessageSquare, Trash2, Calendar } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History · Jarvis" }],
  }),
  component: History,
});

function History() {
  const navigate = useNavigate();
  const { threads, setActiveThread, deleteThread, clearAllThreads } = useAIStore();

  const sortedThreads = Object.values(threads).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="mb-10 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white/90">
              Conversation History
            </h1>
            <p className="mt-2 text-sm text-white/40">{sortedThreads.length} total threads</p>
          </div>
          {sortedThreads.length > 0 && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete all conversation history? This cannot be undone.",
                  )
                ) {
                  clearAllThreads();
                }
              }}
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
            >
              Clear History
            </button>
          )}
        </div>

        {sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/[0.03]">
              <Calendar className="size-5 text-white/20" />
            </div>
            <h3 className="text-sm font-medium text-white/60">No history yet</h3>
            <p className="mt-1 text-xs text-white/30">Your past conversations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {sortedThreads.map((thread) => {
              const date = new Date(thread.updatedAt);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={thread.id}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 transition-all hover:bg-white/[0.03]"
                >
                  <button
                    onClick={() => {
                      setActiveThread(thread.id);
                      navigate({ to: "/chat" });
                    }}
                    className="flex flex-1 items-start gap-4 text-left"
                  >
                    <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05]">
                      <MessageSquare className="size-4 text-[#61c7ff]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white/80">{thread.title}</h3>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/35">
                        <span>
                          {isToday ? "Today" : date.toLocaleDateString()}{" "}
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="size-1 rounded-full bg-white/10" />
                        <span>{thread.messages.length} messages</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteThread(thread.id)}
                    className="grid size-8 place-items-center rounded-lg text-white/20 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    title="Delete thread"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
