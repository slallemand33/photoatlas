import { CloudRain } from "lucide-react";

import type { LayerDefinition } from "../types";

export const rainRadarLayer: LayerDefinition = {
  id: "rain-radar",
  name: "Radar pluie",
  description: "Précipitations en temps réel — données radar",
  group: "weather",
  type: "raster",
  source: null,
  metadata: {
    dataProvider: "RainViewer",
    updateIntervalSeconds: 600,
  },
  icon: CloudRain,
  defaultOpacity: 0.8,
  defaultVisible: false,
  defaultZIndex: 30,
};
