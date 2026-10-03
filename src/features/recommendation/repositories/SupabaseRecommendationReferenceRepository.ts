import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/client-server";

import type {
  RecommendationPhotoTypeSlug,
  RecommendationReferenceEntry,
  RecommendationReferenceRepository,
} from "../types/index.ts";

interface SpotTypeRow {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
}

interface PhotoTypeRow {
  id: string;
  slug: RecommendationPhotoTypeSlug;
  name: string;
}

interface CompatibilityRow {
  spot_type_id: string;
  photo_type_id: string;
  compatibility: number;
}

export class SupabaseRecommendationReferenceRepository
  implements RecommendationReferenceRepository
{
  async getSpotTypeReferences(input: {
    spotTypeIds: string[];
    spotTypeSlugs: string[];
  }): Promise<RecommendationReferenceEntry[]> {
    const supabase = getSupabaseServerClient();

    let spotTypesQuery = supabase.from("spot_types").select("id, slug, name, parent_id");

    if (input.spotTypeIds.length > 0) {
      spotTypesQuery = spotTypesQuery.in("id", input.spotTypeIds);
    } else if (input.spotTypeSlugs.length > 0) {
      spotTypesQuery = spotTypesQuery.in("slug", input.spotTypeSlugs);
    } else {
      return [];
    }

    const { data: spotTypesData, error: spotTypesError } = await spotTypesQuery;
    if (spotTypesError) throw new Error(spotTypesError.message);

    const spotTypes = (spotTypesData ?? []) as SpotTypeRow[];
    if (spotTypes.length === 0) return [];

    const parentIds = spotTypes
      .map((row) => row.parent_id)
      .filter((value): value is string => Boolean(value));

    const { data: parentsData, error: parentsError } = parentIds.length
      ? await supabase.from("spot_types").select("id, slug, name, parent_id").in("id", parentIds)
      : { data: [], error: null };
    if (parentsError) throw new Error(parentsError.message);

    const { data: photoTypesData, error: photoTypesError } = await supabase
      .from("photo_types")
      .select("id, slug, name")
      .in("slug", ["landscape", "sunrise", "sunset", "storm", "astro"]);
    if (photoTypesError) throw new Error(photoTypesError.message);

    const { data: compatibilitiesData, error: compatibilitiesError } = await supabase
      .from("spot_photo_compatibility")
      .select("spot_type_id, photo_type_id, compatibility")
      .in(
        "spot_type_id",
        spotTypes.map((row) => row.id),
      );
    if (compatibilitiesError) throw new Error(compatibilitiesError.message);

    const parentsById = new Map(((parentsData ?? []) as SpotTypeRow[]).map((row) => [row.id, row]));
    const photoTypesById = new Map(((photoTypesData ?? []) as PhotoTypeRow[]).map((row) => [row.id, row]));
    const compatibilitiesBySpotTypeId = new Map<string, Record<RecommendationPhotoTypeSlug, number>>();

    for (const row of (compatibilitiesData ?? []) as CompatibilityRow[]) {
      const photoType = photoTypesById.get(row.photo_type_id);
      if (!photoType) continue;
      const existing = compatibilitiesBySpotTypeId.get(row.spot_type_id) ?? {
        landscape: 0,
        sunrise: 0,
        sunset: 0,
        storm: 0,
        astro: 0,
      };
      existing[photoType.slug] = row.compatibility;
      compatibilitiesBySpotTypeId.set(row.spot_type_id, existing);
    }

    return spotTypes.map((row) => {
      const parent = row.parent_id ? parentsById.get(row.parent_id) ?? null : null;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        parentSlug: parent?.slug ?? null,
        parentName: parent?.name ?? null,
        compatibilities:
          compatibilitiesBySpotTypeId.get(row.id) ?? {
            landscape: 0,
            sunrise: 0,
            sunset: 0,
            storm: 0,
            astro: 0,
          },
      } satisfies RecommendationReferenceEntry;
    });
  }
}