import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/lock")({
  head: () => ({
    meta: [
      { title: "Locked · Jarvis" },
      { name: "description", content: "Lock screen with ambient briefing." },
    ],
  }),
  component: Lock,
});

function Lock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <Wallpaper />
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-12 py-16">
        <div />
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#61c7ff]">
            {date}
          </div>
          <div className="mt-4 text-[180px] font-extralight leading-none tracking-tighter tabular-nums text-gradient">
            {time}
          </div>
          <div className="glass mx-auto mt-10 max-w-lg rounded-2xl p-5 text-left">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              Ambient briefing
            </div>
            <p className="text-sm font-light leading-relaxed text-white/85">
              14° and clear in London. 3 meetings today, first at 10am with the design team. Aether
              build passed. Battery at 87%.
            </p>
          </div>
        </div>
        <Link to="/" className="group flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur transition group-hover:border-[#4f7dff]/50 group-hover:bg-white/[0.08]">
            <Fingerprint className="size-6 text-[#61c7ff]" />
          </div>
          <span className="text-xs text-muted-foreground">
            Touch to unlock · or say "Hey Jarvis"
          </span>
        </Link>
      </div>
    </div>
  );
}
