"use client";

import { useQuery } from "@tanstack/react-query";

import type { NearbySpotsResponse } from "../types/spot.types";

interface UseNearbySpotsInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

export function useNearbySpots({
  latitude,
  longitude,
  radiusKm,
  limit = 20,
}: UseNearbySpotsInput) {
  return useQuery({
    queryKey: ["spots", "nearby", latitude, longitude, radiusKm, limit],
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        radiusKm: String(radiusKm),
        limit: String(limit),
      });

      const response = await fetch(`/api/spots/nearby?${parameters.toString()}`, { signal });
      const payload = (await response.json()) as NearbySpotsResponse | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Impossible de rechercher les spots.",
        );
      }

      return payload as NearbySpotsResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}