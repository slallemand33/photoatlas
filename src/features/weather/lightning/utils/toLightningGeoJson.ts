import type { GeoJSONSourceSpecification } from "maplibre-gl";

import type { LightningStrike } from "../types";

const INTENSITY_VALUE = { low: 0.75, medium: 1, high: 1.25 } as const;

export function toLightningGeoJson(strikes: LightningStrike[]): GeoJSONSourceSpecification["data"] {
  return {
    type: "FeatureCollection",
    features: strikes.map((strike) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [strike.longitude, strike.latitude],
      },
      properties: {
        id: strike.id,
        intensity: INTENSITY_VALUE[strike.intensity],
        occurredAt: strike.occurredAt,
      },
    })),
  };
}
