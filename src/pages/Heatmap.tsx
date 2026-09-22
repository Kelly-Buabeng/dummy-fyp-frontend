import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlowField } from "@/components/GlowField";
import { HeatmapView } from "@/components/HeatmapView";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useApiQuery } from "@/hooks/useApiQuery";
import { RoadGuardApi } from "@/lib/api";

const POINT_LIMITS = ["200", "500", "1000", "2000"];

export default function Heatmap() {
  useDocumentHead(
    "Pothole Heatmap — RoadGuard AI",
    "Live map of confirmed pothole detections across Ghana, weighted by confidence, sourced from RoadGuard AI's public /api/v1/heatmap endpoint."
  );

  const [minConfidence, setMinConfidence] = useState(0.4);
  const [limit, setLimit] = useState("500");

  const fetchPoints = useCallback(
    (signal: AbortSignal) => RoadGuardApi.heatmap({ limit: parseInt(limit, 10), minConfidence }, signal),
    [limit, minConfidence]
  );
  const { data: points, loading, error, refetch } = useApiQuery(fetchPoints, [limit, minConfidence]);

  const pointCount = points
    ? points.length === 0
      ? "0 points at this confidence threshold."
      : `${points.length.toLocaleString()} point${points.length === 1 ? "" : "s"} shown.`
    : loading
      ? "Loading points…"
      : "Couldn't load points.";

  return (
    <>
      <section className="relative overflow-hidden px-5 pt-16 pb-5 sm:px-8 sm:pt-24">
        <GlowField />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <span className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/4 px-3.5 py-1.5 text-[13px] text-muted-foreground">
            <span className="size-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]" />
            Public data · GET /api/v1/heatmap
          </span>
          <h1 className="max-w-[22ch] text-[clamp(32px,5vw,58px)] leading-[1.05] font-bold tracking-tight">
            Every confirmed pothole, <span className="gradient-text">on the map.</span>
          </h1>
          <p className="mt-5.5 max-w-[46ch] text-[clamp(16px,2vw,21px)] text-muted-foreground">
            Weighted by detection confidence and refreshed on demand — this is the same feed a road
            authority dashboard would consume.
          </p>
        </div>
      </section>

      <section className="px-5 pt-2.5 pb-14 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-[1180px] rounded-xl border border-border bg-card p-6 sm:p-7">
          <div className="mb-4.5 flex flex-wrap items-center gap-3.5">
            <div className="min-w-[200px] flex-1">
              <label className="mb-2 block text-[13.5px] font-semibold text-muted-foreground">
                Minimum confidence: {minConfidence.toFixed(2)}
              </label>
              <Slider
                value={[minConfidence]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([v]) => setMinConfidence(v)}
              />
            </div>
            <div>
              <label className="mb-2 block text-[13.5px] font-semibold text-muted-foreground">Max points</label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POINT_LIMITS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="secondary" size="sm" className="self-end" onClick={refetch} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive">
              {error}
            </div>
          )}
          {!error && points && points.length === 0 && (
            <div className="mb-4 rounded-lg border border-[var(--grad-1)]/30 bg-[color-mix(in_srgb,var(--grad-1)_8%,transparent)] p-3.5 text-sm">
              No potholes match this filter yet. Try lowering the minimum confidence, or check back after new
              detections come in.
            </div>
          )}

          <div className="h-[min(70vh,640px)] min-h-90">
            <HeatmapView points={points ?? []} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span>Low intensity</span>
              <span
                className="h-2.5 w-15 rounded-full"
                style={{ background: "linear-gradient(90deg, #2563eb, #34c759, #ff9f0a, #ff3b30)" }}
              />
              <span>High intensity</span>
            </div>
            <span className="text-[13px] text-muted-foreground">{pointCount}</span>
          </div>
        </div>
      </section>
    </>
  );
}
