(function () {
  const statsGrid = document.getElementById("stats-grid");
  const reportBody = document.getElementById("report-body");
  const reportGenerated = document.getElementById("report-generated");
  const exportAlerts = document.getElementById("export-alerts");
  const deleteAlerts = document.getElementById("delete-alerts");
  const exportKeyInput = document.getElementById("export-apikey");

  const storedKey = getStoredApiKey();
  if (storedKey) exportKeyInput.value = storedKey;

  let regionChart = null;
  let severityChart = null;

  RoadGuardApi.stats()
    .then((s) => {
      statsGrid.innerHTML = `
        <div class="stat-tile"><div class="value">${s.total_detections.toLocaleString()}</div><div class="label">Total detections</div></div>
        <div class="stat-tile"><div class="value">${Math.round(s.avg_confidence * 100)}%</div><div class="label">Avg. confidence</div></div>
        <div class="stat-tile"><div class="value">${s.devices_active}</div><div class="label">Active devices</div></div>
        <div class="stat-tile"><div class="value">${s.mock_mode ? "Mock" : "Live"} <span class="badge ${s.mock_mode ? "warning" : "success"}" style="margin-left:4px;">${s.mock_mode ? "seeded" : "real"}</span></div><div class="label">Data mode</div></div>
      `;
    })
    .catch((err) => {
      statsGrid.innerHTML = `<div class="alert error" style="grid-column: 1 / -1;">Couldn't load stats: ${escapeHtml(err.message)}</div>`;
    });

  RoadGuardApi.report()
    .then((r) => {
      reportGenerated.textContent = `Generated ${new Date(r.generated_at).toLocaleString()}`;

      if (!r.regions.length) {
        reportBody.innerHTML = `<tr><td colspan="4" class="muted">No detections recorded yet.</td></tr>`;
      } else {
        reportBody.innerHTML = r.regions
          .map((region) => {
            const b = region.severity_breakdown;
            const total = b.high + b.medium + b.low || 1;
            return `
            <tr>
              <td>${escapeHtml(region.region)}</td>
              <td>${region.total}</td>
              <td>${Math.round(region.avg_confidence * 100)}%</td>
              <td>
                <div class="sev-bar" title="High ${b.high} · Medium ${b.medium} · Low ${b.low}">
                  <span class="sev-high" style="width:${(b.high / total) * 100}%"></span>
                  <span class="sev-medium" style="width:${(b.medium / total) * 100}%"></span>
                  <span class="sev-low" style="width:${(b.low / total) * 100}%"></span>
                </div>
              </td>
            </tr>`;
          })
          .join("");
      }

      renderCharts(r.regions);
    })
    .catch((err) => {
      reportBody.innerHTML = `<tr><td colspan="4"><div class="alert error">Couldn't load the region report: ${escapeHtml(err.message)}</div></td></tr>`;
    });

  function renderCharts(regions) {
    if (typeof Chart === "undefined") {
      ["region-chart", "severity-chart"].forEach((id) => {
        const canvas = document.getElementById(id);
        if (canvas && canvas.parentElement) {
          canvas.parentElement.innerHTML = `<div class="alert error">Chart library couldn't load from its CDN — the region report table below still has the full data.</div>`;
        }
      });
      return;
    }

    const top = regions.slice(0, 8);
    const chartTextColor = "#b9b6cc";
    const gridColor = "rgba(255,255,255,0.08)";

    const regionCtx = document.getElementById("region-chart");
    if (regionCtx) {
      regionChart = new Chart(regionCtx, {
        type: "bar",
        data: {
          labels: top.length ? top.map((r) => r.region) : ["No data"],
          datasets: [
            {
              data: top.length ? top.map((r) => r.total) : [0],
              backgroundColor: "#a844de",
              borderRadius: 6,
              maxBarThickness: 40,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: chartTextColor }, grid: { display: false } },
            y: { ticks: { color: chartTextColor }, grid: { color: gridColor }, beginAtZero: true },
          },
        },
      });
    }

    const totals = regions.reduce(
      (acc, r) => {
        acc.high += r.severity_breakdown.high;
        acc.medium += r.severity_breakdown.medium;
        acc.low += r.severity_breakdown.low;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    const sevCtx = document.getElementById("severity-chart");
    if (sevCtx) {
      const hasData = totals.high + totals.medium + totals.low > 0;
      severityChart = new Chart(sevCtx, {
        type: "doughnut",
        data: {
          labels: ["High", "Medium", "Low"],
          datasets: [
            {
              data: hasData ? [totals.high, totals.medium, totals.low] : [1, 0, 0],
              backgroundColor: ["#ff5f6d", "#ffb648", "#35d68a"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: chartTextColor, boxWidth: 12 } },
          },
        },
      });
    }
  }

  document.getElementById("export-csv").addEventListener("click", () => runExport("csv"));
  document.getElementById("export-geojson").addEventListener("click", () => runExport("geojson"));

  async function runExport(format) {
    exportAlerts.innerHTML = "";
    const apiKey = exportKeyInput.value.trim();
    if (!apiKey) {
      exportAlerts.innerHTML = `<div class="alert error">Enter an API key first — /api/v1/detections/export is protected.</div>`;
      return;
    }
    storeApiKey(apiKey, true);

    const btn = document.getElementById(format === "csv" ? "export-csv" : "export-geojson");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Preparing…';

    try {
      const blob = await RoadGuardApi.exportDetections({
        format,
        minConfidence: parseFloat(document.getElementById("export-min-conf").value) || 0,
        limit: parseInt(document.getElementById("export-limit").value, 10) || 5000,
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
      showToast(`${format.toUpperCase()} export downloaded.`, "success");
    } catch (err) {
      const message =
        err.status === 401 || err.status === 403
          ? "That API key was rejected."
          : err.message;
      exportAlerts.innerHTML = `<div class="alert error">${escapeHtml(message)}</div>`;
      showToast(message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  document.getElementById("delete-btn").addEventListener("click", async () => {
    deleteAlerts.innerHTML = "";
    const id = document.getElementById("delete-id").value.trim();
    const apiKey = exportKeyInput.value.trim();

    if (!id) {
      deleteAlerts.innerHTML = `<div class="alert error">Enter a detection ID to delete.</div>`;
      return;
    }
    if (!apiKey) {
      deleteAlerts.innerHTML = `<div class="alert error">Enter an API key above first — deleting is a protected action.</div>`;
      return;
    }
    if (!window.confirm(`Permanently delete detection ${id}? This can't be undone.`)) return;

    const btn = document.getElementById("delete-btn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Deleting…';

    try {
      await RoadGuardApi.deleteDetection({ id, apiKey });
      deleteAlerts.innerHTML = `<div class="alert success">Detection ${escapeHtml(id)} deleted.</div>`;
      showToast("Detection deleted.", "success");
      document.getElementById("delete-id").value = "";
    } catch (err) {
      const message = err.status === 404 ? "No detection found with that ID." : err.message;
      deleteAlerts.innerHTML = `<div class="alert error">${escapeHtml(message)}</div>`;
      showToast(message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Delete detection";
    }
  });
})();
