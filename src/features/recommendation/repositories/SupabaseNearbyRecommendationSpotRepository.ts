import "server-only";

import { findNearbySpots } from "@/features/spots/services/nearbySpots.server";
import { getSupabaseServerClient } from "@/lib/supabase/client-server";

import type {
  RecommendationCandidateSpotsInput,
  RecommendationCandidateSpotsRepository,
  RecommendationSpotCandidate,
} from "../types/index.ts";

interface SpotMappingRow {
  id: string;
  slug: string;
  spot_type: string;
  spot_type_id: string | null;
}

const DEFAULT_LIMIT = 20;

export class SupabaseNearbyRecommendationSpotRepository
  implements RecommendationCandidateSpotsRepository
{
  async getCandidateSpots(
    input: RecommendationCandidateSpotsInput,
  ): Promise<RecommendationSpotCandidate[]> {
    const nearby = await findNearbySpots({
      latitude: input.latitude,
      longitude: input.longitude,
      radiusKm: input.radiusKm,
      limit: input.limit ?? DEFAULT_LIMIT,
    });

    if (nearby.spots.length === 0) return [];

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("spots")
      .select("id, slug, spot_type, spot_type_id")
      .in(
        "id",
        nearby.spots.map((spot) => spot.id),
      );

    if (error) throw new Error(error.message);

    const mappingById = new Map(((data ?? []) as SpotMappingRow[]).map((row) => [row.id, row]));

    return nearby.spots.map((spot) => {
      const row = mappingById.get(spot.id);
      return {
        id: spot.id,
        name: spot.name,
        slug: spot.slug,
        latitude: spot.latitude,
        longitude: spot.longitude,
        distanceKm: spot.distanceKm,
        spotTypeId: row?.spot_type_id ?? null,
        spotTypeSlug: row?.spot_type ?? spot.spotType,
      } satisfies RecommendationSpotCandidate;
    });
  }
}