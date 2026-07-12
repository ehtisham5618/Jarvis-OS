import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Power } from "lucide-react";
import { useUserStore } from "@/stores/user.store";
import { useState } from "react";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";

export const Route = createFileRoute("/setup/complete")({
  component: CompleteStep,
});

function CompleteStep() {
  const navigate = useNavigate();
  const { profile, completeSetup } = useUserStore();
  const [booting, setBooting] = useState(false);

  const handleFinish = async () => {
    setBooting(true);
    
    // Simulate boot sequence
    await new Promise(r => setTimeout(r, 1500));
    
    // Check AI status
    try {
      const ai = serviceRegistry.resolve<import("@/services/interfaces/IAIService").IAIService>(ServiceToken.AI);
      await ai.isAvailable();
    } catch {
      // Ignore
    }

    completeSetup();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex flex-col items-center p-12 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#4ade80,transparent_70%)] blur-2xl opacity-40" />
        <div className="relative grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#4ade80] to-[#16a34a] shadow-glowGreen">
          <CheckCircle className="size-10 text-white" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="mb-2 text-3xl font-light tracking-tight text-white">
        Initialization Complete
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Welcome aboard, {profile?.preferredName || "Commander"}.<br />
        Jarvis is ready to assist you.
      </p>

      <div className="flex items-center justify-between w-full mt-4">
        <div className="flex gap-2">
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-[#4ade80]" />
        </div>
        
        <button
          onClick={handleFinish}
          disabled={booting}
          className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-80"
        >
          {booting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Booting System...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Launch Jarvis
              <Power className="size-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
