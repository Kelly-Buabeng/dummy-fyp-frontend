import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  value: ReactNode;
  label: string;
  loading?: boolean;
  dark?: boolean;
}

export function StatTile({ value, label, loading = false, dark = false }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 text-left",
        dark && "border-white/16 bg-white/8 text-white"
      )}
    >
      {loading ? (
        <div className="h-9 w-[70%] animate-pulse rounded-md bg-foreground/10" />
      ) : (
        <div className="text-[clamp(30px,4vw,42px)] font-bold tracking-tight">{value}</div>
      )}
      <div
        className={cn(
          "mt-1.5 text-[13.5px] tracking-wide text-muted-foreground uppercase",
          dark && "text-white/60"
        )}
      >
        {label}
      </div>
    </div>
  );
}
