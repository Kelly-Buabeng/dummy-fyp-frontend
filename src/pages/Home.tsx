import { Link } from "react-router-dom";
import { Award, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowField } from "@/components/GlowField";
import { FeatureCard } from "@/components/FeatureCard";
import { StatTile } from "@/components/StatTile";
import { TechPill } from "@/components/TechPill";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useApiQuery } from "@/hooks/useApiQuery";
import { RoadGuardApi } from "@/lib/api";

const STEPS = [
  {
    num: "01",
    title: "Capture",
    body: "An ESP32-CAM unit or manual upload sends a road image with GPS coordinates from an onboard NEO-6M module.",
  },
  {
    num: "02",
    title: "Detect",
    body: "The image is scored by a YOLOv8 model fine-tuned on real pothole imagery, returning labels, confidence, and bounding boxes.",
  },
  {
    num: "03",
    title: "Store",
    body: "Confirmed potholes (≥ 0.4 confidence) are persisted to a geospatial Supabase table with device and timestamp metadata.",
  },
  {
    num: "04",
    title: "Act",
    body: "The heatmap, dashboard, and CSV/GeoJSON exports turn raw detections into a prioritized repair list for road authorities.",
  },
];

const TECH = ["YOLOv8", "FastAPI", "Supabase (PostGIS)", "ESP32-CAM", "NEO-6M GPS", "Leaflet", "Railway"];

export default function Home() {
  useDocumentHead(
    "RoadGuard AI — Real-time pothole detection for Ghana's roads",
    "RoadGuard AI detects potholes from road images in real time using YOLOv8, geotags them, and turns the results into a live heatmap and severity reports for road authorities."
  );

  const { data: stats, error: statsError } = useApiQuery((signal) => RoadGuardApi.stats(signal), []);

  return (
    <>
      <section className="relative overflow-hidden px-5 py-16 text-center sm:px-8 sm:py-24 lg:py-32">
        <GlowField />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <span className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/4 px-3.5 py-1.5 text-[13px] text-muted-foreground">
            <span className="size-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]" />
            Live on Ghana's road network
          </span>
          <h1 className="mx-auto max-w-[18ch] text-[clamp(38px,6.4vw,80px)] leading-[1.05] font-bold tracking-tight">
            Every pothole,
            <br />
            <span className="gradient-text">spotted before it spreads.</span>
          </h1>
          <p className="mx-auto mt-5.5 max-w-[46ch] text-[clamp(16px,2vw,21px)] text-muted-foreground">
            RoadGuard AI runs a YOLOv8 vision model over road imagery from ESP32-CAM units and manual
            reports, geotags every confirmed pothole, and streams the results into a live heatmap and
            severity dashboard — built for Ghana's Highway Authority.
          </p>
          <div className="mt-8.5 flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg">
              <Link to="/live-demo">Try live detection</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/heatmap">View the heatmap</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[640px]">
            <span className="mb-4 inline-block rounded-full border border-border bg-background px-3.5 py-1.5 text-[13px] text-muted-foreground">
              Why it exists
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              Road damage is reported too late, and fixed even later.
            </h2>
            <p className="mt-3.5 text-[clamp(15px,1.6vw,18px)] text-muted-foreground">
              Ghana's road network grows faster than anyone can inspect it on foot. RoadGuard AI turns any
              dashboard camera, phone, or low-cost ESP32-CAM module into a sensor — so potholes get logged
              with GPS precision the moment they're captured.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<Award className="size-5.5 text-foreground" strokeWidth={1.8} />} title="Trained detection model">
              A YOLOv8 model fine-tuned specifically on pothole imagery — not a generic object detector —
              scores every frame for confirmed potholes.
            </FeatureCard>
            <FeatureCard icon={<MapPin className="size-5.5 text-foreground" strokeWidth={1.8} />} title="Geotagged automatically">
              Every confirmed detection is saved with its GPS coordinates, so it can be plotted, clustered
              by region, and prioritized by severity.
            </FeatureCard>
            <FeatureCard icon={<BarChart3 className="size-5.5 text-foreground" strokeWidth={1.8} />} title="Report-ready output">
              Detections roll up into region-level severity reports and export to CSV or GeoJSON for GHA
              teams, QGIS, or ArcGIS.
            </FeatureCard>
          </div>
        </div>
      </section>

      <section className="section-dark px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[640px]">
            <span className="mb-4 inline-block rounded-full border border-white/16 bg-white/8 px-3.5 py-1.5 text-[13px] text-white/60">
              How it works
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              From a bumpy road to a mapped hazard, in four steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num}>
                <span className="gradient-text mb-2.5 block text-sm font-bold">{step.num}</span>
                <h4 className="mb-1.5 text-[17px] font-semibold">{step.title}</h4>
                <p className="text-[14.5px] text-white/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="mb-4 inline-block rounded-full border border-border bg-background px-3.5 py-1.5 text-[13px] text-muted-foreground">
                Live network
              </span>
              <h2 className="text-[clamp(24px,3.4vw,34px)] font-bold tracking-tight">
                Pulled straight from the API — right now.
              </h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link to="/dashboard">Full dashboard</Link>
            </Button>
          </div>

          {statsError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
              Couldn't load live stats right now.{" "}
              <Link to="/dashboard" className="underline">
                Open the dashboard
              </Link>{" "}
              to retry.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile loading={!stats} value={stats?.total_detections.toLocaleString()} label="Total detections" />
              <StatTile
                loading={!stats}
                value={stats ? `${Math.round(stats.avg_confidence * 100)}%` : ""}
                label="Avg. confidence"
              />
              <StatTile loading={!stats} value={stats?.devices_active} label="Active devices" />
              <StatTile loading={!stats} value={stats?.mock_mode ? "Mock" : "Live"} label="Data mode" />
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-8 max-w-[640px] text-center">
            <span className="mb-4 inline-block rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[13px] text-muted-foreground">
              Under the hood
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              One small stack, doing a lot of work.
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {TECH.map((tech) => (
              <TechPill key={tech}>{tech}</TechPill>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark px-5 py-14 text-center sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="mx-auto max-w-[20ch] text-[clamp(28px,4.2vw,46px)] font-bold tracking-tight">
            See a road. <span className="gradient-text">See it mapped.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[17px] text-white/60">
            Upload a photo and coordinates, and watch RoadGuard AI score it in real time.
          </p>
          <div className="mt-8.5 flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg">
              <Link to="/live-demo">Try live detection</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/16 bg-white/8 text-white hover:bg-white/14">
              <Link to="/about">Read the technical overview</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
