import { Cloud } from "lucide-react";

import type { LayerDefinition } from "../types";

export const cloudsLayer: LayerDefinition = {
  id: "cloud-cover",
  name: "Nuages",
  description: "Couverture nuageuse en temps réel",
  group: "weather",
  type: "raster",
  source: null,
  metadata: {
    dataProvider: "Open-Meteo",
    updateIntervalSeconds: 3600,
  },
  icon: Cloud,
  defaultOpacity: 0.6,
  defaultVisible: false,
  defaultZIndex: 20,
};
