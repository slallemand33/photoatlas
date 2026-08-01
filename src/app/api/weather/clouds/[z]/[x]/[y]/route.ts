import { NextResponse } from "next/server";

const OPENWEATHER_CLOUD_TILE_ROOT = "https://tile.openweathermap.org/map/clouds_new";
const MAX_ZOOM = 12;

interface CloudTileRouteContext {
  params: Promise<{ z: string; x: string; y: string }>;
}

function parseTileCoordinate(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const coordinate = Number(value);
  return Number.isSafeInteger(coordinate) ? coordinate : null;
}

export async function GET(request: Request, context: CloudTileRouteContext) {
  const { z: rawZoom, x: rawX, y: rawY } = await context.params;
  const zoom = parseTileCoordinate(rawZoom);
  const x = parseTileCoordinate(rawX);
  const y = parseTileCoordinate(rawY);

  if (zoom === null || x === null || y === null || zoom > MAX_ZOOM) {
    return NextResponse.json({ error: "Coordonnées de tuile invalides" }, { status: 400 });
  }

  const tileCount = 2 ** zoom;
  if (x >= tileCount || y >= tileCount) {
    return NextResponse.json({ error: "Tuile hors limites" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Clé OpenWeather absente du serveur" }, { status: 503 });
  }

  try {
    const upstreamUrl = `${OPENWEATHER_CLOUD_TILE_ROOT}/${zoom}/${x}/${y}.png?appid=${apiKey}`;
    const upstream = await fetch(upstreamUrl, { signal: request.signal, cache: "no-store" });
    if (!upstream.ok) {
      console.error(`[Cloud Tiles] OpenWeather a répondu ${upstream.status}`);
      return NextResponse.json({ error: "Tuile nuageuse indisponible" }, { status: 502 });
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
      },
    });
  } catch {
    console.error("[Cloud Tiles] Échec de la requête OpenWeather");
    return NextResponse.json({ error: "Tuile nuageuse indisponible" }, { status: 502 });
  }
}
