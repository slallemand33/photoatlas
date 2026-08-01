import { lightPollutionLayer } from "../light-pollution/definition";
import type { LayerDefinition } from "../types";

import { cloudsLayer } from "./clouds";
import { lightningLayer } from "./lightning";
import { milkyWayLayer } from "./milky-way";
import { rainRadarLayer } from "./rain-radar";

/** Liste ordonnée de toutes les couches disponibles dans l'application */
export const LAYER_DEFINITIONS: LayerDefinition[] = [
  lightPollutionLayer,
  cloudsLayer,
  rainRadarLayer,
  lightningLayer,
  milkyWayLayer,
];
