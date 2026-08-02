import { NextResponse } from "next/server";

import {
  getNasaGibsTileUrl,
  NASA_GIBS_MAX_ZOOM,
} from "@/features/layers/light-pollution/services/nasaGibsService";

export const runtime = "edge";
export const preferredRegion = ["cdg1"];

interface LightPollutionTileContext {
  params: Promise<{ z: string; x: string; y: string }>;
}

function parseTileCoordinate(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const coordinate = Number(value);
  return Number.isSafeInteger(coordinate) ? coordinate : null;
}

export async function GET(request: Request, context: LightPollutionTileContext) {
  const { z: rawZoom, x: rawX, y: rawY } = await context.params;
  const zoom = parseTileCoordinate(rawZoom);
  const x = parseTileCoordinate(rawX);
  const y = parseTileCoordinate(rawY);

  if (zoom === null || x === null || y === null || zoom > NASA_GIBS_MAX_ZOOM) {
    return NextResponse.json({ error: "Coordonnées de tuile invalides" }, { status: 400 });
  }

  const tileCount = 2 ** zoom;
  if (x >= tileCount || y >= tileCount) {
    return NextResponse.json({ error: "Tuile hors limites" }, { status: 400 });
  }

  const upstreamUrl = getNasaGibsTileUrl(zoom, x, y);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "PhotoAtlas/1.0 (+https://photoatlas.vercel.app)",
      },
      signal: request.signal,
      cache: "no-store",
      redirect: "follow",
    });
    if (!upstream.ok) {
      console.error(`[Light Pollution Tiles] NASA GIBS a répondu ${upstream.status}`);
      return NextResponse.redirect(upstreamUrl, 307);
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    console.error("[Light Pollution Tiles] Échec de la requête NASA GIBS");
    return NextResponse.redirect(upstreamUrl, 307);
  }
}
