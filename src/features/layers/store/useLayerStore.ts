import { create } from "zustand";

import type { LayerState } from "../types";

import { registry } from "./registry";

interface LayerManagerState {
  layers: Record<string, LayerState>;
  setLayerVisible: (id: string, visible: boolean) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerZIndex: (id: string, zIndex: number) => void;
}

/** Résout l'état par défaut d'une couche depuis le registry */
function getDefaultState(id: string): LayerState {
  const def = registry.get(id);
  return {
    id,
    visible: def?.defaultVisible ?? false,
    opacity: def?.defaultOpacity ?? 1,
    zIndex: def?.defaultZIndex ?? 0,
  };
}

export const useLayerStore = create<LayerManagerState>((set, get) => ({
  layers: {},

  setLayerVisible: (id, visible) => {
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...(state.layers[id] ?? getDefaultState(id)), visible },
      },
    }));
  },

  toggleLayer: (id) => {
    const current = get().layers[id] ?? getDefaultState(id);
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...current, visible: !current.visible },
      },
    }));
  },

  setLayerOpacity: (id, opacity) => {
    const clamped = Math.max(0, Math.min(1, opacity));
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...(state.layers[id] ?? getDefaultState(id)), opacity: clamped },
      },
    }));
  },

  setLayerZIndex: (id, zIndex) => {
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...(state.layers[id] ?? getDefaultState(id)), zIndex },
      },
    }));
  },
}));
