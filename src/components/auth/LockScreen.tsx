import { useState, useEffect, useRef, useCallback } from "react";
import { createHash } from "crypto";
import { Shield, Fingerprint, AlertCircle, Lock } from "lucide-react";

interface LockScreenProps {
  onUnlocked: () => void;
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function LockScreen({ onUnlocked }: LockScreenProps) {
  const [pin, setPin]               = useState<string[]>([]);
  const [error, setError]           = useState<string>("");
  const [shake, setShake]           = useState(false);
  const [lockoutSecs, setLockoutSecs] = useState(0);
  const [helloLoading, setHelloLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSecs <= 0) return;
    intervalRef.current = setInterval(() => {
      setLockoutSecs((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [lockoutSecs]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const submitPin = useCallback(async (digits: string[]) => {
    if (lockoutSecs > 0) return;
    const pinStr = digits.join("");
    const hasElectron = typeof window !== "undefined" && window.jarvisOS?.auth;

    if (hasElectron) {
      const res = await window.jarvisOS.auth.unlockPin(pinStr);
      if (res.success) {
        onUnlocked();
      } else if (res.reason === "locked_out") {
        setLockoutSecs(res.secsLeft ?? 30);
        setError(`Too many attempts. Wait ${res.secsLeft}s.`);
        triggerShake();
      } else {
        setError(`Wrong PIN. ${res.attemptsLeft} attempt${res.attemptsLeft !== 1 ? "s" : ""} left.`);
        triggerShake();
      }
    } else {
      // Browser dev mode: any 6-digit PIN works
      onUnlocked();
    }
    setPin([]);
  }, [lockoutSecs, onUnlocked]);

  const handleDigit = (d: string) => {
    if (lockoutSecs > 0) return;
    setError("");
    const next = [...pin, d];
    setPin(next);
    if (next.length === 6) submitPin(next);
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const handleWindowsHello = async () => {
    setHelloLoading(true);
    setError("");
    const hasElectron = typeof window !== "undefined" && window.jarvisOS?.auth;
    if (hasElectron) {
      const res = await window.jarvisOS.auth.unlockHello();
      if (res.success) {
        onUnlocked();
      } else {
        setError("Windows Hello verification failed.");
        triggerShake();
      }
    } else {
      onUnlocked(); // dev mode
    }
    setHelloLoading(false);
  };

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020408]">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 size-80 rounded-full bg-[#4f7dff]/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 size-80 rounded-full bg-[#7b5cff]/10 blur-[120px]" />
      </div>

      {/* Card */}
      <div className={`relative z-10 flex flex-col items-center gap-8 ${shake ? "animate-shake" : ""}`}>
        {/* Logo + Lock indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-20 place-items-center rounded-3xl border border-white/[0.06] bg-white/[0.03] shadow-[0_0_60px_-10px_rgba(79,125,255,0.3)]">
            <Lock className="size-9 text-[#61c7ff]" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Jarvis is locked</h1>
            <p className="mt-1 text-sm text-white/40">Enter your PIN to continue</p>
          </div>
        </div>

        {/* PIN dots */}
        <div className="flex items-center gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`size-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? "scale-110 border-[#61c7ff] bg-[#61c7ff] shadow-[0_0_10px_#61c7ff]"
                  : "border-white/20 bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Error / Lockout */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {lockoutSecs > 0 ? `Locked out — ${lockoutSecs}s remaining` : error}
          </div>
        )}

        {/* PIN Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                if (d === "⌫") handleBackspace();
                else if (d !== "") handleDigit(d);
              }}
              disabled={lockoutSecs > 0 || d === ""}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-medium transition-all duration-150 
                ${d === "" ? "pointer-events-none opacity-0" : "border-white/[0.06] bg-white/[0.03] text-white/80 hover:bg-white/[0.08] hover:border-white/20 active:scale-95"}
                ${d === "⌫" ? "text-sm text-white/40" : ""}
                ${lockoutSecs > 0 ? "opacity-30 cursor-not-allowed" : ""}
              `}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Windows Hello */}
        <button
          onClick={handleWindowsHello}
          disabled={helloLoading || lockoutSecs > 0}
          className="flex items-center gap-2 rounded-xl border border-[#4f7dff]/30 bg-[#4f7dff]/10 px-6 py-3 text-sm font-medium text-[#61c7ff] transition hover:bg-[#4f7dff]/20 disabled:opacity-40"
        >
          <Fingerprint className={`size-4 ${helloLoading ? "animate-pulse" : ""}`} />
          {helloLoading ? "Verifying…" : "Use Windows Hello"}
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
}
