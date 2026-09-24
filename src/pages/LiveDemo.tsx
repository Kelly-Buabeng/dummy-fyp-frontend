import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlowField } from "@/components/GlowField";
import { Reveal } from "@/components/Reveal";
import { BoundingBoxCanvas } from "@/components/BoundingBoxCanvas";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useApiKey } from "@/hooks/useApiKey";
import { RoadGuardApi, formatDetectError } from "@/lib/api";
import type { DetectionResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function LiveDemo() {
  useDocumentHead(
    "Live Demo — RoadGuard AI",
    "Upload a road photo and GPS coordinates to run RoadGuard AI's YOLOv8 pothole detector live and see bounding boxes, confidence scores, and severity."
  );

  const { apiKey, setApiKey, remember, setRemember, persist } = useApiKey();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose a JPEG or PNG image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFormError("That image is over 10MB — the API rejects anything larger.");
      return;
    }
    setFormError(null);
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success("Location captured.");
      },
      (err) => {
        setLocating(false);
        toast.error(`Couldn't get your location: ${err.message}`);
      },
      { timeout: 10000 }
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedFile) {
      setFormError("Choose a road photo before running detection.");
      return;
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setFormError("Enter both latitude and longitude.");
      return;
    }
    if (!apiKey) {
      setFormError("An API key is required — /api/v1/detect is a protected endpoint.");
      return;
    }

    persist();
    setSubmitting(true);
    try {
      const data = await RoadGuardApi.detect({
        file: selectedFile,
        lat: latNum,
        lng: lngNum,
        deviceId: deviceId.trim() || "manual",
        apiKey,
      });
      setResult(data);
      toast[data.pothole_detected ? "success" : "info"](
        data.pothole_detected ? "Pothole confirmed and saved." : "Detection complete — no pothole found."
      );
    } catch (err) {
      const message = formatDetectError(err);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden px-5 pt-16 pb-5 sm:px-8 sm:pt-24">
        <GlowField />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <Reveal trigger="mount" index={0}>
            <span className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/4 px-3.5 py-1.5 text-[13px] text-muted-foreground">
              <span className="size-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]" />
              Runs the real /api/v1/detect endpoint
            </span>
          </Reveal>
          <Reveal trigger="mount" index={1}>
            <h1 className="max-w-[22ch] text-[clamp(32px,5vw,58px)] leading-[1.05] font-bold tracking-tight">
              Try <span className="gradient-text">live detection</span> on your own photo.
            </h1>
          </Reveal>
          <Reveal trigger="mount" index={2}>
            <p className="mt-5.5 max-w-[46ch] text-[clamp(16px,2vw,21px)] text-muted-foreground">
              Upload a road image, set coordinates within Ghana, and RoadGuard AI's YOLOv8 model will score it
              in real time — the same call an ESP32-CAM unit makes in the field.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pt-2.5 pb-14 sm:px-8 sm:pb-24">
        <Reveal
          trigger="mount"
          index={3}
          className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-5 lg:grid-cols-2"
        >
          <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <h3 className="mb-4.5 text-[19px] font-semibold">Run a detection</h3>

            {formError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="mb-4.5">
              <Label htmlFor="image-input" className="mb-2 text-[13.5px] font-semibold text-muted-foreground">
                Road photo
              </Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer rounded-xl border-1.5 border-dashed border-border bg-background p-8 text-center transition-colors",
                  isDragOver && "border-[var(--grad-2)] bg-[color-mix(in_srgb,var(--grad-2)_5%,transparent)]"
                )}
              >
                <div
                  className="mx-auto mb-3.5 flex size-11 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(115deg, color-mix(in srgb, var(--grad-1) 16%, transparent) 0%, color-mix(in srgb, var(--grad-2) 16%, transparent) 52%, color-mix(in srgb, var(--grad-3) 16%, transparent) 100%)",
                  }}
                >
                  <Upload className="size-5.5" strokeWidth={1.8} />
                </div>
                <p className="text-[15px] font-semibold">Drop an image, or click to browse</p>
                <p className="mt-2 text-[13px] text-muted-foreground">JPEG or PNG, up to 10MB</p>
                <input
                  ref={fileInputRef}
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              {previewUrl && !result && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
                  <img src={previewUrl} alt="Selected road photo preview" className="block w-full" />
                </div>
              )}
              {previewUrl && result && (
                <BoundingBoxCanvas src={previewUrl} alt="Selected road photo preview" detections={result.detections} />
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="lat-input" className="mb-2 text-[13.5px] font-semibold text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  id="lat-input"
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 5.614818"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lng-input" className="mb-2 text-[13.5px] font-semibold text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  id="lng-input"
                  type="number"
                  step="0.000001"
                  placeholder="e.g. -0.205742"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" className="mt-3.5" onClick={useMyLocation} disabled={locating}>
              {locating ? "Locating…" : "Use my current location"}
            </Button>
            <p className="mt-2 text-[12.5px] text-muted-foreground">
              Coordinates must fall within Ghana's bounding box — the API rejects anything outside it.
            </p>

            <div className="mt-6">
              <Label htmlFor="device-input" className="mb-2 text-[13.5px] font-semibold text-muted-foreground">
                Device ID <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="device-input"
                type="text"
                placeholder="manual"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>

            <div className="mt-4.5">
              <Label htmlFor="apikey-input" className="mb-2 text-[13.5px] font-semibold text-muted-foreground">
                API key
              </Label>
              <Input
                id="apikey-input"
                type="password"
                placeholder="X-API-Key"
                autoComplete="new-password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="remember-key"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="remember-key" className="font-normal text-muted-foreground">
                  Remember on this device
                </Label>
              </div>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                /api/v1/detect is protected. Ask your project admin for a key — nothing is sent anywhere
                except the RoadGuard API, and "remember" only stores it in this browser.
              </p>
            </div>

            <Button type="submit" size="lg" className="mt-4.5 w-full" disabled={submitting}>
              {submitting ? "Running detection…" : "Run detection"}
            </Button>
          </form>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <h3 className="mb-4.5 text-[19px] font-semibold">Result</h3>
            {!result ? (
              <p className="text-sm text-muted-foreground">
                Run a detection to see bounding boxes, confidence scores, and whether a pothole was
                confirmed.
              </p>
            ) : (
              // Keyed by timestamp so each new detection replays the entrance —
              // this is the app's one rare, high-emotion moment (a completed
              // scan), and it was teleporting straight from placeholder text
              // to the full result with no transition at all.
              <Reveal trigger="mount" key={result.timestamp}>
                <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      result.pothole_detected
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-success/30 bg-success/10 text-[#1f8a3b]"
                    )}
                  >
                    {result.pothole_detected ? "Pothole confirmed" : "No pothole detected"}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  {result.id ? (
                    <>
                      Saved as detection <code>{result.id}</code> at {result.coordinates.lat},{" "}
                      {result.coordinates.lng}.
                    </>
                  ) : (
                    "Not saved — no pothole met the 40% confidence threshold."
                  )}
                </p>
                <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[420px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="px-4 py-3 text-left text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Label
                        </th>
                        <th className="px-4 py-3 text-left text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Confidence
                        </th>
                        <th className="px-4 py-3 text-left text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Bounding box
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detections.length ? (
                        result.detections.map((d, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-4 py-3">{d.label}</td>
                            <td className="px-4 py-3">{(d.confidence * 100).toFixed(1)}%</td>
                            <td className="px-4 py-3">
                              {d.bbox.x1.toFixed(0)}, {d.bbox.y1.toFixed(0)} → {d.bbox.x2.toFixed(0)},{" "}
                              {d.bbox.y2.toFixed(0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-border">
                          <td colSpan={3} className="px-4 py-3 text-muted-foreground">
                            No objects detected in this frame.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
