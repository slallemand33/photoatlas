import { create } from "zustand";

interface MilkyWayState {
  windowStart: string | null;
  windowEnd: string | null;
  selectedTime: string | null;
  previousBasemapId: string | null;
  initializeWindow: (
    now: Date,
    astronomicalNight?: { start: string | null; end: string | null },
  ) => void;
  setSelectedTime: (date: Date) => void;
  setPreviousBasemapId: (id: string | null) => void;
  reset: () => void;
}

export const useMilkyWayStore = create<MilkyWayState>((set) => ({
  windowStart: null,
  windowEnd: null,
  selectedTime: null,
  previousBasemapId: null,

  initializeWindow: (now, astronomicalNight) => {
    const fallbackStart = new Date(now);
    fallbackStart.setMinutes(0, 0, 0);
    fallbackStart.setHours(fallbackStart.getHours() - 2);
    const fallbackEnd = new Date(fallbackStart.getTime() + 10 * 60 * 60 * 1000);
    const nightStart = astronomicalNight?.start ? new Date(astronomicalNight.start) : null;
    const nightEnd = astronomicalNight?.end ? new Date(astronomicalNight.end) : null;
    const currentNight = nightStart && nightEnd && nightStart <= now && nightEnd > now;
    const upcomingNight = nightStart && nightEnd && nightStart > now;
    const start = currentNight ? nightStart : upcomingNight ? now : fallbackStart;
    const end = nightEnd && nightEnd > now ? nightEnd : fallbackEnd;

    set({
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      selectedTime: now.toISOString(),
    });
  },

  setSelectedTime: (date) => set({ selectedTime: date.toISOString() }),
  setPreviousBasemapId: (previousBasemapId) => set({ previousBasemapId }),
  reset: () => set({ windowStart: null, windowEnd: null, selectedTime: null }),
}));
