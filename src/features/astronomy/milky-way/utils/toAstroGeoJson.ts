import type { GeoJSONSourceSpecification } from "maplibre-gl";

import type { MilkyWayMapPlan } from "../types";

const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function toAstroGeoJson(plan: MilkyWayMapPlan): GeoJSONSourceSpecification["data"] {
  const features = [
    {
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: plan.horizonRing },
      properties: { kind: "horizon" },
    },
    {
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: plan.directionLine },
      properties: { kind: "direction" },
    },
    ...plan.trajectorySegments
      .filter((segment) => segment.length >= 2)
      .map((segment) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: segment.map((sample) => sample.coordinate),
        },
        properties: { kind: "trajectory" },
      })),
    ...plan.cardinalPoints.map((point) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: point.coordinate },
      properties: { kind: "cardinal", label: point.direction },
    })),
    ...plan.annotations.map((point) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: point.coordinate },
      properties: {
        kind: "annotation",
        label: TIME_FORMATTER.format(new Date(point.time)),
      },
    })),
    {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: plan.currentCore.coordinate },
      properties: {
        kind: "core",
        label: "Noyau",
        visible: plan.currentSky.core.aboveHorizon,
      },
    },
    ...(plan.culmination
      ? [
          {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: plan.culmination.coordinate },
            properties: { kind: "culmination", label: "Point culminant" },
          },
        ]
      : []),
    ...(plan.disappearance
      ? [
          {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: plan.disappearance.coordinate },
            properties: { kind: "disappearance", label: "Disparition" },
          },
        ]
      : []),
  ];

  return { type: "FeatureCollection", features };
}
