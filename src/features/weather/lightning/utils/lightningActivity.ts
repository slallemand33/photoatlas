import type { LightningActivity, LightningLocation, LightningSnapshot } from "../types";

import { getDistanceKm } from "./distance";

const NEARBY_RADIUS_KM = 100;

export function getLightningActivity(
  location: LightningLocation,
  snapshot: LightningSnapshot | null,
): LightningActivity {
  if (!snapshot || snapshot.strikes.length === 0) {
    return {
      level: "none",
      label: "Aucune activité",
      distanceKm: null,
      lastActivityAt: null,
      nearbyStrikeCount: 0,
      simulated: snapshot?.simulated ?? true,
    };
  }

  const strikes = snapshot.strikes
    .map((strike) => ({ strike, distanceKm: getDistanceKm(location, strike) }))
    .sort((a, b) => b.strike.occurredAt - a.strike.occurredAt);
  const latest = strikes[0];
  const nearby = strikes.filter(({ distanceKm }) => distanceKm <= NEARBY_RADIUS_KM);

  if (nearby.length === 0 || !latest) {
    return {
      level: "none",
      label: "Aucune activité",
      distanceKm: latest ? Math.round(latest.distanceKm) : null,
      lastActivityAt: latest?.strike.occurredAt ?? null,
      nearbyStrikeCount: 0,
      simulated: snapshot.simulated,
    };
  }

  const recentCount = nearby.filter(
    ({ strike }) => snapshot.updatedAt - strike.occurredAt <= 15 * 60 * 1000,
  ).length;

  if (recentCount >= 6 || nearby.length >= 12) {
    return {
      level: "high",
      label: "Forte",
      distanceKm: Math.round(latest.distanceKm),
      lastActivityAt: latest.strike.occurredAt,
      nearbyStrikeCount: nearby.length,
      simulated: snapshot.simulated,
    };
  }

  if (recentCount >= 3 || nearby.length >= 6) {
    return {
      level: "moderate",
      label: "Modérée",
      distanceKm: Math.round(latest.distanceKm),
      lastActivityAt: latest.strike.occurredAt,
      nearbyStrikeCount: nearby.length,
      simulated: snapshot.simulated,
    };
  }

  return {
    level: "low",
    label: "Faible",
    distanceKm: Math.round(latest.distanceKm),
    lastActivityAt: latest.strike.occurredAt,
    nearbyStrikeCount: nearby.length,
    simulated: snapshot.simulated,
  };
}
