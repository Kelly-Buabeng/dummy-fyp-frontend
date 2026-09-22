import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlowField } from "@/components/GlowField";
import { useDocumentHead } from "@/hooks/useDocumentHead";

const ARCHITECTURE_STEPS = [
  {
    num: "01",
    title: "Field capture",
    body: "An ESP32-CAM unit (or a manual upload) sends a JPEG frame with latitude, longitude, and a device ID over HTTPS.",
  },
  {
    num: "02",
    title: "Inference",
    body: "FastAPI validates the coordinates fall within Ghana, then runs the image through a YOLOv8 model fine-tuned on a 569-image Roboflow pothole dataset.",
  },
  {
    num: "03",
    title: "Persistence",
    body: "Detections at or above 40% confidence are written to Supabase with their coordinates, confidence score, and bounding boxes.",
  },
  {
    num: "04",
    title: "Distribution",
    body: "The heatmap, dashboard, and CSV/GeoJSON exports read from the same store — so every view stays in sync with what was actually detected.",
  },
];

const STACK = [
  {
    title: "Detection",
    body: "YOLOv8 (Ultralytics), fine-tuned on a Roboflow pothole dataset and served through a FastAPI inference endpoint with a threadpool to keep the API responsive under load.",
  },
  {
    title: "Data & geospatial",
    body: "Supabase (Postgres + PostGIS) stores every confirmed detection; region lookups use nearest-centroid matching against Ghana's administrative regions.",
  },
  {
    title: "Field hardware",
    body: "ESP32-CAM modules paired with NEO-6M GPS receivers capture and transmit geotagged road imagery from moving vehicles.",
  },
  {
    title: "API",
    body: "FastAPI with Pydantic schemas, API-key auth on write/export routes, and CORS locked to approved frontend origins. Deployed on Railway.",
  },
  {
    title: "Mapping",
    body: (
      <>
        Leaflet with a heat-layer plugin renders the live GPS feed from <code>/api/v1/heatmap</code> directly
        in the browser — no server-side tile generation.
      </>
    ),
  },
  {
    title: "Reporting",
    body: "Region-and-severity aggregation, plus CSV and GeoJSON export with formula-injection sanitization, ready for GHA teams, QGIS, or ArcGIS.",
  },
];

export default function About() {
  useDocumentHead(
    "About — RoadGuard AI",
    "How RoadGuard AI works: a YOLOv8 pothole detector, ESP32-CAM field hardware, and a FastAPI + Supabase backend, built as the FYP-26 final-year engineering project."
  );

  return (
    <>
      <section className="relative overflow-hidden px-5 pt-16 pb-5 sm:px-8 sm:pt-24">
        <GlowField />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <span className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/4 px-3.5 py-1.5 text-[13px] text-muted-foreground">
            <span className="size-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]" />
            Final-year project · FYP-26
          </span>
          <h1 className="max-w-[22ch] text-[clamp(32px,5vw,58px)] leading-[1.05] font-bold tracking-tight">
            Built to make <span className="gradient-text">road damage visible.</span>
          </h1>
          <p className="mt-5.5 max-w-[46ch] text-[clamp(16px,2vw,21px)] text-muted-foreground">
            RoadGuard AI pairs low-cost field hardware with a fine-tuned vision model so pothole reporting
            doesn't depend on someone filing a complaint.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="mb-3.5 inline-block rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[13px] text-muted-foreground">
              The problem
            </span>
            <h2 className="text-[clamp(24px,3.2vw,34px)] font-bold tracking-tight">
              Road authorities can't inspect what they can't see.
            </h2>
            <p className="mt-4 text-[16px] text-muted-foreground">
              Pothole reporting in most municipalities still relies on manual inspection or citizen
              complaints — both slow, both inconsistent. By the time a road gets logged, it's often already
              deteriorated further, and repair costs climb with it.
            </p>
          </div>
          <div>
            <span className="mb-3.5 inline-block rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[13px] text-muted-foreground">
              The approach
            </span>
            <h2 className="text-[clamp(24px,3.2vw,34px)] font-bold tracking-tight">Any camera becomes a sensor.</h2>
            <p className="mt-4 text-[16px] text-muted-foreground">
              RoadGuard AI accepts images from an ESP32-CAM module with an onboard NEO-6M GPS receiver, or
              from a manual upload. Each frame is scored by a YOLOv8 model trained specifically to recognize
              potholes, and confirmed detections are geotagged automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="section-dark px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[640px]">
            <span className="mb-4 inline-block rounded-full border border-white/16 bg-white/8 px-3.5 py-1.5 text-[13px] text-white/60">
              Architecture
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              How a single photo becomes a mapped hazard
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ARCHITECTURE_STEPS.map((step) => (
              <div key={step.num}>
                <span className="gradient-text mb-2.5 block text-sm font-bold">{step.num}</span>
                <h4 className="mb-1.5 text-[17px] font-semibold">{step.title}</h4>
                <p className="text-[14.5px] text-white/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-8 max-w-[640px] text-center">
            <span className="mb-4 inline-block rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[13px] text-muted-foreground">
              Stack
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              What it's built with
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((item) => (
              <Card key={item.title} className="gap-2 p-6 sm:p-7">
                <h3 className="text-[19px] font-semibold">{item.title}</h3>
                <p className="text-[15px] text-muted-foreground">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-14 text-center sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-[clamp(26px,3.8vw,40px)] font-bold tracking-tight">Want to see it running?</h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[16px] text-muted-foreground">
            Every page on this site talks to the live backend — try a detection yourself or open the map.
          </p>
          <div className="mt-8.5 flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg">
              <Link to="/live-demo">Try live detection</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="https://github.com/Kelly-Buabeng/FYP-26-POTHOLE-DETECTION" target="_blank" rel="noopener noreferrer">
                View backend source
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
