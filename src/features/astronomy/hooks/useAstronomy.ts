"use client";

import { useQuery } from "@tanstack/react-query";

import { astronomyService } from "../services";
import { useAstronomyStore } from "../store";
import type { AstronomyLocation } from "../types";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useAstronomy(location: AstronomyLocation) {
  const selectedDate = useAstronomyStore((state) => state.selectedDate);

  return useQuery({
    queryKey: [
      "astronomy",
      location.latitude,
      location.longitude,
      location.elevationMeters ?? 0,
      selectedDate ?? "now",
    ],
    queryFn: () =>
      astronomyService.calculate(location, selectedDate ? new Date(selectedDate) : new Date()),
    staleTime: selectedDate ? Infinity : REFRESH_INTERVAL_MS,
    gcTime: 60 * 60 * 1000,
    refetchInterval: selectedDate ? false : REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
