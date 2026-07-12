import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="mb-10 flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#61c7ff]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-gradient text-[44px] font-light leading-[1.05] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>{children}</div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}
