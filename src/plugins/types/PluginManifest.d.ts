export type PluginPermission = "fs.read" | "fs.write" | "shell.exec" | "network" | "clipboard" | "notifications";
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
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    homepage?: string;
    icon?: string;
    permissions: PluginPermission[];
    contributes: {
        capabilities?: CapabilityContribution[];
        panels?: PanelContribution[];
        commands?: CommandContribution[];
        settings?: SettingContribution[];
    };
    main: string;
    minJarvisVersion: string;
}
//# sourceMappingURL=PluginManifest.d.ts.map