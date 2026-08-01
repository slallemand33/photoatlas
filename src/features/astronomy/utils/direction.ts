const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] as const;

export function getCardinalDirection(azimuth: number): string {
  const normalized = ((azimuth % 360) + 360) % 360;
  return DIRECTIONS[Math.round(normalized / 45) % DIRECTIONS.length] ?? "N";
}
