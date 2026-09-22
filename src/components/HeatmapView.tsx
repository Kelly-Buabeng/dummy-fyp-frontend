import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { HeatmapPoint } from "@/lib/types";

const GHANA_CENTER: [number, number] = [7.9465, -1.0232];

/**
 * Bridges leaflet.heat's imperative L.heatLayer into react-leaflet via
 * useMap() — the one part of the map that isn't available as a
 * declarative component. Everything else (markers, popups, tiles)
 * stays declarative below.
 */
function HeatLayer({ points, onError }: { points: HeatmapPoint[]; onError: (message: string) => void }) {
  const map = useMap();

  useEffect(() => {
    try {
      const heatPoints: L.HeatLatLngTuple[] = points.map((p) => [p.lat, p.lng, p.intensity]);
      const layer = L.heatLayer(heatPoints, { radius: 28, blur: 22, maxZoom: 14 }).addTo(map);
      return () => {
        map.removeLayer(layer);
      };
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't render the heat layer.");
    }
  }, [map, points, onError]);

  return null;
}

export function HeatmapView({ points }: { points: HeatmapPoint[] }) {
  const [mapError, setMapError] = useState<string | null>(null);

  if (mapError) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-secondary p-6 text-center text-sm text-destructive">
        The map couldn't render: {mapError}. Try refreshing the page.
      </div>
    );
  }

  return (
    <MapContainer center={GHANA_CENTER} zoom={7} scrollWheelZoom className="h-full w-full rounded-xl">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
        maxZoom={19}
      />
      <HeatLayer points={points} onError={setMapError} />
      {points.map((p, i) => (
        <CircleMarker
          key={`${p.lat}-${p.lng}-${i}`}
          center={[p.lat, p.lng]}
          radius={3}
          color="#1d1d1f"
          fillColor="#2997ff"
          weight={1}
          fillOpacity={0.7}
        >
          <Popup>
            Intensity {(p.intensity * 100).toFixed(0)}%
            <br />
            {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
