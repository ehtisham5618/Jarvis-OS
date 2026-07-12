import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useUserStore } from "@/stores/user.store";
import { useEffect } from "react";
import { Wallpaper } from "@/components/desktop/Wallpaper";

export const Route = createFileRoute("/setup")({
  component: SetupLayout,
});

function SetupLayout() {
  const { profile } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If setup is already complete, redirect to home
    if (profile?.setupComplete) {
      navigate({ to: "/", replace: true });
    }
  }, [profile, navigate]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background text-foreground">
      <Wallpaper />
      <div className="relative z-10 flex flex-1 items-center justify-center p-8">
        <div className="glass-strong w-full max-w-xl animate-fade-in-scale overflow-hidden rounded-3xl">
          <div className="bg-[rgba(5,6,8,0.5)]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
