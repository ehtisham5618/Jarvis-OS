import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/desktop/Shell";
import { FileBrowser } from "@/components/filesystem/FileBrowser";
import { Home, Download, FileText, Monitor } from "lucide-react";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Files - Jarvis" },
      { name: "description", content: "Browse your local file system with Jarvis." },
    ],
  }),
  component: Files,
});

// Common sidebar shortcuts resolved from the current user profile.
const SHORTCUTS = [
  { label: "Home", icon: Home, folder: "" },
  { label: "Desktop", icon: Monitor, folder: "Desktop" },
  { label: "Downloads", icon: Download, folder: "Downloads" },
  { label: "Documents", icon: FileText, folder: "Documents" },
];

function Files() {
  const [activePath, setActivePath] = useState<string>();
  const [home, setHome] = useState<string>();
  useEffect(() => {
    void window.jarvisOS?.process
      .getEnv("USERPROFILE")
      .then((value) => {
        if (value) {
          setHome(value);
          setActivePath(value);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Shell showWidgets={false}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-white/[0.04] px-6 py-4">
          <h1 className="text-xl font-medium text-white/90">Files</h1>
          <p className="mt-0.5 text-sm text-white/40">Browse your local file system</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar shortcuts */}
          <div className="w-48 shrink-0 border-r border-white/[0.04] p-3 space-y-1">
            {SHORTCUTS.map(({ label, icon: Icon, folder }) => {
              const path = home ? `${home}${folder ? "\\" + folder : ""}` : undefined;
              return (
                <button
                  key={label}
                  disabled={!path}
                  onClick={() => setActivePath(path)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    activePath === path
                      ? "bg-[#4f7dff]/15 text-white"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white/85",
                  ].join(" ")}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Main file browser */}
          <div className="flex-1 overflow-hidden">
            <FileBrowser startPath={activePath} key={activePath} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
