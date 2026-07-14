import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";

export const Route = createFileRoute("/terminal")({
  head: () => ({
    meta: [
      { title: "Terminal · Jarvis" },
      {
        name: "description",
        content: "Sandboxed shell terminal inside the Jarvis desktop environment.",
      },
    ],
  }),
  component: TerminalRoute,
});

function TerminalRoute() {
  return (
    <Shell showWidgets={false}>
      <div className="flex h-full flex-col">
        <div className="border-b border-white/[0.04] px-6 py-4">
          <h1 className="text-xl font-medium text-white/90">Terminal</h1>
          <p className="mt-0.5 text-sm text-white/40">
            Sandboxed shell — only allowlisted commands may execute
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <TerminalPanel />
        </div>
      </div>
    </Shell>
  );
}
