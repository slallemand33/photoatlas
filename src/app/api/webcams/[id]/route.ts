import { NextResponse } from "next/server";

import { webcamService } from "@/features/webcams/services/WebcamService";
import { WindyWebcamsError } from "@/features/webcams/services/WindyWebcamsProvider";

export const dynamic = "force-dynamic";

function parseCoordinate(value: string | null, minimum: number, maximum: number): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Identifiant de webcam invalide" }, { status: 400 });
  }

  const parameters = new URL(request.url).searchParams;
  const latitude = parseCoordinate(parameters.get("lat"), -90, 90);
  const longitude = parseCoordinate(parameters.get("lon"), -180, 180);
  if (latitude === null || longitude === null) {
    return NextResponse.json({ error: "Coordonnées du lieu invalides" }, { status: 400 });
  }

  try {
    const webcam = await webcamService.findById(id, { latitude, longitude }, request.signal);
    return NextResponse.json(webcam, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const upstreamStatus = error instanceof WindyWebcamsError ? error.status : 502;
    const status = upstreamStatus === 404 ? 404 : upstreamStatus === 503 ? 503 : 502;
    const message =
      error instanceof WindyWebcamsError
        ? error.message
        : "Cette webcam est momentanément indisponible";
    console.error("[Webcam API] Échec du détail Windy");
    return NextResponse.json({ error: message }, { status });
  }
}
