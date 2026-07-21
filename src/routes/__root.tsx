import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { initializeJarvis } from "@/core/init";
import { LockScreen } from "@/components/auth/LockScreen";
import { UpdateNotification } from "@/components/app/UpdateNotification";
import { useSettingsStore } from "@/stores/settings.store";

function NotFoundComponent() {
  return (
    <div className="wallpaper-shell relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-gradient-brand text-7xl font-medium tracking-tight">
          404
        </h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">
          Jarvis couldn't locate that surface
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The workspace you're looking for doesn't exist in memory.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-xl font-medium text-foreground">
          Jarvis intercepted an error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recovery available. No workspace data was lost.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Jarvis — AI-Native Desktop OS" },
        {
          name: "description",
          content:
            "Jarvis is the world's first AI-native desktop environment. The computer, redesigned to understand intent instead of commands.",
        },
        { name: "author", content: "Jarvis Labs" },
        { property: "og:title", content: "Jarvis — AI-Native Desktop OS" },
        {
          property: "og:description",
          content:
            "The desktop operating environment of 2035. Elegant, intelligent, effortless.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    performance.mark("T2");
    console.log(`[renderer] T2: First paint at ${performance.now().toFixed(2)}ms`);
    initializeJarvis().then(() => {
      performance.mark("T3");
      console.log(`[renderer] T3: Shell interactive at ${performance.now().toFixed(2)}ms`);
      setInitialized(true);
    });

    // M12: Renderer crash handler → logs unhandled errors
    const origOnError = window.onerror;
    window.onerror = (msg, src, line, col, err) => {
      console.error("[renderer] Unhandled error:", msg, src, line, col, err);
      if (origOnError) origOnError(msg, src, line, col, err);
      return false;
    };
    const origOnUnhandled = window.onunhandledrejection;
    window.onunhandledrejection = (e) => {
      console.error("[renderer] Unhandled rejection:", e.reason);
      if (origOnUnhandled) origOnUnhandled.call(window, e);
    };
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-2 border-[#61c7ff] border-t-transparent" />
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#61c7ff]">
            Booting Executive Intelligence
          </div>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const { security } = useSettingsStore();
  const [locked, setLocked] = useState(false);

  // Handle Voice Hotkey
  useEffect(() => {
    if (typeof window !== "undefined" && window.jarvisOS?.voice?.onHotkeyToggle) {
      return window.jarvisOS.voice.onHotkeyToggle(() => {
        navigate({ to: "/voice" });
      });
    }
  }, [navigate]);

  // Listen for lock/unlock events from main process
  useEffect(() => {
    if (typeof window !== "undefined" && window.jarvisOS?.auth) {
      const unsubLock   = window.jarvisOS.auth.onLocked(()   => setLocked(true));
      const unsubUnlock = window.jarvisOS.auth.onUnlocked(() => setLocked(false));
      // Check initial lock status
      window.jarvisOS.auth.status().then((s: any) => { if (s?.locked) setLocked(true); });
      return () => { unsubLock?.(); unsubUnlock?.(); };
    }
  }, []);

  // Privacy mode hotkey Ctrl+Shift+P
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        useSettingsStore.getState().setPrivacyMode(!useSettingsStore.getState().security.privacyMode);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Auto-update notification (M12) */}
      <UpdateNotification />
      {/* Privacy mode banner */}
      {security.privacyMode && (
        <div className="fixed top-0 left-0 right-0 z-[9990] flex items-center justify-between px-8 py-2 text-xs font-medium" style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
          <span className="flex items-center gap-2 text-amber-400"><span className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Privacy Mode Active — AI requests stay local only</span>
          <button onClick={() => useSettingsStore.getState().setPrivacyMode(false)} className="text-amber-400/60 hover:text-amber-400">Disable</button>
        </div>
      )}
      <Outlet />
      {/* Lock screen overlay */}
      {locked && <LockScreen onUnlocked={() => setLocked(false)} />}
    </QueryClientProvider>
  );
}
