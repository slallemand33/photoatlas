import type { MoonPhaseName } from "../types";

export function getMoonPhaseName(angle: number): MoonPhaseName {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized < 22.5 || normalized >= 337.5) return "Nouvelle lune";
  if (normalized < 67.5) return "Premier croissant";
  if (normalized < 112.5) return "Premier quartier";
  if (normalized < 157.5) return "Gibbeuse croissante";
  if (normalized < 202.5) return "Pleine lune";
  if (normalized < 247.5) return "Gibbeuse décroissante";
  if (normalized < 292.5) return "Dernier quartier";
  return "Dernier croissant";
}
