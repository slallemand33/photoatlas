import { create } from "zustand";

import type { GuideLocation, PhotoGuideId } from "../types";

interface PhotoGuidesState {
  enabled: Record<PhotoGuideId, boolean>;
  compositionMode: boolean;
  compositionPoint: GuideLocation | null;
  toggle: (id: PhotoGuideId) => void;
  setAll: (visible: boolean) => void;
  setCompositionMode: (active: boolean) => void;
  setCompositionPoint: (point: GuideLocation | null) => void;
}

export const usePhotoGuidesStore = create<PhotoGuidesState>((set) => ({
  enabled: { sun: false, moon: false, milkyWay: false },
  compositionMode: false,
  compositionPoint: null,
  toggle: (id) => set((state) => ({ enabled: { ...state.enabled, [id]: !state.enabled[id] } })),
  setAll: (visible) => set({ enabled: { sun: visible, moon: visible, milkyWay: visible } }),
  setCompositionMode: (compositionMode) => set({ compositionMode }),
  setCompositionPoint: (compositionPoint) => set({ compositionPoint }),
}));
