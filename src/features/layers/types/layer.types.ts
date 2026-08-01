import type { LucideIcon } from "lucide-react";
import type { LayerSpecification, SourceSpecification } from "maplibre-gl";
import type { ComponentType } from "react";

export type LayerGroup =
  "base-map" | "weather" | "astronomy" | "light-pollution" | "spots" | "navigation";

export type LayerType = "raster" | "vector" | "geojson" | "custom";

export interface LayerSource {
  type: LayerType;
  url?: string;
  attribution?: string;
}

export interface LayerMetadata {
  dataProvider?: string;
  license?: string;
  /** Intervalle de rafraîchissement en secondes (pour les couches dynamiques) */
  updateIntervalSeconds?: number;
  [key: string]: unknown;
}

/** Définition statique et immuable d'une couche */
export interface LayerDefinition {
  id: string;
  name: string;
  description: string;
  group: LayerGroup;
  type: LayerType;
  source: LayerSource | null;
  metadata: LayerMetadata;
  icon: LucideIcon;
  defaultOpacity: number;
  defaultVisible: boolean;
  defaultZIndex: number;
  /** Spec source MapLibre GL — null si la couche n'a pas de source externe */
  getSourceSpec?: (state: LayerState) => SourceSpecification | null;
  /** Specs de layers MapLibre GL à ajouter à la carte */
  getLayerSpecs?: (state: LayerState) => LayerSpecification[];
  /** Composant de légende affiché dans la Sidebar quand la couche est active */
  LegendComponent?: ComponentType;
  /** Contrôles métier affichés sous la couche quand elle est active */
  ControlsComponent?: ComponentType;
}

/** État runtime d'une couche (géré par le store) */
export interface LayerState {
  id: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
}

/** Vue fusionnée : définition + état runtime */
export interface LayerWithState extends LayerDefinition {
  state: LayerState;
}
