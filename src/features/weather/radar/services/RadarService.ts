import type {
  IRadarService,
  RadarLocation,
  RadarTimeline,
  RainAtLocation,
  RainIntensity,
  RainViewerFrame,
} from "../types";
import { getRadarTilePosition, replaceTileCoordinates } from "../utils";

const RAINVIEWER_TIMELINE_URL = "https://api.rainviewer.com/public/weather-maps.json";
const TIMELINE_CACHE_MS = 5 * 60 * 1000;
const TILE_SIZE = 512;
const SAMPLE_ZOOM = 7;
const COLOR_SCHEME = 2;
const TILE_OPTIONS = "1_0";

interface RainViewerApiFrame {
  time: number;
  path: string;
}

interface RainViewerApiResponse {
  generated: number;
  host: string;
  radar?: {
    past?: RainViewerApiFrame[];
  };
}

interface TimelineCache {
  expiresAt: number;
  timeline: RadarTimeline;
}

function buildTileUrl(host: string, frame: RainViewerApiFrame): string {
  return `${host}${frame.path}/${TILE_SIZE}/{z}/{x}/{y}/` + `${COLOR_SCHEME}/${TILE_OPTIONS}.png`;
}

function describeRain(signal: number, frameTime: number): RainAtLocation {
  let intensity: RainIntensity = "none";
  let label: RainAtLocation["label"] = "Pas de pluie";

  if (signal >= 70) {
    intensity = "heavy";
    label = "Forte pluie";
  } else if (signal >= 38) {
    intensity = "moderate";
    label = "Pluie modérée";
  } else if (signal >= 8) {
    intensity = "light";
    label = "Faible pluie";
  }

  return { intensity, label, signal, frameTime };
}

async function readRainSignal(
  frame: RainViewerFrame,
  location: RadarLocation,
  signal?: AbortSignal,
): Promise<number> {
  const position = getRadarTilePosition(
    location.latitude,
    location.longitude,
    SAMPLE_ZOOM,
    TILE_SIZE,
  );
  const url = replaceTileCoordinates(frame.tileUrl, SAMPLE_ZOOM, position.x, position.y);
  const response = await fetch(url, { signal, cache: "force-cache" });
  if (!response.ok) throw new Error(`RainViewer a répondu ${response.status}`);

  const bitmap = await createImageBitmap(await response.blob());
  try {
    const canvas = document.createElement("canvas");
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Lecture de la tuile radar indisponible");
    context.drawImage(bitmap, 0, 0, TILE_SIZE, TILE_SIZE);

    const radius = 4;
    const startX = Math.max(0, position.pixelX - radius);
    const startY = Math.max(0, position.pixelY - radius);
    const width = Math.min(TILE_SIZE - startX, radius * 2 + 1);
    const height = Math.min(TILE_SIZE - startY, radius * 2 + 1);
    const pixels = context.getImageData(startX, startY, width, height).data;
    const signals: number[] = [];

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      const alpha = pixels[index + 3] ?? 0;
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      signals.push((alpha / 255) * (luminance / 255) * 100);
    }

    signals.sort((a, b) => a - b);
    return Math.round(signals[Math.floor((signals.length - 1) * 0.85)] ?? 0);
  } finally {
    bitmap.close();
  }
}

export class RadarService implements IRadarService {
  private cache: TimelineCache | null = null;

  async getTimeline(signal?: AbortSignal): Promise<RadarTimeline> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.timeline;

    const response = await fetch(RAINVIEWER_TIMELINE_URL, { signal });
    if (!response.ok) throw new Error(`RainViewer a répondu ${response.status}`);
    const payload = (await response.json()) as RainViewerApiResponse;
    const frames = (payload.radar?.past ?? []).map((frame) => ({
      id: String(frame.time),
      time: frame.time,
      path: frame.path,
      tileUrl: buildTileUrl(payload.host, frame),
    }));
    if (frames.length === 0) throw new Error("RainViewer ne fournit aucune image radar");

    const timeline = { generatedAt: payload.generated, frames };
    this.cache = { expiresAt: Date.now() + TIMELINE_CACHE_MS, timeline };
    return timeline;
  }

  async getRainAtLocation(
    frame: RainViewerFrame,
    location: RadarLocation,
    signal?: AbortSignal,
  ): Promise<RainAtLocation> {
    const rainSignal = await readRainSignal(frame, location, signal);
    return describeRain(rainSignal, frame.time);
  }
}

export const radarService = new RadarService();
