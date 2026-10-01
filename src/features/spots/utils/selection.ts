import type { SearchResult } from "@/features/search/types/search.types";

import type { NearbySpot } from "../types/spot.types";

export function toSearchResult(spot: NearbySpot): SearchResult {
  const locality = spot.locality ?? "";
  const region = spot.region ?? "";
  const country = spot.countryCode;
  const displayName = [spot.name, locality, region, country].filter(Boolean).join(" · ");

  return {
    id: `spot/${spot.slug}`,
    name: spot.name,
    displayName,
    type: spot.spotType,
    class: "spot",
    latitude: spot.latitude,
    longitude: spot.longitude,
    country,
    region,
    department: "",
    locality,
    importance: 0.8,
  };
}

export function isCurrentSpot(place: SearchResult, spot: NearbySpot): boolean {
  return place.id === `spot/${spot.slug}`;
}

export function getRenderableNearbySpots(place: SearchResult, spots: NearbySpot[]): NearbySpot[] {
  return spots.filter((spot) => !isCurrentSpot(place, spot));
}