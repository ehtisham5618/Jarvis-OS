import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  voice: {
    autoSpeak: boolean;
    activeMicrophoneId: string | null;
    activeVoiceId: string | null;
  };
  security: {
    privacyMode: boolean;
    requireAuth: boolean;
    autoLockMinutes: number;
    encryptionEnabled: boolean;
    pinHash: string | null;
  };

  // Voice setters
  setAutoSpeak: (val: boolean) => void;
  setActiveMicrophone: (id: string) => void;
  setActiveVoice: (id: string) => void;

  // Security setters
  setPrivacyMode: (val: boolean) => void;
  setRequireAuth: (val: boolean) => void;
  setAutoLockMinutes: (val: number) => void;
  setEncryptionEnabled: (val: boolean) => void;
  setPinHash: (hash: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voice: {
        autoSpeak: false,
        activeMicrophoneId: null,
        activeVoiceId: null,
      },
      security: {
        privacyMode: false,
        requireAuth: false,
        autoLockMinutes: 5,
        encryptionEnabled: false,
        pinHash: null,
      },

      // Voice
      setAutoSpeak: (val) => set((s) => ({ voice: { ...s.voice, autoSpeak: val } })),
      setActiveMicrophone: (id) => set((s) => ({ voice: { ...s.voice, activeMicrophoneId: id } })),
      setActiveVoice: (id) => set((s) => ({ voice: { ...s.voice, activeVoiceId: id } })),

      // Security
      setPrivacyMode: (val) => set((s) => ({ security: { ...s.security, privacyMode: val } })),
      setRequireAuth: (val) => set((s) => ({ security: { ...s.security, requireAuth: val } })),
      setAutoLockMinutes: (val) => set((s) => ({ security: { ...s.security, autoLockMinutes: val } })),
      setEncryptionEnabled: (val) => set((s) => ({ security: { ...s.security, encryptionEnabled: val } })),
      setPinHash: (hash) => set((s) => ({ security: { ...s.security, pinHash: hash } })),
    }),
    { name: "jarvis:settings" }
  )
);
