export function clampScore(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

export function scoreToStars(score: number): number {
  if (score >= 85) return 5;
  if (score >= 68) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

export function scoreSummary(score: number): string {
  if (score >= 85) return "Conditions excellentes";
  if (score >= 68) return "Très bonnes conditions";
  if (score >= 50) return "Conditions intéressantes";
  if (score >= 30) return "Conditions mitigées";
  return "Conditions peu favorables";
}

export function idealRangeScore(value: number, ideal: number, tolerance: number): number {
  return clampScore(100 - (Math.abs(value - ideal) / tolerance) * 100);
}

export function subtractMinutes(iso: string | null, minutes: number): string | null {
  if (!iso) return null;
  return new Date(new Date(iso).getTime() - minutes * 60_000).toISOString();
}
