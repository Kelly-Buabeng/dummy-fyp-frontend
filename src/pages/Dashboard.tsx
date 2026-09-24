import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { GlowField } from "@/components/GlowField";
import { Reveal } from "@/components/Reveal";
import { StatTile } from "@/components/StatTile";
import { SeverityBar } from "@/components/SeverityBar";
import { RegionChart } from "@/components/RegionChart";
import { SeverityChart } from "@/components/SeverityChart";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiKey } from "@/hooks/useApiKey";
import { RoadGuardApi, formatExportError, formatDeleteError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  useDocumentHead(
    "Dashboard — RoadGuard AI",
    "Live detection statistics, region-level severity reports, and CSV/GeoJSON exports from the RoadGuard AI pothole detection backend."
  );

  const statsQuery = useApiQuery((signal) => RoadGuardApi.stats(signal), []);
  const reportQuery = useApiQuery((signal) => RoadGuardApi.report({}, signal), []);

  const { apiKey, setApiKey, persist } = useApiKey();
  const [exportMinConf, setExportMinConf] = useState("0");
  const [exportLimit, setExportLimit] = useState("5000");
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<"csv" | "geojson" | null>(null);

  const [deleteId, setDeleteId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function runExport(format: "csv" | "geojson") {
    setExportError(null);
    if (!apiKey) {
      setExportError("Enter an API key first — /api/v1/detections/export is protected.");
      return;
    }
    persist();
    setExportingFormat(format);
    try {
      const blob = await RoadGuardApi.exportDetections({
        format,
        minConfidence: parseFloat(exportMinConf) || 0,
        limit: parseInt(exportLimit, 10) || 5000,
        apiKey,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "detections.csv" : "detections.geojson";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded.`);
    } catch (err) {
      const message = formatExportError(err);
      setExportError(message);
      toast.error(message);
    } finally {
      setExportingFormat(null);
    }
  }

  function openDeleteConfirm() {
    setDeleteError(null);
    setDeleteSuccess(null);
    if (!deleteId.trim()) {
      setDeleteError("Enter a detection ID to delete.");
      return;
    }
    if (!apiKey) {
      setDeleteError("Enter an API key above first — deleting is a protected action.");
      return;
    }
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    const id = deleteId.trim();
    try {
      await RoadGuardApi.deleteDetection({ id, apiKey });
      setDeleteSuccess(`Detection ${id} deleted.`);
      toast.success("Detection deleted.");
      setDeleteId("");
      // Improvement over the static site: refresh stats/report immediately
      // instead of requiring a manual reload to see the deletion reflected.
      statsQuery.refetch();
      reportQuery.refetch();
    } catch (err) {
      const message = formatDeleteError(err);
      setDeleteError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  const regions = reportQuery.data?.regions ?? [];

  return (
    <>
      <section className="relative overflow-hidden px-5 pt-16 pb-5 sm:px-8 sm:pt-24">
        <GlowField />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <Reveal trigger="mount" index={0}>
            <span className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/4 px-3.5 py-1.5 text-[13px] text-muted-foreground">
              <span className="size-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]" />
              GET /api/v1/stats · /api/v1/report
            </span>
          </Reveal>
          <Reveal trigger="mount" index={1}>
            <h1 className="max-w-[24ch] text-[clamp(32px,5vw,58px)] leading-[1.05] font-bold tracking-tight">
              The state of the road network, <span className="gradient-text">at a glance.</span>
            </h1>
          </Reveal>
          <Reveal trigger="mount" index={2}>
            <p className="mt-5.5 max-w-[46ch] text-[clamp(16px,2vw,21px)] text-muted-foreground">
              Summary statistics and region-level severity breakdowns, ready to hand to Ghana's Highway
              Authority.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pt-2.5 pb-14 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-[1180px]">
          {statsQuery.error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
              Couldn't load stats: {statsQuery.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Reveal index={0}>
                <StatTile loading={statsQuery.loading} value={statsQuery.data?.total_detections.toLocaleString()} label="Total detections" />
              </Reveal>
              <Reveal index={1}>
                <StatTile
                  loading={statsQuery.loading}
                  value={statsQuery.data ? `${Math.round(statsQuery.data.avg_confidence * 100)}%` : ""}
                  label="Avg. confidence"
                />
              </Reveal>
              <Reveal index={2}>
                <StatTile loading={statsQuery.loading} value={statsQuery.data?.devices_active} label="Active devices" />
              </Reveal>
              <Reveal index={3}>
                <StatTile
                  loading={statsQuery.loading}
                  value={
                    statsQuery.data && (
                      <span className="inline-flex items-center gap-1.5">
                        {statsQuery.data.mock_mode ? "Mock" : "Live"}
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            statsQuery.data.mock_mode
                              ? "border-warning/30 bg-warning/10 text-[#a15c00]"
                              : "border-success/30 bg-success/10 text-[#1f8a3b]"
                          )}
                        >
                          {statsQuery.data.mock_mode ? "seeded" : "real"}
                        </span>
                      </span>
                    )
                  }
                  label="Data mode"
                />
              </Reveal>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            <Reveal index={0} className="rounded-xl border border-border bg-card p-6 sm:p-7">
              <h3 className="text-[19px] font-semibold">Detections by region</h3>
              <p className="mt-2 text-[15px] text-muted-foreground">Top regions by total confirmed detections.</p>
              <div className="relative mt-4 h-70">{regions.length > 0 && <RegionChart regions={regions} />}</div>
            </Reveal>
            <Reveal index={1} className="rounded-xl border border-border bg-card p-6 sm:p-7">
              <h3 className="text-[19px] font-semibold">Severity breakdown</h3>
              <p className="mt-2 text-[15px] text-muted-foreground">
                High ≥ 75% confidence, medium ≥ 50%, low below that.
              </p>
              <div className="relative mt-4 h-70">{regions.length > 0 && <SeverityChart regions={regions} />}</div>
            </Reveal>
          </div>

          <Reveal index={2} className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[19px] font-semibold">Region report</h3>
              {reportQuery.data && (
                <span className="text-[13px] text-muted-foreground">
                  Generated {new Date(reportQuery.data.generated_at).toLocaleString()}
                </span>
              )}
            </div>
            {reportQuery.error ? (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive">
                Couldn't load the region report: {reportQuery.error}
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Avg. confidence</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportQuery.loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">
                          Loading report…
                        </TableCell>
                      </TableRow>
                    ) : regions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">
                          No detections recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      regions.map((region) => (
                        <TableRow key={region.region}>
                          <TableCell>{region.region}</TableCell>
                          <TableCell>{region.total}</TableCell>
                          <TableCell>{Math.round(region.avg_confidence * 100)}%</TableCell>
                          <TableCell>
                            <SeverityBar breakdown={region.severity_breakdown} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section-dark px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[640px]">
            <span className="mb-4 inline-block rounded-full border border-white/16 bg-white/8 px-3.5 py-1.5 text-[13px] text-white/60">
              For GHA teams
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-bold tracking-tight">
              Export &amp; manage detections
            </h2>
            <p className="mt-3.5 text-[15px] text-white/60">
              These calls hit protected endpoints — enter your API key once and it's reused for both the
              export and the delete tool below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Reveal index={0} className="rounded-xl border border-white/16 bg-white/8 p-6 sm:p-7">
              <h3 className="text-[19px] font-semibold">Export detections</h3>
              <p className="mt-2 text-[15px] text-white/60">
                Download all saved detections as CSV for spreadsheets, or GeoJSON to drag straight into
                QGIS/ArcGIS.
              </p>

              <div className="mt-6">
                <Label htmlFor="export-apikey" className="mb-2 text-[13.5px] font-semibold text-white/60">
                  API key
                </Label>
                <Input
                  id="export-apikey"
                  type="password"
                  placeholder="X-API-Key"
                  autoComplete="new-password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white text-foreground"
                />
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-3.5">
                <div>
                  <Label htmlFor="export-min-conf" className="mb-2 text-[13.5px] font-semibold text-white/60">
                    Min. confidence
                  </Label>
                  <Input
                    id="export-min-conf"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={exportMinConf}
                    onChange={(e) => setExportMinConf(e.target.value)}
                    className="bg-white text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="export-limit" className="mb-2 text-[13.5px] font-semibold text-white/60">
                    Row limit
                  </Label>
                  <Input
                    id="export-limit"
                    type="number"
                    min={1}
                    max={20000}
                    value={exportLimit}
                    onChange={(e) => setExportLimit(e.target.value)}
                    className="bg-white text-foreground"
                  />
                </div>
              </div>
              {exportError && (
                <div className="mt-3.5 rounded-lg border border-destructive/40 bg-destructive/15 p-3.5 text-sm text-red-200">
                  {exportError}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3.5">
                <Button onClick={() => runExport("csv")} disabled={exportingFormat !== null}>
                  {exportingFormat === "csv" ? "Preparing…" : "Download CSV"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/16 bg-white/8 text-white hover:bg-white/14"
                  onClick={() => runExport("geojson")}
                  disabled={exportingFormat !== null}
                >
                  {exportingFormat === "geojson" ? "Preparing…" : "Download GeoJSON"}
                </Button>
              </div>
            </Reveal>

            <Reveal index={1} className="rounded-xl border border-white/16 bg-white/8 p-6 sm:p-7">
              <h3 className="text-[19px] font-semibold">Remove a false positive</h3>
              <p className="mt-2 text-[15px] text-white/60">
                Delete a single detection by ID — useful when the model flags something that isn't actually a
                pothole.
              </p>
              <div className="mt-6">
                <Label htmlFor="delete-id" className="mb-2 text-[13.5px] font-semibold text-white/60">
                  Detection ID
                </Label>
                <Input
                  id="delete-id"
                  type="text"
                  placeholder="e.g. 6f1c2e3a-..."
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  className="bg-white text-foreground"
                />
              </div>
              {deleteError && (
                <div className="mt-3.5 rounded-lg border border-destructive/40 bg-destructive/15 p-3.5 text-sm text-red-200">
                  {deleteError}
                </div>
              )}
              {deleteSuccess && (
                <div className="mt-3.5 rounded-lg border border-success/40 bg-success/15 p-3.5 text-sm text-green-200">
                  {deleteSuccess}
                </div>
              )}
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <Button
                  variant="outline"
                  className="mt-4 border-destructive/40 bg-destructive/10 text-red-200 hover:bg-destructive/20"
                  onClick={openDeleteConfirm}
                >
                  Delete detection
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this detection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Permanently delete detection {deleteId.trim()}? This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                      {deleting ? "Deleting…" : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
