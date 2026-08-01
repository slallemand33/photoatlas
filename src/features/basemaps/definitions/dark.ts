import type { BasemapDefinition } from "../types";
import { getMaptilerStyleUrl } from "../services/maptiler";

export const darkBasemap: BasemapDefinition = {
  id: "dark",
  name: "Sombre",
  description: "Fond noir pour la photographie nocturne",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("dataviz-dark"),
  category: "dark",
  dark: true,
  maxZoom: 22,
  minZoom: 0,
  attribution: "\u00a9 MapTiler \u00b7 \u00a9 OpenStreetMap contributors",
  thumbnailColor: "#0d1117",
};
