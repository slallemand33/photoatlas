import type { SearchResult } from "../types";

/** Niveau de zoom adapté au type de résultat */
const TYPE_ZOOM: Record<string, number> = {
  country: 5,
  state: 7,
  county: 9,
  city: 11,
  town: 12,
  village: 13,
  suburb: 13,
  neighbourhood: 14,
  road: 15,
  pedestrian: 15,
  path: 16,
  house: 17,
  building: 17,
  selected_point: 13,
};

export function getZoomForResult(result: SearchResult): number {
  return TYPE_ZOOM[result.type] ?? 12;
}
