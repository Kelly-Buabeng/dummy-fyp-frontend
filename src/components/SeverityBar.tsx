import type { SeverityBreakdown } from "@/lib/types";

export function SeverityBar({ breakdown }: { breakdown: SeverityBreakdown }) {
  const total = breakdown.high + breakdown.medium + breakdown.low || 1;

  return (
    <div
      className="flex h-2 min-w-[120px] overflow-hidden rounded-full bg-foreground/6"
      title={`High ${breakdown.high} · Medium ${breakdown.medium} · Low ${breakdown.low}`}
    >
      <span className="block h-full bg-destructive" style={{ width: `${(breakdown.high / total) * 100}%` }} />
      <span className="block h-full bg-warning" style={{ width: `${(breakdown.medium / total) * 100}%` }} />
      <span className="block h-full bg-success" style={{ width: `${(breakdown.low / total) * 100}%` }} />
    </div>
  );
}
