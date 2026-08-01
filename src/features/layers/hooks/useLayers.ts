import { registry } from "../store/registry";
import { useLayerStore } from "../store/useLayerStore";
import type { LayerWithState } from "../types";

/** Retourne toutes les couches disponibles avec leur état runtime fusionné */
export function useLayers(): LayerWithState[] {
  const layerStates = useLayerStore((s) => s.layers);
  const definitions = registry.getAll();

  return definitions.map((def) => {
    const state = layerStates[def.id] ?? {
      id: def.id,
      visible: def.defaultVisible,
      opacity: def.defaultOpacity,
      zIndex: def.defaultZIndex,
    };
    return { ...def, state };
  });
}
