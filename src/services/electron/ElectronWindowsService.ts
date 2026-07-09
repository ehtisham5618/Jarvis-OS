/**
 * ElectronWindowsService
 *
 * Implements IWindowsService by delegating to window.jarvisOS IPC calls.
 * Used only when running inside Electron (contextBridge is available).
 */

import type {
  IWindowsService,
  ShellResult,
  NotificationOptions,
  FilePickerOptions,
} from "@/services/interfaces/IWindowsService";
import { Logger } from "@/core/logger";

const log = Logger.for("windows-service:electron");

export class ElectronWindowsService implements IWindowsService {
  private get api() {
    return (window as any).jarvisOS;
  }

  async exec(command: string, args: string[] = []): Promise<ShellResult> {
    log.debug(`exec: ${command} ${args.join(" ")}`);
    return this.api.shell.exec(command, args);
  }

  async openPath(path: string): Promise<void> {
    log.debug(`openPath: ${path}`);
    return this.api.shell.open(path);
  }

  async readClipboard(): Promise<string> {
    return this.api.clipboard.read();
  }

  async writeClipboard(text: string): Promise<void> {
    return this.api.clipboard.write(text);
  }

  async showNotification(opts: NotificationOptions): Promise<void> {
    log.debug(`showNotification: ${opts.title}`);
    return this.api.notification.show(opts.title, opts.body, opts.icon);
  }

  async pickFile(opts?: FilePickerOptions): Promise<string[] | null> {
    return this.api.dialog.openFile(opts);
  }

  async pickDir(opts?: { title?: string }): Promise<string | null> {
    return this.api.dialog.openDir(opts);
  }

  async saveFile(opts?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null> {
    return this.api.dialog.saveFile(opts);
  }

  async killProcess(pid: number): Promise<void> {
    log.info(`killProcess: PID ${pid}`);
    return this.api.process.kill(pid);
  }

  async getEnv(key: string): Promise<string | null> {
    return this.api.process.getEnv(key);
  }
}
