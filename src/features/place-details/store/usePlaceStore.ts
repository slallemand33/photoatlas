import { create } from "zustand";

import type { SearchResult } from "@/features/search/types";

interface PlaceState {
  selectedPlace: SearchResult | null;
  isOpen: boolean;
  selectPlace: (place: SearchResult) => void;
  openPanel: () => void;
  closePanel: () => void;
}

export const usePlaceStore = create<PlaceState>((set) => ({
  selectedPlace: null,
  isOpen: false,
  selectPlace: (place) => set({ selectedPlace: place, isOpen: true }),
  openPanel: () => set((state) => (state.selectedPlace ? { isOpen: true } : {})),
  closePanel: () => set({ isOpen: false }),
}));
