import { Lightbulb } from "lucide-react";
import type { RasterLayerSpecification } from "maplibre-gl";

import type { LayerDefinition, LayerState } from "../types";

import { LightPollutionLegend } from "./components";
import { lightPollutionDataSource } from "./data-sources/lightPollutionDataSource";

export const lightPollutionLayer: LayerDefinition = {
  id: "light-pollution",
  name: "Pollution lumineuse",
  description: "Carte mondiale de la luminosité artificielle nocturne",
  group: "light-pollution",
  type: "raster",
  source: {
    type: "raster",
    url: lightPollutionDataSource.tileUrl,
    attribution: "NASA GIBS / ESDIS — Earth at Night 2012",
  },
  metadata: {
    dataProvider: "NASA GIBS / ESDIS",
    license: "NASA Earthdata — attribution requise",
  },
  icon: Lightbulb,
  defaultOpacity: 0.7,
  defaultVisible: false,
  defaultZIndex: 10,

  getSourceSpec: () => lightPollutionDataSource.getSourceSpecification(),

  getLayerSpecs: (state: LayerState): RasterLayerSpecification[] => [
    {
      id: "light-pollution-raster",
      type: "raster",
      source: "light-pollution",
      paint: {
        "raster-opacity": state.opacity,
        "raster-contrast": 0.18,
        "raster-saturation": 0.12,
        "raster-fade-duration": 280,
      },
    },
  ],

  LegendComponent: LightPollutionLegend,
};
