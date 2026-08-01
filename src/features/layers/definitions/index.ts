import type { LayerDefinition } from "../types";

import { cloudsLayer } from "./clouds";
import { lightPollutionLayer } from "../light-pollution/definition";
import { milkyWayLayer } from "./milky-way";
import { rainRadarLayer } from "./rain-radar";

/** Liste ordonnée de toutes les couches disponibles dans l'application */
export const LAYER_DEFINITIONS: LayerDefinition[] = [
  lightPollutionLayer,
  cloudsLayer,
  rainRadarLayer,
  milkyWayLayer,
];
