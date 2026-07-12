import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrainCircuit, ArrowRight, ArrowLeft } from "lucide-react";
import { useUserStore } from "@/stores/user.store";
import type { AutonomyLevel } from "@/services/interfaces/IUserService";

export const Route = createFileRoute("/setup/ai")({
  component: AIStep,
});

const AUTONOMY_LEVELS: { id: AutonomyLevel; title: string; desc: string }[] = [
  { 
    id: "observe", 
    title: "Observer (Default)", 
    desc: "Jarvis can only read data and suggest actions. You must manually approve everything." 
  },
  { 
    id: "assist", 
    title: "Assistant", 
    desc: "Jarvis can perform minor actions on your behalf but will prompt for confirmations." 
  },
  { 
    id: "trusted", 
    title: "Trusted", 
    desc: "Jarvis acts independently for most tasks. Best for experienced users." 
  },
];

function AIStep() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();

  const handleSelect = (level: AutonomyLevel) => {
    updateProfile({ autonomyLevel: level });
  };

  const handleNext = () => navigate({ to: "/setup/complete" });
  const handleBack = () => navigate({ to: "/setup/profile" });

  return (
    <div className="flex flex-col p-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-xl bg-surface shadow-glass">
          <BrainCircuit className="size-6 text-[#7b5cff]" />
        </div>
        <div>
          <h2 className="text-2xl font-light tracking-tight">Intelligence</h2>
          <p className="text-sm text-muted-foreground">Set Jarvis's autonomy boundaries.</p>
        </div>
      </div>

      <div className="mb-10 space-y-3">
        {AUTONOMY_LEVELS.map((level) => {
          const isSelected = profile?.autonomyLevel === level.id;
          return (
            <button
              key={level.id}
              onClick={() => handleSelect(level.id)}
              className={`flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                isSelected 
                  ? "border-[#7b5cff] bg-[#7b5cff]/10" 
                  : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/40"
              }`}
            >
              <span className="font-medium text-foreground">{level.title}</span>
              <span className="text-xs text-muted-foreground">{level.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-[#7b5cff]" />
          <div className="size-2 rounded-full bg-white/20" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex items-center justify-center rounded-full bg-surface px-6 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="group flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Continue
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
