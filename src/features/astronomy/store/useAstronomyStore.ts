import { create } from "zustand";

interface AstronomyState {
  selectedDate: string | null;
  setSelectedDate: (date: Date | null) => void;
}

export const useAstronomyStore = create<AstronomyState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date?.toISOString() ?? null }),
}));
