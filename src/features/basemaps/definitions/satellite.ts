import type { BasemapDefinition } from "../types";
import { getMaptilerStyleUrl } from "../services/maptiler";

export const satelliteBasemap: BasemapDefinition = {
  id: "satellite",
  name: "Satellite",
  description: "Imagerie aérienne haute résolution",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("satellite"),
  category: "satellite",
  dark: true,
  maxZoom: 22,
  minZoom: 0,
  attribution: "© MapTiler · © Maxar",
  thumbnailColor: "#1c2a1c",
};
