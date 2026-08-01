import type { BasemapDefinition } from "../types";

import { darkBasemap } from "./dark";
import { outdoorBasemap } from "./outdoor";
import { satelliteBasemap } from "./satellite";
import { standardBasemap } from "./standard";
import { topographicBasemap } from "./topographic";

export const BASEMAP_DEFINITIONS: BasemapDefinition[] = [
  standardBasemap,
  darkBasemap,
  satelliteBasemap,
  outdoorBasemap,
  topographicBasemap,
];

export const DEFAULT_BASEMAP_ID = "standard";
