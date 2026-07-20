import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/desktop/Shell";
import { PageHeader } from "@/components/desktop/primitives";
import { Box, Plug, Upload, Download, Power, Play, Search, FolderUp } from "lucide-react";
import { usePluginStore } from "@/stores/plugin.store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Developer · Jarvis" },
      { name: "description", content: "Extend Jarvis with custom capabilities and UI panels." },
    ],
  }),
  component: Developer,
});

function Developer() {
  const { plugins, marketplaceListings, isLoading, loadInstalled, loadMarketplace, install, enable, disable, uninstall } = usePluginStore();
  const [activeTab, setActiveTab] = useState<"installed" | "marketplace">("installed");

  useEffect(() => {
    loadInstalled();
    loadMarketplace();
  }, []);

  const handleLoadUnpacked = async () => {
    if (typeof window !== "undefined" && window.jarvisOS) {
      const result = await window.jarvisOS.dialog.openDir({
        title: "Load Unpacked Plugin",
      });
      if (result) {
        await install(result);
      }
    }
  };

  return (
    <Shell showWidgets={false}>
      <div className="mx-auto max-w-7xl px-12 py-16">
        <PageHeader
          eyebrow="Plugin SDK"
          title="Developer Hub"
          subtitle="Build, test, and distribute custom capabilities and panels for Jarvis."
          right={
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition hover:bg-white/[0.07]">
                <Box className="size-4" /> SDK Docs
              </button>
              <button
                onClick={handleLoadUnpacked}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#7b5cff] px-4 py-2.5 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(79,125,255,0.5)] transition hover:brightness-110"
              >
                <FolderUp className="size-4" /> Load Unpacked
              </button>
            </div>
          }
        />

        <div className="mb-6 flex items-center gap-6 border-b border-white/[0.06] pb-2">
          <button
            onClick={() => setActiveTab("installed")}
            className={`text-sm font-medium pb-2 border-b-2 transition ${activeTab === "installed" ? "border-[#61c7ff] text-[#61c7ff]" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Installed Plugins
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`text-sm font-medium pb-2 border-b-2 transition ${activeTab === "marketplace" ? "border-[#61c7ff] text-[#61c7ff]" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Marketplace
          </button>
        </div>

        {activeTab === "installed" && (
          <div>
            {isLoading ? (
              <div className="text-white/50 text-sm">Loading plugins...</div>
            ) : plugins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Plug className="size-8 mx-auto mb-3 text-white/20" />
                <div className="text-sm font-medium">No plugins loaded</div>
                <div className="text-xs text-white/40 mt-1">Load an unpacked plugin folder to start developing.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium">{plugin.name}</div>
                        <div className="text-[10px] text-white/40">{plugin.id} v{plugin.version}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => disable(plugin.id)} className="p-1 rounded hover:bg-white/10 text-white/40" title="Disable"><Power className="size-3" /></button>
                        <button onClick={() => uninstall(plugin.id)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400" title="Uninstall"><TrashIcon /></button>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mb-4 line-clamp-2">{plugin.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {plugin.permissions.map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[9px] text-white/50 uppercase">{p}</span>
                      ))}
                    </div>
                    {plugin.contributes.capabilities && (
                      <div className="text-xs text-[#61c7ff] font-medium border-t border-white/5 pt-2">
                        + {plugin.contributes.capabilities.length} capabilities
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "marketplace" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceListings.map((listing) => (
                <div key={listing.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="text-sm font-medium mb-1">{listing.name}</div>
                  <div className="text-[10px] text-white/40 mb-3">by {listing.author} · v{listing.version}</div>
                  <p className="text-xs text-white/60 mb-4 h-8">{listing.description}</p>
                  <button className="w-full flex justify-center items-center gap-2 rounded-lg bg-white/5 py-2 text-xs font-medium hover:bg-white/10 transition">
                    <Download className="size-3" /> Install
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  );
}
