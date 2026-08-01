export type SkyQuality = "Exceptionnelle" | "Très bonne" | "Bonne" | "Moyenne" | "Dégradée";

export type SkyComment = "Excellent ciel" | "Bon ciel" | "Moyen" | "Mauvais";

export interface LightPollutionLocation {
  latitude: number;
  longitude: number;
  type?: string;
  importance?: number;
}

export interface LightPollutionEstimate {
  bortleIndex: number;
  quality: SkyQuality;
  comment: SkyComment;
  /** Intensité lumineuse normalisée entre 0 (ciel sombre) et 100 (très lumineux). */
  lightLevel: number;
  /** Permet de distinguer la lecture du raster du repli heuristique. */
  method: "viirs-raster" | "place-heuristic";
  approximate: true;
}
