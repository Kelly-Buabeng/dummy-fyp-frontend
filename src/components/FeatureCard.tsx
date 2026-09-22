import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <Card className="gap-0 p-6 sm:p-7">
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(115deg, color-mix(in srgb, var(--grad-1) 16%, transparent) 0%, color-mix(in srgb, var(--grad-2) 16%, transparent) 52%, color-mix(in srgb, var(--grad-3) 16%, transparent) 100%)",
        }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-[19px] font-semibold">{title}</h3>
      <p className="text-[15px] text-muted-foreground">{children}</p>
    </Card>
  );
}
