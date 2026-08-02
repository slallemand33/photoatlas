import type { LayerSpecification, Map as MaplibreMap, SourceSpecification } from "maplibre-gl";

import { registry } from "@/features/layers/store/registry";
import type { LayerState } from "@/features/layers/types";

/**
 * Synchronise les couches actives du Layer Store avec MapLibre GL.
 * Appelé par MapCanvas à chaque changement du store.
 * Ce fichier est le seul point de contact entre le Layer Manager et MapLibre.
 */
export function syncLayersToMap(map: MaplibreMap, layerStates: Record<string, LayerState>): void {
  for (const [id, state] of Object.entries(layerStates)) {
    const def = registry.get(id);
    if (!def?.getSourceSpec || !def?.getLayerSpecs) continue;

    const sourceExists = Boolean(map.getSource(id));
    const specs = def.getLayerSpecs(state);

    if (state.visible && !sourceExists) {
      addLayer(map, id, def.getSourceSpec(state), specs);
    } else if (!state.visible && sourceExists) {
      removeLayer(map, id, specs);
    } else if (state.visible && sourceExists) {
      updateOpacity(map, specs, state.opacity);
    }
  }
}

function addLayer(
  map: MaplibreMap,
  sourceId: string,
  sourceSpec: SourceSpecification | null,
  layerSpecs: LayerSpecification[],
): void {
  if (sourceSpec) {
    map.addSource(sourceId, sourceSpec);
  }
  for (const spec of layerSpecs) {
    if (!map.getLayer(spec.id)) {
      map.addLayer(spec);
    }
  }
}

function removeLayer(map: MaplibreMap, sourceId: string, layerSpecs: LayerSpecification[]): void {
  for (const spec of layerSpecs) {
    if (map.getLayer(spec.id)) {
      map.removeLayer(spec.id);
    }
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

function updateOpacity(map: MaplibreMap, layerSpecs: LayerSpecification[], opacity: number): void {
  for (const spec of layerSpecs) {
    if (!map.getLayer(spec.id)) continue;
    if (spec.type === "raster") {
      map.setPaintProperty(spec.id, "raster-opacity", opacity);
    } else if (spec.type === "fill") {
      map.setPaintProperty(spec.id, "fill-opacity", opacity);
    } else if (spec.type === "line") {
      map.setPaintProperty(spec.id, "line-opacity", opacity);
    } else if (spec.type === "circle") {
      map.setPaintProperty(spec.id, "circle-opacity", opacity);
    }
  }
}
