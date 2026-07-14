import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/user.store";
import { useState } from "react";

export const Route = createFileRoute("/setup/profile")({
  component: ProfileStep,
});

function ProfileStep() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();
  const [name, setName] = useState(profile?.displayName || "");

  const handleNext = () => {
    if (!name.trim()) return;

    // Generate initials (up to 2 letters)
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    updateProfile({
      displayName: name.trim(),
      preferredName: name.trim().split(" ")[0], // First name as preferred
      avatarInitials: initials,
    });

    navigate({ to: "/setup/ai" });
  };

  return (
    <div className="flex flex-col p-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-xl bg-surface shadow-glass">
          <User className="size-6 text-[#61c7ff]" />
        </div>
        <div>
          <h2 className="text-2xl font-light tracking-tight">Identity</h2>
          <p className="text-sm text-muted-foreground">How should Jarvis address you?</p>
        </div>
      </div>

      <div className="mb-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            placeholder="e.g. Tony Stark"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-muted-foreground focus:border-[#4f7dff] focus:outline-none focus:ring-1 focus:ring-[#4f7dff] transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-[#61c7ff]" />
          <div className="size-2 rounded-full bg-white/20" />
          <div className="size-2 rounded-full bg-white/20" />
        </div>
        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="group flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50 disabled:hover:bg-white"
        >
          Continue
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
