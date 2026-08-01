import type { BasemapDefinition } from "../types";
import { getMaptilerStyleUrl } from "../services/maptiler";

export const outdoorBasemap: BasemapDefinition = {
  id: "outdoor",
  name: "Outdoor",
  description: "Carte d\u2019activit\u00e9 et terrain d\u00e9taill\u00e9",
  provider: "MapTiler",
  styleSource: getMaptilerStyleUrl("outdoor-v2"),
  category: "outdoor",
  dark: false,
  maxZoom: 22,
  minZoom: 0,
  attribution: "\u00a9 MapTiler \u00b7 \u00a9 OpenStreetMap contributors",
  thumbnailColor: "#6b8f5e",
};
