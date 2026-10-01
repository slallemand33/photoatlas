import type { NearbySpot } from "../types/spot.types";

interface NearbySpotFeatureProperties {
  id: string;
  name: string;
  distanceKm: number;
  spotType: string;
}

interface NearbySpotFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: NearbySpotFeatureProperties;
}

export interface NearbySpotsFeatureCollection {
  type: "FeatureCollection";
  features: NearbySpotFeature[];
}

export function toNearbySpotsGeoJson(
  spots: NearbySpot[],
): NearbySpotsFeatureCollection {
  return {
    type: "FeatureCollection",
    features: spots.map((spot) => ({
      type: "Feature",
      id: spot.id,
      geometry: {
        type: "Point",
        coordinates: [spot.longitude, spot.latitude],
      },
      properties: {
        id: spot.id,
        name: spot.name,
        distanceKm: spot.distanceKm,
        spotType: spot.spotType,
      },
    })),
  };
}