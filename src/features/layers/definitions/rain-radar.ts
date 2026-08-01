import { CloudRain } from "lucide-react";

import { RadarControls } from "@/features/weather/radar/components/RadarControls";

import type { LayerDefinition } from "../types";

export const rainRadarLayer: LayerDefinition = {
  id: "rain-radar",
  name: "Radar pluie",
  description: "Animation des précipitations radar observées durant les deux dernières heures",
  group: "weather",
  type: "raster",
  source: {
    type: "raster",
    url: "https://api.rainviewer.com/public/weather-maps.json",
    attribution: "Radar météo © RainViewer",
  },
  metadata: {
    dataProvider: "RainViewer",
    license: "API publique RainViewer — usage personnel et éducatif",
    updateIntervalSeconds: 600,
  },
  icon: CloudRain,
  defaultOpacity: 0.75,
  defaultVisible: false,
  defaultZIndex: 30,
  ControlsComponent: RadarControls,
};
