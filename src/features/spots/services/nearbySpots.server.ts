import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/client-server";

import type {
  NearbySpot,
  NearbySpotRpcRow,
  NearbySpotsResponse,
  NearbySpotsSearchInput,
} from "../types/spot.types";

function roundDistanceKm(distanceMeters: number): number {
  return Math.round((distanceMeters / 1000) * 10) / 10;
}

function normalizeSpot(row: NearbySpotRpcRow): NearbySpot {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    spotType: row.spot_type,
    latitude: row.latitude,
    longitude: row.longitude,
    distanceKm: roundDistanceKm(row.distance_m),
    countryCode: row.country_code,
    region: row.region,
    locality: row.locality,
    description: row.description,
    potentials: {
      landscape: row.landscape_potential,
      sunrise: row.sunrise_potential,
      sunset: row.sunset_potential,
      astro: row.astro_potential,
    },
  };
}

export async function findNearbySpots(
  input: NearbySpotsSearchInput,
): Promise<NearbySpotsResponse> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("nearby_spots", {
    input_latitude: input.latitude,
    input_longitude: input.longitude,
    input_radius_km: input.radiusKm,
    input_result_limit: input.limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  const spots = ((data ?? []) as NearbySpotRpcRow[]).map(normalizeSpot);

  return {
    center: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    radiusKm: input.radiusKm,
    count: spots.length,
    spots,
  };
}