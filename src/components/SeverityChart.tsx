import "@/lib/chartSetup";
import { Doughnut } from "react-chartjs-2";
import type { RegionReport } from "@/lib/types";

const CHART_TEXT_COLOR = "#6e6e73";

export function SeverityChart({ regions }: { regions: RegionReport[] }) {
  const totals = regions.reduce(
    (acc, r) => {
      acc.high += r.severity_breakdown.high;
      acc.medium += r.severity_breakdown.medium;
      acc.low += r.severity_breakdown.low;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );
  const hasData = totals.high + totals.medium + totals.low > 0;

  return (
    <Doughnut
      data={{
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            data: hasData ? [totals.high, totals.medium, totals.low] : [1, 0, 0],
            backgroundColor: ["#ff3b30", "#ff9f0a", "#34c759"],
            borderWidth: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: CHART_TEXT_COLOR, boxWidth: 12 } },
        },
      }}
    />
  );
}
