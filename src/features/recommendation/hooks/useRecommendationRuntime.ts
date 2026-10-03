"use client";

import { useQuery } from "@tanstack/react-query";

import type { SearchResult } from "@/features/search/types/search.types";

import { getRecommendationRuntime } from "../actions/getRecommendationRuntime.ts";

interface UseRecommendationRuntimeInput {
  place: SearchResult;
  radiusKm: number;
  limit?: number;
  enabled?: boolean;
}

export function useRecommendationRuntime({
  place,
  radiusKm,
  limit = 50,
  enabled = true,
}: UseRecommendationRuntimeInput) {
  return useQuery({
    queryKey: ["recommendation", place.latitude, place.longitude, radiusKm, limit],
    queryFn: () =>
      getRecommendationRuntime({
        latitude: place.latitude,
        longitude: place.longitude,
        radiusKm,
        limit,
      }),
    enabled:
      enabled && Number.isFinite(place.latitude) && Number.isFinite(place.longitude) && radiusKm > 0,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}