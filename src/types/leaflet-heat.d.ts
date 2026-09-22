// leaflet.heat ships no types and patches L.heatLayer onto the global
// Leaflet namespace as a side effect (`import "leaflet.heat"`).
import "leaflet";

declare module "leaflet" {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  interface HeatLatLngTuple extends Array<number> {
    0: number;
    1: number;
    2?: number;
  }

  class HeatLayer extends Layer {
    constructor(latlngs: HeatLatLngTuple[], options?: HeatLayerOptions);
    setLatLngs(latlngs: HeatLatLngTuple[]): this;
    addLatLng(latlng: HeatLatLngTuple): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  function heatLayer(latlngs: HeatLatLngTuple[], options?: HeatLayerOptions): HeatLayer;
}
