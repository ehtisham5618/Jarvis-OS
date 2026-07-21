import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/user.store";

export const Route = createFileRoute("/setup/")({
  component: WelcomeStep,
});

function WelcomeStep() {
  const navigate = useNavigate();
  const { setProfile } = useUserStore();

  const handleStart = () => {
    // Initialize empty profile
    setProfile({
      displayName: "",
      preferredName: "",
      avatarInitials: "",
      language: navigator.language || "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      theme: "dark",
      accentColor: "blue",
      personality: "professional",
      autonomyLevel: "observe",
      voiceEnabled: false,
      voiceWakeWord: "Jarvis",
      ttsVoice: "default",
      telemetryEnabled: false,
      memoryEnabled: true,
      cloudSyncEnabled: false,
      setupComplete: false,
      setupVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    navigate({ to: "/setup/profile" });
  };

  return (
    <div className="flex flex-col items-center p-12 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#61c7ff,transparent_70%)] blur-2xl opacity-40" />
        <div className="relative grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-glass">
          <Sparkles className="size-10 text-white" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="mb-4 text-4xl font-light tracking-tight text-gradient">Welcome to Jarvis</h1>
      <p className="mb-10 text-lg text-muted-foreground">
        The intelligence of your computer. <br />
        Let's configure your desktop environment.
      </p>

      <button
        onClick={handleStart}
        className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Begin Initialization
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
