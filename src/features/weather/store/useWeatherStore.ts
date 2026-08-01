import { create } from "zustand";

export const DEFAULT_WEATHER_REFRESH_INTERVAL_MS = 30 * 60 * 1000;
export const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000;

interface WeatherState {
  refreshIntervalMs: number;
  setRefreshIntervalMs: (intervalMs: number) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  refreshIntervalMs: DEFAULT_WEATHER_REFRESH_INTERVAL_MS,
  setRefreshIntervalMs: (intervalMs) =>
    set({ refreshIntervalMs: Math.max(5 * 60 * 1000, intervalMs) }),
}));
