import type { GeoJSONSourceSpecification } from "maplibre-gl";

import { destinationPoint } from "@/features/astronomy/milky-way/utils/projection";
import type { SkyPosition } from "@/features/astronomy/types";

import type { PhotoGuideId, PhotoGuidePlan } from "../types";

type GuideFeature = {
  type: "Feature";
  geometry: { type: "Point" | "LineString"; coordinates: number[] | number[][] };
  properties: { guide: PhotoGuideId | "reference"; kind: string; label?: string };
};

function projected(plan: PhotoGuidePlan, position: SkyPosition, radiusKm: number) {
  const distance = Math.max(radiusKm * 0.08, radiusKm * (1 - Math.max(0, position.altitude) / 90));
  return destinationPoint(plan.reference, position.azimuth, distance);
}

function ray(
  plan: PhotoGuidePlan,
  guide: PhotoGuideId,
  position: SkyPosition | null,
  label: string,
  radiusKm: number,
): GuideFeature[] {
  if (!position) return [];
  const end = destinationPoint(plan.reference, position.azimuth, radiusKm);
  return [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[plan.reference.longitude, plan.reference.latitude], end],
      },
      properties: { guide, kind: "ray" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: end },
      properties: { guide, kind: "event", label },
    },
  ];
}

export function toGuideGeoJson(
  plan: PhotoGuidePlan,
  enabled: Record<PhotoGuideId, boolean>,
  radiusKm: number,
): GeoJSONSourceSpecification["data"] {
  const features: GuideFeature[] = [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [plan.reference.longitude, plan.reference.latitude] },
      properties: { guide: "reference", kind: "reference", label: "Point de prise de vue" },
    },
  ];
  if (enabled.sun) {
    features.push(
      ...ray(plan, "sun", plan.sun.rise, "Lever", radiusKm),
      ...ray(plan, "sun", plan.sun.set, "Coucher", radiusKm),
    );
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: projected(plan, plan.sun.current, radiusKm) },
      properties: { guide: "sun", kind: "current", label: "☀ Soleil" },
    });
  }
  if (enabled.moon) {
    features.push(
      ...ray(plan, "moon", plan.moon.rise, "Lever", radiusKm),
      ...ray(plan, "moon", plan.moon.set, "Coucher", radiusKm),
    );
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: projected(plan, plan.moon.current, radiusKm) },
      properties: { guide: "moon", kind: "current", label: "☾ Lune" },
    });
  }
  if (enabled.milkyWay) {
    const visible = plan.milkyWay.trajectory.filter((item) => item.position.aboveHorizon);
    if (visible.length > 1)
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: visible.map((item) => projected(plan, item.position, radiusKm)),
        },
        properties: { guide: "milkyWay", kind: "trajectory" },
      });
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [plan.reference.longitude, plan.reference.latitude],
          destinationPoint(plan.reference, plan.milkyWay.current.azimuth, radiusKm),
        ],
      },
      properties: { guide: "milkyWay", kind: "ray" },
    });
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: projected(plan, plan.milkyWay.current, radiusKm) },
      properties: { guide: "milkyWay", kind: "current", label: "✦ Noyau" },
    });
    if (plan.milkyWay.culmination)
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: projected(plan, plan.milkyWay.culmination.position, radiusKm),
        },
        properties: {
          guide: "milkyWay",
          kind: "culmination",
          label: `Point culminant · ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(plan.milkyWay.culmination.time))}`,
        },
      });
  }
  return { type: "FeatureCollection", features };
}
