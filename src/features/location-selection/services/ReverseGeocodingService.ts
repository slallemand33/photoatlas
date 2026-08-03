import type { SearchResult } from "@/features/search/types";

import type {
  LocationCoordinates,
  ReverseGeocodingService as ReverseGeocodingServiceContract,
} from "../types";

class NominatimReverseGeocodingService implements ReverseGeocodingServiceContract {
  async reverseGeocode({ latitude, longitude }: LocationCoordinates): Promise<SearchResult | null> {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
    });

    const response = await fetch(`/api/reverse-geocode?${params.toString()}`);

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`Erreur de géocodage inverse : ${response.status}`);
    }

    const result: unknown = await response.json();
    if (!result) return null;

    return result as SearchResult;
  }
}

export const reverseGeocodingService: ReverseGeocodingServiceContract =
  new NominatimReverseGeocodingService();
