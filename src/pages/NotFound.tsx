import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlowField } from "@/components/GlowField";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function NotFound() {
  useDocumentHead(
    "Page not found — RoadGuard AI",
    "This page doesn't exist. Head back to RoadGuard AI's home page, live demo, heatmap, or dashboard."
  );

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-5 py-16 text-center sm:px-8">
      <GlowField />
      <div className="relative z-10 mx-auto max-w-[1180px]">
        <span className="gradient-text text-[clamp(72px,16vw,160px)] leading-none font-extrabold tracking-tight">
          404
        </span>
        <p className="mx-auto mt-4 max-w-[46ch] text-[17px] text-muted-foreground">
          This road hasn't been mapped. The page you're looking for doesn't exist, or the link may be out of
          date.
        </p>
        <div className="mt-7.5 flex flex-wrap justify-center gap-3.5">
          <Button asChild size="lg">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/live-demo">Try live detection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
