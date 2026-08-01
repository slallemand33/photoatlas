import { Sparkles } from "lucide-react";

import type { LayerDefinition } from "../types";

export const milkyWayLayer: LayerDefinition = {
  id: "milky-way",
  name: "Voie Lactée",
  description: "Orientation et trajectoire du noyau galactique depuis le lieu sélectionné",
  group: "astronomy",
  type: "custom",
  source: null,
  metadata: {
    dataProvider: "Astronomy Engine",
    license: "MIT · calculs locaux PhotoAtlas",
    updateIntervalSeconds: 300,
  },
  icon: Sparkles,
  defaultOpacity: 0.9,
  defaultVisible: false,
  defaultZIndex: 50,
};
