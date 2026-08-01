import { useQuery } from "@tanstack/react-query";

import { weatherProvider } from "../services";
import { WEATHER_CACHE_TTL_MS, useWeatherStore } from "../store";
import type { WeatherLocation } from "../types";

export function useCloudCover(location: WeatherLocation, enabled = true) {
  const refreshIntervalMs = useWeatherStore((state) => state.refreshIntervalMs);

  return useQuery({
    queryKey: ["weather", "cloud-cover", location.latitude, location.longitude],
    queryFn: async ({ signal }) => {
      const snapshots = await weatherProvider.getCloudCover([location], signal);
      const snapshot = snapshots[0];
      if (!snapshot) throw new Error("Données nuageuses indisponibles");
      return snapshot;
    },
    enabled,
    staleTime: WEATHER_CACHE_TTL_MS,
    gcTime: 60 * 60 * 1000,
    refetchInterval: enabled ? refreshIntervalMs : false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
