import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StorageKeys } from "@/core/constants";

interface SettingsState {
  voice: {
    autoSpeak: boolean;
    activeMicrophoneId: string | null;
    activeVoiceId: string | null;
  };
  setAutoSpeak: (val: boolean) => void;
  setActiveMicrophone: (id: string) => void;
  setActiveVoice: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voice: {
        autoSpeak: false,
        activeMicrophoneId: null,
        activeVoiceId: null,
      },
      setAutoSpeak: (val) => set((state) => ({ voice: { ...state.voice, autoSpeak: val } })),
      setActiveMicrophone: (id) => set((state) => ({ voice: { ...state.voice, activeMicrophoneId: id } })),
      setActiveVoice: (id) => set((state) => ({ voice: { ...state.voice, activeVoiceId: id } })),
    }),
    {
      name: "jarvis:settings",
    }
  )
);
