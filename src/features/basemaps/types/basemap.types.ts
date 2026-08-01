import type { StyleSpecification } from "maplibre-gl";

export type BasemapCategory = "standard" | "dark" | "satellite" | "outdoor" | "topographic";

export interface BasemapDefinition {
  id: string;
  name: string;
  description: string;
  provider: string;
  /** URL d'un style vector tiles ou objet StyleSpecification inline (raster) */
  styleSource: string | StyleSpecification;
  category: BasemapCategory;
  /** True si le fond est à dominante sombre */
  dark: boolean;
  maxZoom: number;
  minZoom: number;
  attribution: string;
  /** Couleur hex représentant visuellement le fond dans le sélecteur */
  thumbnailColor: string;
}
