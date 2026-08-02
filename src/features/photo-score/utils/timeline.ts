import type { AstronomySnapshot } from "@/features/astronomy/types";

import type { PhotoRecommendation, PhotoTimelineEvent } from "../types";

import { scoreToStars } from "./scoring";

function event(
  kind: PhotoTimelineEvent["kind"],
  label: string,
  time: string | null,
  score: number | null,
): PhotoTimelineEvent | null {
  if (!time) return null;
  return {
    id: `${kind}-${time}`,
    kind,
    label,
    time,
    score,
    stars: score === null ? null : scoreToStars(score),
  };
}

export function buildPhotoTimeline(
  astronomy: AstronomySnapshot,
  recommendations: PhotoRecommendation[],
): PhotoTimelineEvent[] {
  const byKind = new Map(
    recommendations.map((recommendation) => [recommendation.kind, recommendation]),
  );
  const sunrise = byKind.get("sunrise")?.score ?? null;
  const sunset = byKind.get("sunset")?.score ?? null;
  const astro = byKind.get("astro")?.score ?? null;

  return [
    event("blue-hour", "Blue Hour", astronomy.sun.blueHour.morning.start, sunrise),
    event("golden-hour", "Golden Hour", astronomy.sun.goldenHour.morning.start, sunrise),
    event("sunrise", "Lever du soleil", astronomy.sun.rise, sunrise),
    event("golden-hour", "Golden Hour", astronomy.sun.goldenHour.evening.start, sunset),
    event("sunset", "Coucher du soleil", astronomy.sun.set, sunset),
    event("blue-hour", "Blue Hour", astronomy.sun.blueHour.evening.start, sunset),
    event("astronomical-night", "Nuit astronomique", astronomy.sun.astronomicalNight.start, astro),
    event("milky-way", "Noyau galactique au plus haut", astronomy.milkyWay.core.transit, astro),
    event("moonrise", "Lever de la Lune", astronomy.moon.rise, null),
  ]
    .filter((item): item is PhotoTimelineEvent => item !== null)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
