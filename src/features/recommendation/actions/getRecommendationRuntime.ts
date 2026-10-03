"use server";

import { SupabaseNearbyRecommendationSpotRepository } from "../repositories/SupabaseNearbyRecommendationSpotRepository.ts";
import { SupabaseRecommendationReferenceRepository } from "../repositories/SupabaseRecommendationReferenceRepository.ts";
import { RecommendationRuntimeService } from "../services/RecommendationRuntimeService.ts";

export async function getRecommendationRuntime(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}) {
  const runtime = new RecommendationRuntimeService({
    spotsRepository: new SupabaseNearbyRecommendationSpotRepository(),
    referenceRepository: new SupabaseRecommendationReferenceRepository(),
  });

  return runtime.prepare({
    latitude: input.latitude,
    longitude: input.longitude,
    radiusKm: input.radiusKm,
    limit: input.limit ?? 50,
    analyzedAt: new Date(),
  });
}