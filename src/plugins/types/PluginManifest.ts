export type PluginPermission =
  "fs.read" | "fs.write" | "shell.exec" | "network" | "clipboard" | "notifications";

export interface CapabilityContribution {
  id: string;
  name: string;
  description: string;
}

export interface PanelContribution {
  id: string;
  icon: string;
  title: string;
}

export interface CommandContribution {
  id: string;
  title: string;
}

export interface SettingContribution {
  key: string;
  type: "string" | "boolean" | "number";
  title: string;
  default: unknown;
}

export interface PluginManifest {
  id: string; // e.g., "com.jarvis.github-integration"
  name: string;
  version: string; // semver
  description: string;
  author: string;
  homepage?: string;
  icon?: string; // URL or relative path
  permissions: PluginPermission[];
  contributes: {
    capabilities?: CapabilityContribution[];
    panels?: PanelContribution[];
    commands?: CommandContribution[];
    settings?: SettingContribution[];
  };
  main: string; // entry point JS file
  minJarvisVersion: string;
}
