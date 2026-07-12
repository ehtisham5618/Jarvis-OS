/**
 * IUserService — Profile and Preferences Contract
 *
 * Manages user identity, onboarding state, and preferences.
 */

export type Theme = "dark" | "light" | "auto";
export type AccentColor = "blue" | "purple" | "green" | "orange";
export type AIPersonality = "professional" | "friendly" | "concise" | "verbose";
export type AutonomyLevel = "observe" | "assist" | "trusted" | "power";

export interface UserProfile {
  // Identity
  displayName: string;
  preferredName: string;
  avatarInitials: string;

  // Locale
  language: string;
  timezone: string;

  // Appearance
  theme: Theme;
  accentColor: AccentColor;

  // AI Behavior
  personality: AIPersonality;
  autonomyLevel: AutonomyLevel;

  // Voice
  voiceEnabled: boolean;
  voiceWakeWord: string;
  ttsVoice: string;

  // Privacy
  telemetryEnabled: boolean;
  memoryEnabled: boolean;
  cloudSyncEnabled: boolean;

  // System
  setupComplete: boolean;
  setupVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUserService {
  /** Get the current user profile */
  getProfile(): Promise<UserProfile>;

  /** Update partial profile fields */
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;

  /** Reset profile to defaults (e.g., for factory reset) */
  resetProfile(): Promise<UserProfile>;

  /** Check if onboarding is complete */
  isSetupComplete(): Promise<boolean>;
}
