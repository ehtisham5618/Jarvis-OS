/**
 * AuthService — Milestone 10
 *
 * Manages app lock/unlock state. Supports PIN and Windows Hello authentication.
 * PIN is stored as a SHA-256 hash (never plaintext).
 * Windows Hello verification is performed via PowerShell.
 */

import { ipcMain, BrowserWindow } from "electron";
import { createHash, timingSafeEqual } from "crypto";
import { execSync } from "child_process";
import log from "electron-log";
import { auditService } from "./AuditService";

let isLocked = false;
let failedAttempts = 0;
let lockoutUntil: Date | null = null;

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

// In-memory PIN hash (loaded from settings at boot via IPC from renderer)
let storedPinHash: string | null = null;

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function isInLockout(): boolean {
  if (!lockoutUntil) return false;
  if (new Date() > lockoutUntil) {
    lockoutUntil = null;
    failedAttempts = 0;
    return false;
  }
  return true;
}

async function verifyWindowsHello(): Promise<boolean> {
  try {
    const ps = `
      Add-Type -AssemblyName System.Runtime.WindowsRuntime
      $result = [Windows.Security.Credentials.UI.UserConsentVerifier,Windows.Security.Credentials.UI,ContentType=WindowsRuntime]::RequestVerificationAsync("Unlock Jarvis").GetAwaiter().GetResult()
      if ($result -eq 'Verified') { exit 0 } else { exit 1 }
    `.trim();
    execSync(`powershell -NoProfile -Command "${ps}"`, { timeout: 30000 });
    return true;
  } catch {
    return false;
  }
}

export function registerAuthHandlers(): void {
  ipcMain.handle("auth:status", () => ({
    locked: isLocked,
    failedAttempts,
    lockoutUntil: lockoutUntil?.toISOString() ?? null,
  }));

  ipcMain.handle("auth:lock", () => {
    isLocked = true;
    // Notify all renderer windows
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("auth:locked");
    });
    log.info("[auth] App locked.");
    auditService.log({ category: "auth", action: "lock", actor: "user", status: "allowed" });
    return true;
  });

  ipcMain.handle("auth:set-pin", (_, pinHash: string) => {
    storedPinHash = pinHash;
    log.info("[auth] PIN updated.");
    auditService.log({ category: "auth", action: "set-pin", actor: "user", status: "allowed" });
    return true;
  });

  ipcMain.handle("auth:unlock-pin", (_, enteredPin: string) => {
    if (isInLockout()) {
      const secsLeft = Math.ceil((lockoutUntil!.getTime() - Date.now()) / 1000);
      return { success: false, reason: `locked_out`, secsLeft };
    }

    if (!storedPinHash) {
      // No PIN set — grant access
      isLocked = false;
      failedAttempts = 0;
      auditService.log({
        category: "auth",
        action: "unlock-pin",
        actor: "user",
        status: "allowed",
      });
      return { success: true };
    }

    const enteredHash = sha256(enteredPin);
    if (safeEqual(enteredHash, storedPinHash)) {
      isLocked = false;
      failedAttempts = 0;
      BrowserWindow.getAllWindows().forEach((w) => w.webContents.send("auth:unlocked"));
      log.info("[auth] Unlocked via PIN.");
      auditService.log({
        category: "auth",
        action: "unlock-pin",
        actor: "user",
        status: "allowed",
      });
      return { success: true };
    }

    failedAttempts++;
    log.warn(`[auth] Wrong PIN. Attempt ${failedAttempts}/${MAX_ATTEMPTS}`);
    auditService.log({
      category: "auth",
      action: "unlock-pin",
      actor: "user",
      status: "denied",
      details: { attempt: failedAttempts },
    });

    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = new Date(Date.now() + LOCKOUT_SECONDS * 1000);
      log.warn(`[auth] Too many failed attempts. Locked out for ${LOCKOUT_SECONDS}s.`);
      return { success: false, reason: "locked_out", secsLeft: LOCKOUT_SECONDS };
    }

    return { success: false, reason: "wrong_pin", attemptsLeft: MAX_ATTEMPTS - failedAttempts };
  });

  ipcMain.handle("auth:unlock-hello", async () => {
    const ok = await verifyWindowsHello();
    if (ok) {
      isLocked = false;
      failedAttempts = 0;
      BrowserWindow.getAllWindows().forEach((w) => w.webContents.send("auth:unlocked"));
      log.info("[auth] Unlocked via Windows Hello.");
      auditService.log({
        category: "auth",
        action: "unlock-hello",
        actor: "user",
        status: "allowed",
      });
      return { success: true };
    }
    auditService.log({ category: "auth", action: "unlock-hello", actor: "user", status: "denied" });
    return { success: false, reason: "hello_failed" };
  });
}

export const authService = {
  get isLocked() {
    return isLocked;
  },
  setStoredPinHash(h: string | null) {
    storedPinHash = h;
  },
};
