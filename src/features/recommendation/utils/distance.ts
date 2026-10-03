const DISTANCE_BANDS = [
  { maxKm: 5, factor: 1.0 },
  { maxKm: 15, factor: 0.95 },
  { maxKm: 25, factor: 0.88 },
  { maxKm: 40, factor: 0.78 },
  { maxKm: 50, factor: 0.65 },
] as const;

export function getDistanceFactor(distanceKm: number): number {
  for (const band of DISTANCE_BANDS) {
    if (distanceKm <= band.maxKm) return band.factor;
  }

  return DISTANCE_BANDS.at(-1)?.factor ?? 0.65;
}

export function getDistanceMessage(distanceKm: number, opportunityScore: number): string {
  if (distanceKm <= 10) return "À proximité";
  if (distanceKm <= 25) return "Un peu plus loin, mais intéressant";
  if (opportunityScore >= 80) return "Ça vaut le déplacement";
  return "Un peu plus loin, mais intéressant";
}