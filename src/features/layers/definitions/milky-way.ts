import { Star } from "lucide-react";

import type { LayerDefinition } from "../types";

export const milkyWayLayer: LayerDefinition = {
  id: "milky-way",
  name: "Voie Lactée",
  description: "Visibilité de la Voie Lactée selon la pollution lumineuse",
  group: "astronomy",
  type: "custom",
  source: null,
  metadata: {
    dataProvider: "Stellarium",
  },
  icon: Star,
  defaultOpacity: 0.9,
  defaultVisible: false,
  defaultZIndex: 5,
};
