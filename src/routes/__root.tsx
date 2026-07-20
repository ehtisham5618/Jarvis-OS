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
    initializeJarvis().then(() => setInitialized(true));
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

  // Handle Voice Hotkey
  useEffect(() => {
    if (typeof window !== "undefined" && window.jarvisOS?.voice?.onHotkeyToggle) {
      return window.jarvisOS.voice.onHotkeyToggle(() => {
        navigate({ to: "/voice" });
      });
    }
  }, [navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
