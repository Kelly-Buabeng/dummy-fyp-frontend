import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  index?: number;
  trigger?: "mount" | "visible";
  className?: string;
}

/** Thin wrapper around useReveal for staggered fade-up entrances in JSX. */
export function Reveal({ children, index = 0, trigger = "visible", className }: RevealProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(trigger);

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      className={cn("reveal", className)}
      style={{ "--reveal-index": index } as CSSProperties}
    >
      {children}
    </div>
  );
}
