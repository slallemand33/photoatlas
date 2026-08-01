import type { BasemapDefinition } from "../types";
import { getMaptilerStyleUrl } from "../services/maptiler";

export const standardBasemap: BasemapDefinition = {
  id: "standard",
  name: "Standard",
  description: "Carte claire et lisible",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("basic-v2"),
  category: "standard",
  dark: false,
  maxZoom: 22,
  minZoom: 0,
  attribution: "\u00a9 MapTiler \u00b7 \u00a9 OpenStreetMap contributors",
  thumbnailColor: "#f0ede8",
};
