import { Cloud } from "lucide-react";
import type { RasterLayerSpecification, RasterSourceSpecification } from "maplibre-gl";

import { CloudLegend, cloudTileProvider } from "@/features/weather";

import type { LayerDefinition, LayerState } from "../types";

export const cloudsLayer: LayerDefinition = {
  id: "cloud-cover",
  name: "Nuages",
  description: "Couverture nuageuse actuelle au service de la photographie",
  group: "weather",
  type: "raster",
  source: {
    type: "raster",
    url: cloudTileProvider.getTileUrl(),
    attribution: cloudTileProvider.attribution,
  },
  metadata: {
    dataProvider: cloudTileProvider.name,
    license: "OpenWeather — attribution requise",
    updateIntervalSeconds: 600,
  },
  icon: Cloud,
  defaultOpacity: 0.65,
  defaultVisible: false,
  defaultZIndex: 20,
  getSourceSpec: (): RasterSourceSpecification => ({
    type: "raster",
    tiles: [cloudTileProvider.getTileUrl()],
    tileSize: cloudTileProvider.tileSize,
    minzoom: 0,
    maxzoom: cloudTileProvider.maxZoom,
    attribution: cloudTileProvider.attribution,
  }),
  getLayerSpecs: (state: LayerState): RasterLayerSpecification[] => [
    {
      id: "cloud-cover-raster",
      type: "raster",
      source: "cloud-cover",
      paint: {
        "raster-opacity": state.opacity,
        "raster-saturation": -0.45,
        "raster-contrast": 0.08,
        "raster-brightness-min": 0.04,
        "raster-brightness-max": 0.96,
        "raster-fade-duration": 300,
        "raster-resampling": "linear",
      },
    },
  ],
  LegendComponent: CloudLegend,
};
