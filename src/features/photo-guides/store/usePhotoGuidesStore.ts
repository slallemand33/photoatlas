import { create } from "zustand";

import type { GuideLocation, PhotoGuideId } from "../types";

interface PhotoGuidesState {
  enabled: Record<PhotoGuideId, boolean>;
  selectedTime: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  compositionMode: boolean;
  compositionPoint: GuideLocation | null;
  toggle: (id: PhotoGuideId) => void;
  setAll: (visible: boolean) => void;
  setTime: (date: Date) => void;
  initialize: (date: Date) => void;
  setCompositionMode: (active: boolean) => void;
  setCompositionPoint: (point: GuideLocation | null) => void;
}

export const usePhotoGuidesStore = create<PhotoGuidesState>((set) => ({
  enabled: { sun: false, moon: false, milkyWay: false },
  selectedTime: null,
  windowStart: null,
  windowEnd: null,
  compositionMode: false,
  compositionPoint: null,
  toggle: (id) => set((state) => ({ enabled: { ...state.enabled, [id]: !state.enabled[id] } })),
  setAll: (visible) => set({ enabled: { sun: visible, moon: visible, milkyWay: visible } }),
  setTime: (date) => set({ selectedTime: date.toISOString() }),
  initialize: (date) => {
    const start = new Date(date);
    start.setHours(18, 0, 0, 0);
    if (date.getHours() < 6) start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 12);
    set({
      selectedTime: date.toISOString(),
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      compositionPoint: null,
    });
  },
  setCompositionMode: (compositionMode) => set({ compositionMode }),
  setCompositionPoint: (compositionPoint) => set({ compositionPoint }),
}));
