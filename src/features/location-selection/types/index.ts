import type { SearchResult } from "@/features/search/types";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export type LocationSelectionSource = "search" | "map";

export interface LocationSelectionOptions {
  source: LocationSelectionSource;
  animateMap?: boolean;
  zoom?: number;
  addToRecent?: boolean;
}

export interface ReverseGeocodingService {
  reverseGeocode(coordinates: LocationCoordinates): Promise<SearchResult | null>;
}
