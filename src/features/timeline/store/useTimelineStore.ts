import { create } from "zustand";

import type { TimelineResult } from "../types";

interface TimelineState {
  selectedTime: string | null;
  placeId: string | null;
  result: TimelineResult | null;
  initialize: (placeId: string, now: Date) => void;
  setSelectedTime: (date: Date) => void;
  setResult: (result: TimelineResult) => void;
}
export const useTimelineStore = create<TimelineState>((set, get) => ({
  selectedTime: null,
  placeId: null,
  result: null,
  initialize: (placeId, now) => {
    if (get().placeId !== placeId) set({ placeId, selectedTime: now.toISOString(), result: null });
  },
  setSelectedTime: (date) => set({ selectedTime: date.toISOString() }),
  setResult: (result) => set({ result }),
}));
