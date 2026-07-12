export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden>
      {/* base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,40,80,0.35),transparent_60%)]" />
      {/* drifting nebulae */}
      <div className="animate-drift-a absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(79,125,255,0.28),transparent_60%)] blur-3xl" />
      <div className="animate-drift-b absolute top-[30%] -right-[15%] h-[65vh] w-[65vw] rounded-full bg-[radial-gradient(circle,rgba(123,92,255,0.22),transparent_60%)] blur-3xl" />
      <div className="animate-drift-c absolute -bottom-[25%] left-[20%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(97,199,255,0.15),transparent_60%)] blur-3xl" />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
