import { Zap } from "lucide-react";

import { LightningControls } from "@/features/weather/lightning/components/LightningControls";

import type { LayerDefinition } from "../types";

export const lightningLayer: LayerDefinition = {
  id: "lightning",
  name: "Orages",
  description: "Impacts de foudre observés récemment autour du centre de la carte",
  group: "weather",
  type: "geojson",
  source: null,
  metadata: {
    dataProvider: "OpenWeather Lightning",
    license: "OpenWeather Historical Lightning Data API",
    updateIntervalSeconds: 60,
  },
  icon: Zap,
  defaultOpacity: 0.85,
  defaultVisible: false,
  defaultZIndex: 40,
  ControlsComponent: LightningControls,
};
