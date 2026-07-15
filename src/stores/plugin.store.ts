import { create } from "zustand";
import type { PluginManifest } from "@/plugins/types/PluginManifest";
import { Logger } from "@/core/logger";

const log = Logger.for("plugin.store");

export interface PluginListing {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloadUrl: string;
}

interface PluginState {
  plugins: PluginManifest[];
  marketplaceListings: PluginListing[];
  isLoading: boolean;

  loadInstalled(): Promise<void>;
  loadMarketplace(): Promise<void>;
  install(source: string): Promise<void>;
  uninstall(id: string): Promise<void>;
  enable(id: string): Promise<void>;
  disable(id: string): Promise<void>;
}

const isBrowser = typeof window !== "undefined" && !("jarvisOS" in window);

async function ipc<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isBrowser) return fallback;
  try {
    return await fn();
  } catch (err) {
    log.error("Plugin IPC error", { error: err });
    return fallback;
  }
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],
  marketplaceListings: [],
  isLoading: false,

  async loadInstalled() {
    set({ isLoading: true });
    const plugins = await ipc(() => window.jarvisOS.plugins.list(), MOCK_PLUGINS);
    set({ plugins, isLoading: false });
  },

  async loadMarketplace() {
    // In a real implementation, this would fetch from a registry URL.
    // For now, we'll just mock it.
    set({
      marketplaceListings: [
        {
          id: "com.example.spotify",
          name: "Spotify Controller",
          description: "Control Spotify playback directly from Jarvis.",
          author: "Jane Doe",
          version: "1.0.0",
          downloadUrl: "https://example.com/spotify-plugin.zip",
        },
        {
          id: "com.example.github",
          name: "GitHub Integration",
          description: "View PRs and issues in Jarvis.",
          author: "John Smith",
          version: "0.9.5",
          downloadUrl: "https://example.com/github-plugin.zip",
        },
      ],
    });
  },

  async install(source) {
    await ipc(() => window.jarvisOS.plugins.install(source), undefined);
    await get().loadInstalled();
  },

  async uninstall(id) {
    await ipc(() => window.jarvisOS.plugins.uninstall(id), undefined);
    await get().loadInstalled();
  },

  async enable(id) {
    await ipc(() => window.jarvisOS.plugins.enable(id), undefined);
    // Real logic would track active vs inactive in the manifest or another settings file
    // For now, reload
    await get().loadInstalled();
  },

  async disable(id) {
    await ipc(() => window.jarvisOS.plugins.disable(id), undefined);
    // Real logic would track active vs inactive
    await get().loadInstalled();
  },
}));

const MOCK_PLUGINS: PluginManifest[] = [
  {
    id: "com.jarvis.sample-plugin",
    name: "Sample Plugin",
    version: "1.0.0",
    description: "A sample plugin that adds clipboard summarization.",
    author: "Jarvis Devs",
    permissions: ["clipboard", "notifications"],
    main: "index.js",
    minJarvisVersion: "1.0.0",
    contributes: {
      capabilities: [
        {
          id: "summarize_clipboard",
          name: "Summarize Clipboard",
          description: "Reads the clipboard and summarizes it.",
        },
      ],
    },
  },
];
