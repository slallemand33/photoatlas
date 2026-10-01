import { create } from "zustand";

const DEFAULT_RADIUS_KM = 10;

interface NearbySpotsUiState {
  contextPlaceId: string | null;
  radiusKm: number;
  syncPlace: (placeId: string) => void;
  setRadiusKm: (radiusKm: number) => void;
}

export const nearbySpotsDefaultRadiusKm = DEFAULT_RADIUS_KM;

export const useNearbySpotsStore = create<NearbySpotsUiState>((set) => ({
  contextPlaceId: null,
  radiusKm: DEFAULT_RADIUS_KM,
  syncPlace: (placeId) =>
    set((state) =>
      state.contextPlaceId === placeId
        ? state
        : { contextPlaceId: placeId, radiusKm: DEFAULT_RADIUS_KM },
    ),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
}));