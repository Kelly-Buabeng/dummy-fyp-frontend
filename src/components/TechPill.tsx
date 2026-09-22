import type { ReactNode } from "react";

export function TechPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-[13.5px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}
