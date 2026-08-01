import type { Map as MaplibreMap } from "maplibre-gl";

import type { BasemapDefinition } from "../types";

/**
 * Applique un fond de carte. onError est appelé si le style échoue à charger
 * (clé invalide, réseau, etc.) — permet un fallback propre dans le composant.
 */
export function applyBasemap(
  map: MaplibreMap,
  definition: BasemapDefinition,
  onLoaded?: () => void,
  onError?: () => void,
): void {
  // Registres des handlers pour permettre le nettoyage croisé
  const handleLoad = () => {
    if (onError) map.off("error", handleError);
    onLoaded?.();
  };

  const handleError = () => {
    if (onLoaded) map.off("style.load", handleLoad);
    onError?.();
  };

  if (onLoaded) map.once("style.load", handleLoad);
  if (onError) map.once("error", handleError);

  map.setStyle(definition.styleSource);
}
