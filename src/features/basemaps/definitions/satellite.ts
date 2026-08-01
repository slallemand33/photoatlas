import { getMaptilerStyleUrl } from "../services/maptiler";
import type { BasemapDefinition } from "../types";

export const satelliteBasemap: BasemapDefinition = {
  id: "satellite",
  name: "Satellite",
  description: "Imagerie aérienne avec villes et repères",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("hybrid"),
  category: "satellite",
  dark: true,
  maxZoom: 22,
  minZoom: 0,
  attribution: "© MapTiler · © Maxar",
  thumbnailColor: "#1c2a1c",
};
