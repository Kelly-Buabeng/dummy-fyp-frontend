(function () {
  const mapEl = document.getElementById("map");
  const mapAlertsEl = document.getElementById("map-alerts");

  if (typeof L === "undefined") {
    mapAlertsEl.innerHTML = `<div class="alert error">The map library couldn't load from its CDN, so the heatmap can't render. Check your connection and refresh the page.</div>`;
    mapEl.style.display = "none";
    document.getElementById("point-count").textContent = "Map unavailable.";
    return;
  }

  const GHANA_CENTER = [7.9465, -1.0232];

  const map = L.map("map", { scrollWheelZoom: true }).setView(GHANA_CENTER, 7);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  let heatLayer = null;
  let markerLayer = L.layerGroup().addTo(map);

  const minConfSlider = document.getElementById("min-conf");
  const minConfVal = document.getElementById("min-conf-val");
  const pointLimit = document.getElementById("point-limit");
  const refreshBtn = document.getElementById("refresh-map");
  const mapAlerts = document.getElementById("map-alerts");
  const pointCount = document.getElementById("point-count");

  minConfSlider.addEventListener("input", () => {
    minConfVal.textContent = parseFloat(minConfSlider.value).toFixed(2);
  });

  async function loadHeatmap() {
    mapAlerts.innerHTML = "";
    pointCount.textContent = "Loading points…";
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="spinner"></span> Refreshing';

    try {
      const points = await RoadGuardApi.heatmap({
        limit: parseInt(pointLimit.value, 10),
        minConfidence: parseFloat(minConfSlider.value),
      });

      if (heatLayer) map.removeLayer(heatLayer);
      markerLayer.clearLayers();

      if (!points.length) {
        pointCount.textContent = "0 points at this confidence threshold.";
        mapAlerts.innerHTML = `<div class="alert info">No potholes match this filter yet. Try lowering the minimum confidence, or check back after new detections come in.</div>`;
        return;
      }

      const heatPoints = points.map((p) => [p.lat, p.lng, p.intensity]);
      heatLayer = L.heatLayer(heatPoints, { radius: 28, blur: 22, maxZoom: 14 }).addTo(map);

      points.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 3,
          color: "#1d1d1f",
          fillColor: "#2997ff",
          weight: 1,
          fillOpacity: 0.7,
        })
          .bindPopup(`Intensity ${(p.intensity * 100).toFixed(0)}%<br>${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
          .addTo(markerLayer);
      });

      pointCount.textContent = `${points.length.toLocaleString()} point${points.length === 1 ? "" : "s"} shown.`;
    } catch (err) {
      pointCount.textContent = "Couldn't load points.";
      mapAlerts.innerHTML = `<div class="alert error">${escapeHtml(err.message)}</div>`;
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "Refresh";
    }
  }

  refreshBtn.addEventListener("click", loadHeatmap);
  pointLimit.addEventListener("change", loadHeatmap);
  minConfSlider.addEventListener("change", loadHeatmap);

  loadHeatmap();
})();
