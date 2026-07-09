/**
 * MockWindowsService
 *
 * Simulates OS integration for browser dev mode (no Electron available).
 * All operations log to console and return realistic mock data.
 */

import type {
  IWindowsService,
  ShellResult,
  NotificationOptions,
  FilePickerOptions,
} from "@/services/interfaces/IWindowsService";
import { Logger } from "@/core/logger";

const log = Logger.for("windows-service:mock");

export class MockWindowsService implements IWindowsService {
  async exec(command: string, args: string[] = []): Promise<ShellResult> {
    log.debug(`[MOCK] exec: ${command} ${args.join(" ")}`);
    return {
      stdout: `[mock] ${command} ${args.join(" ")} executed successfully`,
      stderr: "",
      exitCode: 0,
    };
  }

  async openPath(path: string): Promise<void> {
    log.debug(`[MOCK] openPath: ${path}`);
  }

  async readClipboard(): Promise<string> {
    return "[clipboard content — mock mode]";
  }

  async writeClipboard(text: string): Promise<void> {
    log.debug(`[MOCK] writeClipboard: "${text.slice(0, 40)}..."`);
  }

  async showNotification(opts: NotificationOptions): Promise<void> {
    log.info(`[MOCK] Notification: "${opts.title}" — "${opts.body}"`);
    // In browser, fall back to the Notifications API if available
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(opts.title, { body: opts.body });
    }
  }

  async pickFile(_opts?: FilePickerOptions): Promise<string[] | null> {
    log.debug("[MOCK] pickFile: returning null (no dialog in browser)");
    return null;
  }

  async pickDir(_opts?: { title?: string }): Promise<string | null> {
    log.debug("[MOCK] pickDir: returning null");
    return null;
  }

  async saveFile(_opts?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null> {
    log.debug("[MOCK] saveFile: returning null");
    return null;
  }

  async killProcess(pid: number): Promise<void> {
    log.info(`[MOCK] killProcess: PID ${pid} (no-op in browser)`);
  }

  async getEnv(key: string): Promise<string | null> {
    const mockEnv: Record<string, string> = {
      USERPROFILE: "C:\\Users\\MockUser",
      USERNAME: "MockUser",
      HOME: "C:\\Users\\MockUser",
      OS: "Windows_NT",
      NODE_ENV: "development",
    };
    return mockEnv[key.toUpperCase()] ?? null;
  }
}
