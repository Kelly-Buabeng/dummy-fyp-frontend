import { cn } from "@/lib/utils";

/**
 * The soft, pastel Apple Intelligence glow — three blurred gradient
 * orbs positioned behind hero copy. Kept as a standalone absolutely
 * positioned layer so it never affects document flow or intercepts
 * clicks.
 */
export function GlowField({ dark = false }: { dark?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={cn(
          "absolute -top-[14%] -left-[8%] size-[36vw] max-w-[440px] max-h-[440px] rounded-full opacity-40 blur-[80px]",
          dark && "opacity-50"
        )}
        style={{ background: "radial-gradient(circle, var(--grad-1), transparent 70%)" }}
      />
      <div
        className={cn(
          "absolute top-[4%] -right-[10%] size-[32vw] max-w-[400px] max-h-[400px] rounded-full opacity-40 blur-[80px]",
          dark && "opacity-50"
        )}
        style={{ background: "radial-gradient(circle, var(--grad-2), transparent 70%)" }}
      />
      <div
        className={cn(
          "absolute bottom-[-16%] left-[24%] size-[30vw] max-w-[380px] max-h-[380px] rounded-full opacity-40 blur-[80px]",
          dark && "opacity-50"
        )}
        style={{ background: "radial-gradient(circle, var(--grad-3), transparent 70%)" }}
      />
    </div>
  );
}
