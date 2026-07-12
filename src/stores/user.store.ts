import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/services/interfaces/IUserService";
import { StorageKeys } from "@/core/constants";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeSetup: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() } : null,
        })),
      completeSetup: () =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, setupComplete: true } : null,
        })),
    }),
    {
      name: StorageKeys.userProfile,
    },
  ),
);
