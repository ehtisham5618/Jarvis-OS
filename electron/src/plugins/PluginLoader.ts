import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import type { PluginManifest } from "../../../src/plugins/types/PluginManifest";

const PLUGINS_DIR = path.join(os.homedir(), ".jarvis", "plugins");

function ensurePluginsDir(): void {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }
}

export interface LoadedPlugin {
  manifest: PluginManifest;
  window: BrowserWindow;
  active: boolean;
}

const loadedPlugins = new Map<string, LoadedPlugin>();

/**
 * Loads a single plugin by its folder name inside ~/.jarvis/plugins/
 */
function loadPlugin(folderName: string): void {
  const pluginPath = path.join(PLUGINS_DIR, folderName);
  const manifestPath = path.join(pluginPath, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    return;
  }

  let manifest: PluginManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (err) {
    log.error(`[PluginLoader] Failed to parse manifest for ${folderName}:`, err);
    return;
  }

  const mainScriptPath = path.join(pluginPath, manifest.main);
  if (!fs.existsSync(mainScriptPath)) {
    log.error(`[PluginLoader] Main script ${manifest.main} not found for plugin ${manifest.id}`);
    return;
  }

  log.info(`[PluginLoader] Loading plugin: ${manifest.id} v${manifest.version}`);

  // Create a hidden, sandboxed window for this plugin
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "..", "preload.js"), // Use the main preload, or a specific plugin preload
    },
  });

  // Basic HTML wrapper to load the plugin's main script
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Plugin Sandbox: ${manifest.id}</title>
      </head>
      <body>
        <script>
          // The plugin code expects to have JarvisPluginSDK injected or imported.
          // For now, just load the script.
        </script>
        <script src="file://${mainScriptPath.replace(/\\/g, "/")}"></script>
      </body>
    </html>
  `;

  const htmlPath = path.join(app.getPath("userData"), `plugin_sandbox_${manifest.id}.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  win.loadFile(htmlPath);

  win.webContents.on("did-finish-load", () => {
    log.info(`[PluginLoader] Plugin ${manifest.id} initialized.`);
    // Send initialization data to the plugin, e.g., permissions
    win.webContents.send(`plugin:init`, { manifest });
  });

  loadedPlugins.set(manifest.id, { manifest, window: win, active: true });
}

export function loadAllPlugins(): void {
  ensurePluginsDir();

  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      loadPlugin(entry.name);
    }
  }
}

export function getLoadedPlugins(): PluginManifest[] {
  return Array.from(loadedPlugins.values()).map((p) => p.manifest);
}

export function unloadPlugin(id: string): void {
  const plugin = loadedPlugins.get(id);
  if (plugin) {
    log.info(`[PluginLoader] Unloading plugin: ${id}`);
    plugin.window.destroy();
    loadedPlugins.delete(id);
  }
}

export function registerPluginHandlers(): void {
  // We'll call loadAllPlugins() when the app is ready

  ipcMain.handle("plugin:list", () => {
    return getLoadedPlugins();
  });

  ipcMain.handle("plugin:install", async (_, sourcePath: string) => {
    // Basic implementation: copy folder to PLUGINS_DIR
    // For now, this is a placeholder. Real implementation would handle ZIP extraction or GitHub cloning.
    log.info(`[PluginLoader] Install requested from: ${sourcePath}`);
    const folderName = path.basename(sourcePath);
    const destPath = path.join(PLUGINS_DIR, folderName);

    if (sourcePath !== destPath) {
      try {
        fs.cpSync(sourcePath, destPath, { recursive: true });
      } catch (e) {
        log.error(`[PluginLoader] Failed to copy plugin from ${sourcePath} to ${destPath}`, e);
        throw e;
      }
    }

    loadPlugin(folderName);
    return true;
  });

  ipcMain.handle("plugin:uninstall", (_, id: string) => {
    unloadPlugin(id);
    // Remove from disk (simplified)
    const pluginFolders = fs.readdirSync(PLUGINS_DIR);
    for (const folder of pluginFolders) {
      const manifestPath = path.join(PLUGINS_DIR, folder, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        if (manifest.id === id) {
          fs.rmSync(path.join(PLUGINS_DIR, folder), { recursive: true, force: true });
          break;
        }
      }
    }
    return true;
  });

  ipcMain.handle("plugin:enable", (_, id: string) => {
    // Find the folder and reload
    const pluginFolders = fs.readdirSync(PLUGINS_DIR);
    for (const folder of pluginFolders) {
      const manifestPath = path.join(PLUGINS_DIR, folder, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        if (manifest.id === id) {
          loadPlugin(folder);
          break;
        }
      }
    }
    return true;
  });

  ipcMain.handle("plugin:disable", (_, id: string) => {
    unloadPlugin(id);
    return true;
  });
}
