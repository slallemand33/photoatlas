import { NextResponse } from "next/server";

import { openWeatherLightningServerService } from "@/features/weather/lightning/services/openWeatherLightningServerService";

export const dynamic = "force-dynamic";

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = parseNumber(url.searchParams.get("lat"));
  const longitude = parseNumber(url.searchParams.get("lon"));
  const radius = parseNumber(url.searchParams.get("radius"));

  if (
    latitude === null ||
    longitude === null ||
    radius === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    radius < 1 ||
    radius > 50
  ) {
    return NextResponse.json({ error: "Paramètres géographiques invalides" }, { status: 400 });
  }

  try {
    const lightnings = await openWeatherLightningServerService.getRecentStrikes(
      latitude,
      longitude,
      radius,
      request.signal,
    );
    return NextResponse.json(
      { updatedAt: Date.now(), lightnings },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=30" } },
    );
  } catch {
    console.error("[Lightning API] Échec de la requête OpenWeather");
    return NextResponse.json(
      { error: "Les impacts de foudre sont momentanément indisponibles" },
      { status: 502 },
    );
  }
}
