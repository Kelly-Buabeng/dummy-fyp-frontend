// react-chartjs-2's chart.js peer is the tree-shakeable ESM build, which
// (unlike the CDN UMD build the static site used) doesn't auto-register
// chart types — every element/scale/plugin used has to be registered
// explicitly or the charts render blank with no error.
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
