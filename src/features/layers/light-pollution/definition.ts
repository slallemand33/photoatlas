import { Lightbulb } from "lucide-react";
import type { RasterLayerSpecification } from "maplibre-gl";

import type { LayerDefinition, LayerState } from "../types";

import { LightPollutionLegend } from "./components";
import { getLightPollutionSourceSpec } from "./services/lightPollutionService";

export const lightPollutionLayer: LayerDefinition = {
  id: "light-pollution",
  name: "Pollution lumineuse",
  description: "Carte mondiale de la luminosité artificielle nocturne",
  group: "light-pollution",
  type: "raster",
  source: {
    type: "raster",
    url: "https://www.lightpollutionmap.info/tiles/{z}/{x}/{y}.png",
    attribution: "© Falchi et al. 2016 / lightpollutionmap.info",
  },
  metadata: {
    dataProvider: "LightPollutionMap.info",
    license: "Creative Commons BY NC SA",
    updateIntervalSeconds: 86400 * 365,
  },
  icon: Lightbulb,
  defaultOpacity: 0.7,
  defaultVisible: false,
  defaultZIndex: 10,

  getSourceSpec: () => getLightPollutionSourceSpec(),

  getLayerSpecs: (state: LayerState): RasterLayerSpecification[] => [
    {
      id: "light-pollution-raster",
      type: "raster",
      source: "light-pollution",
      paint: {
        "raster-opacity": state.opacity,
      },
    },
  ],

  LegendComponent: LightPollutionLegend,
};
