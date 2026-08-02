import { NextResponse } from "next/server";

import { webcamService } from "@/features/webcams/services/WebcamService";
import { WindyWebcamsError } from "@/features/webcams/services/WindyWebcamsProvider";

export const dynamic = "force-dynamic";

const DEFAULT_RADIUS_KM = 50;
const MAX_RADIUS_KM = 250;

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;
  const latitude = parseNumber(parameters.get("lat"));
  const longitude = parseNumber(parameters.get("lon"));
  const radiusKm = parseNumber(parameters.get("radius")) ?? DEFAULT_RADIUS_KM;

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    radiusKm < 1 ||
    radiusKm > MAX_RADIUS_KM
  ) {
    return NextResponse.json({ error: "Paramètres géographiques invalides" }, { status: 400 });
  }

  try {
    const result = await webcamService.findNearby({
      latitude,
      longitude,
      radiusKm,
      limit: 50,
      signal: request.signal,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=60" },
    });
  } catch (error) {
    const status = error instanceof WindyWebcamsError ? error.status : 502;
    const safeStatus = status === 401 || status === 403 ? 502 : status;
    const message =
      error instanceof WindyWebcamsError
        ? error.message
        : "Les webcams sont momentanément indisponibles";
    console.error("[Webcams API] Échec de la recherche Windy");
    return NextResponse.json({ error: message }, { status: safeStatus });
  }
}
