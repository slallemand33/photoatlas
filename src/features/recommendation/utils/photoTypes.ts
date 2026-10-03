import type { PhotoRecommendationKind } from "@/features/photo-score/types";

import type { RecommendationPhotoType, RecommendationPhotoTypeSlug } from "../types/index.ts";

const PHOTO_TYPES: Record<RecommendationPhotoTypeSlug, RecommendationPhotoType> = {
  landscape: { slug: "landscape", name: "Paysage" },
  sunrise: { slug: "sunrise", name: "Lever de soleil" },
  sunset: { slug: "sunset", name: "Coucher de soleil" },
  storm: { slug: "storm", name: "Orages" },
  astro: { slug: "astro", name: "Astro" },
};

export function getRecommendationPhotoType(
  slug: RecommendationPhotoTypeSlug,
): RecommendationPhotoType {
  return PHOTO_TYPES[slug];
}

export function fromPhotoScoreKind(kind: PhotoRecommendationKind): RecommendationPhotoType {
  if (kind === "storms") return PHOTO_TYPES.storm;
  return PHOTO_TYPES[kind];
}