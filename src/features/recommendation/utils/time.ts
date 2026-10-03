export function resolveOpportunityTime(
  timing: { idealTime: string | null; start: string | null; end: string | null },
): string | null {
  return timing.idealTime ?? timing.start ?? timing.end ?? null;
}

export function getOpportunityTimeExclusionReason(
  referenceTime: string,
  candidateTime: string | null,
  windowHours: number,
): string | null {
  if (!candidateTime) return "Moment photographique indisponible.";

  const referenceMs = new Date(referenceTime).getTime();
  const candidateMs = new Date(candidateTime).getTime();
  if (Number.isNaN(referenceMs) || Number.isNaN(candidateMs)) {
    return "Moment photographique indisponible.";
  }

  const deltaMs = candidateMs - referenceMs;
  if (deltaMs < 0) return "Moment photographique déjà passé.";
  if (deltaMs > windowHours * 60 * 60 * 1000) return "Hors fenêtre de 24 heures.";
  return null;
}

export function isWithinNextHours(
  referenceTime: string,
  candidateTime: string | null,
  windowHours: number,
): boolean {
  return getOpportunityTimeExclusionReason(referenceTime, candidateTime, windowHours) === null;
}

export function minutesUntil(referenceTime: string, candidateTime: string | null): number {
  if (!candidateTime) return Number.POSITIVE_INFINITY;

  const referenceMs = new Date(referenceTime).getTime();
  const candidateMs = new Date(candidateTime).getTime();
  if (Number.isNaN(referenceMs) || Number.isNaN(candidateMs)) return Number.POSITIVE_INFINITY;

  return Math.max(0, Math.round((candidateMs - referenceMs) / 60000));
}