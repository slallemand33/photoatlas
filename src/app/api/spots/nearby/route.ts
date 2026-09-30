import { NextResponse } from "next/server";

import { findNearbySpots } from "@/features/spots/services/nearbySpots.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_RADIUS_KM = 25;
const DEFAULT_LIMIT = 20;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

function invalidRequest(error: string, message: string) {
  return NextResponse.json({ error, message }, { status: 400 });
}

function parseFloatParam(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntegerParam(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;

  const latitude = parseFloatParam(parameters.get("lat"));
  if (latitude === null || latitude < -90 || latitude > 90) {
    return invalidRequest("INVALID_LATITUDE", "Latitude invalide.");
  }

  const longitude = parseFloatParam(parameters.get("lon"));
  if (longitude === null || longitude < -180 || longitude > 180) {
    return invalidRequest("INVALID_LONGITUDE", "Longitude invalide.");
  }

  const radiusParam = parameters.get("radiusKm");
  const radiusKm = radiusParam === null ? DEFAULT_RADIUS_KM : parseFloatParam(radiusParam);
  if (radiusKm === null || radiusKm < MIN_RADIUS_KM || radiusKm > MAX_RADIUS_KM) {
    return invalidRequest(
      "INVALID_RADIUS",
      "Le rayon doit être compris entre 1 et 50 km.",
    );
  }

  const limitParam = parameters.get("limit");
  const limit = limitParam === null ? DEFAULT_LIMIT : parseIntegerParam(limitParam);
  if (limit === null || limit < MIN_LIMIT || limit > MAX_LIMIT) {
    return invalidRequest("INVALID_LIMIT", "La limite doit être un entier compris entre 1 et 50.");
  }

  try {
    const result = await findNearbySpots({ latitude, longitude, radiusKm, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Spots API] Échec de la recherche nearby_spots", error);
    return NextResponse.json(
      {
        error: "SPOTS_SEARCH_FAILED",
        message: "Impossible de rechercher les spots.",
      },
      { status: 500 },
    );
  }
}