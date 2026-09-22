import "@/lib/chartSetup";
import { Bar } from "react-chartjs-2";
import type { RegionReport } from "@/lib/types";

const CHART_TEXT_COLOR = "#6e6e73";
const GRID_COLOR = "rgba(0,0,0,0.08)";

export function RegionChart({ regions }: { regions: RegionReport[] }) {
  const top = regions.slice(0, 8);

  return (
    <Bar
      data={{
        labels: top.length ? top.map((r) => r.region) : ["No data"],
        datasets: [
          {
            data: top.length ? top.map((r) => r.total) : [0],
            backgroundColor: "#2563eb",
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: CHART_TEXT_COLOR }, grid: { display: false } },
          y: { ticks: { color: CHART_TEXT_COLOR }, grid: { color: GRID_COLOR }, beginAtZero: true },
        },
      }}
    />
  );
}
