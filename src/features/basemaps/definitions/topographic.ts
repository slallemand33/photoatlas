import { getMaptilerStyleUrl } from "../services/maptiler";
import type { BasemapDefinition } from "../types";

export const topographicBasemap: BasemapDefinition = {
  id: "topographic",
  name: "Topographique",
  description: "Courbes de niveau et relief détaillé",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("topo-v2"),
  category: "topographic",
  dark: false,
  maxZoom: 22,
  minZoom: 0,
  attribution: "© MapTiler · © OpenStreetMap contributors",
  thumbnailColor: "#d4c4a0",
};
