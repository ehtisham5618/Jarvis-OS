/**
 * TelemetryService.ts (M12)
 *
 * Privacy-first telemetry — only anonymous usage stats.
 * NO user content, file paths, or personal data is ever collected.
 *
 * Data stored locally in ~/.jarvis/telemetry.json and uploaded in daily batches.
 */

import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import log from "electron-log";

interface TelemetryPayload {
  anonymousId: string;    // Random UUID per installation, never tied to a person
  version: string;
  platform: string;
  launchCount: number;
  routesVisited: string[];  // route names only, no content
  featuresUsed: Record<string, boolean>;
  crashCount: number;
  date: string;             // YYYY-MM-DD (daily bucket)
}

let telemetry: TelemetryPayload | null = null;
let telemetryPath: string;
let telemetryEnabled = true; // Controlled by Settings → Privacy

function getTelemetryPath(): string {
  return path.join(app.getPath("userData"), "telemetry.json");
}

function generateAnonymousId(): string {
  // Simple random hex ID — not tied to any system identifier
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function initTelemetry(enabled: boolean = true): void {
  telemetryEnabled = enabled;
  if (!telemetryEnabled) return;

  telemetryPath = getTelemetryPath();

  try {
    if (fs.existsSync(telemetryPath)) {
      const raw = fs.readFileSync(telemetryPath, "utf-8");
      const parsed = JSON.parse(raw) as TelemetryPayload;
      // Reset daily bucket if date changed
      if (parsed.date !== getToday()) {
        telemetry = {
          ...parsed,
          launchCount: parsed.launchCount + 1,
          routesVisited: [],
          crashCount: 0,
          date: getToday(),
        };
      } else {
        telemetry = { ...parsed, launchCount: parsed.launchCount + 1 };
      }
    } else {
      telemetry = {
        anonymousId: generateAnonymousId(),
        version: app.getVersion(),
        platform: process.platform,
        launchCount: 1,
        routesVisited: [],
        featuresUsed: {},
        crashCount: 0,
        date: getToday(),
      };
    }
    saveTelemetry();
  } catch (err) {
    log.warn("[telemetry] Failed to initialize:", err);
  }
}

function saveTelemetry(): void {
  if (!telemetry) return;
  try {
    fs.writeFileSync(telemetryPath, JSON.stringify(telemetry, null, 2), "utf-8");
  } catch (err) {
    log.warn("[telemetry] Failed to save:", err);
  }
}

export function trackRoute(routeName: string): void {
  if (!telemetryEnabled || !telemetry) return;
  if (!telemetry.routesVisited.includes(routeName)) {
    telemetry.routesVisited.push(routeName);
    saveTelemetry();
  }
}

export function trackFeature(feature: string): void {
  if (!telemetryEnabled || !telemetry) return;
  telemetry.featuresUsed[feature] = true;
  saveTelemetry();
}

export function trackCrash(): void {
  if (!telemetryEnabled || !telemetry) return;
  telemetry.crashCount++;
  saveTelemetry();
}

export function setTelemetryEnabled(enabled: boolean): void {
  telemetryEnabled = enabled;
  log.info(`[telemetry] Telemetry ${enabled ? "enabled" : "disabled"}`);
}
