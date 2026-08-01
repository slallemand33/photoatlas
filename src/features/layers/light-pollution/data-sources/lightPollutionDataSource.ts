import type { RasterSourceSpecification } from "maplibre-gl";

import {
  getLightPollutionTileUrl,
  LIGHT_POLLUTION_TILE_URL,
  NASA_GIBS_MAX_ZOOM,
} from "../services/nasaGibsService";
import type {
  LightPollutionEstimate,
  LightPollutionLocation,
  SkyComment,
  SkyQuality,
} from "../types";

const TILE_SIZE = 256;
const ESTIMATE_ZOOM = 7;

interface RasterDataSource<TLocation, TEstimate> {
  readonly tileUrl: string;
  getSourceSpecification(): RasterSourceSpecification;
  estimateAt(location: TLocation, signal?: AbortSignal): Promise<TEstimate>;
}

interface TilePosition {
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
}

function getTilePosition(latitude: number, longitude: number, zoom: number): TilePosition {
  const worldSize = 2 ** zoom;
  const safeLatitude = Math.max(-85.051129, Math.min(85.051129, latitude));
  const x = ((longitude + 180) / 360) * worldSize;
  const latitudeRadians = (safeLatitude * Math.PI) / 180;
  const y = ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * worldSize;

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    pixelX: Math.min(TILE_SIZE - 1, Math.max(0, Math.floor((x % 1) * TILE_SIZE))),
    pixelY: Math.min(TILE_SIZE - 1, Math.max(0, Math.floor((y % 1) * TILE_SIZE))),
  };
}

function describeBortle(bortleIndex: number): {
  quality: SkyQuality;
  comment: SkyComment;
} {
  if (bortleIndex <= 2) return { quality: "Exceptionnelle", comment: "Excellent ciel" };
  if (bortleIndex <= 4) return { quality: "Très bonne", comment: "Bon ciel" };
  if (bortleIndex === 5) return { quality: "Bonne", comment: "Bon ciel" };
  if (bortleIndex <= 6) return { quality: "Moyenne", comment: "Moyen" };
  return { quality: "Dégradée", comment: "Mauvais" };
}

function lightLevelToBortle(lightLevel: number): number {
  if (lightLevel < 4) return 1;
  if (lightLevel < 7) return 2;
  if (lightLevel < 12) return 3;
  if (lightLevel < 20) return 4;
  if (lightLevel < 31) return 5;
  if (lightLevel < 45) return 6;
  if (lightLevel < 61) return 7;
  if (lightLevel < 79) return 8;
  return 9;
}

function estimateFromPlace(location: LightPollutionLocation): LightPollutionEstimate {
  const urbanTypes = new Set(["city", "suburb", "neighbourhood"]);
  const ruralTypes = new Set(["village", "hamlet", "peak", "nature_reserve"]);
  const importance = location.importance ?? 0.35;

  let bortleIndex = 5;
  if (urbanTypes.has(location.type ?? "")) bortleIndex = importance > 0.65 ? 9 : 8;
  else if (location.type === "town") bortleIndex = importance > 0.5 ? 7 : 6;
  else if (ruralTypes.has(location.type ?? "")) bortleIndex = importance < 0.35 ? 3 : 4;

  return {
    bortleIndex,
    ...describeBortle(bortleIndex),
    lightLevel: Math.round(((bortleIndex - 1) / 8) * 100),
    method: "place-heuristic",
    approximate: true,
  };
}

async function readLocalLightLevel(
  location: LightPollutionLocation,
  signal?: AbortSignal,
): Promise<number> {
  const position = getTilePosition(location.latitude, location.longitude, ESTIMATE_ZOOM);
  const response = await fetch(getLightPollutionTileUrl(ESTIMATE_ZOOM, position.x, position.y), {
    signal,
  });

  if (!response.ok) throw new Error(`NASA GIBS a répondu ${response.status}`);

  const bitmap = await createImageBitmap(await response.blob());
  try {
    const canvas = document.createElement("canvas");
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Lecture du raster indisponible");

    context.drawImage(bitmap, 0, 0, TILE_SIZE, TILE_SIZE);
    const radius = 4;
    const startX = Math.max(0, position.pixelX - radius);
    const startY = Math.max(0, position.pixelY - radius);
    const width = Math.min(TILE_SIZE - startX, radius * 2 + 1);
    const height = Math.min(TILE_SIZE - startY, radius * 2 + 1);
    const pixels = context.getImageData(startX, startY, width, height).data;
    const luminances: number[] = [];

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      luminances.push(0.2126 * red + 0.7152 * green + 0.0722 * blue);
    }

    luminances.sort((a, b) => a - b);
    const percentileIndex = Math.floor((luminances.length - 1) * 0.8);
    return Math.round(((luminances[percentileIndex] ?? 0) / 255) * 100);
  } finally {
    bitmap.close();
  }
}

class LightPollutionDataSource implements RasterDataSource<
  LightPollutionLocation,
  LightPollutionEstimate
> {
  readonly tileUrl = LIGHT_POLLUTION_TILE_URL;

  getSourceSpecification(): RasterSourceSpecification {
    return {
      type: "raster",
      tiles: [this.tileUrl],
      tileSize: TILE_SIZE,
      attribution:
        'Imagery provided by <a href="https://earthdata.nasa.gov/gibs" target="_blank">NASA GIBS / ESDIS</a>',
      minzoom: 0,
      maxzoom: NASA_GIBS_MAX_ZOOM,
    };
  }

  async estimateAt(
    location: LightPollutionLocation,
    signal?: AbortSignal,
  ): Promise<LightPollutionEstimate> {
    try {
      const lightLevel = await readLocalLightLevel(location, signal);
      const bortleIndex = lightLevelToBortle(lightLevel);
      return {
        bortleIndex,
        ...describeBortle(bortleIndex),
        lightLevel,
        method: "viirs-raster",
        approximate: true,
      };
    } catch (error) {
      if (signal?.aborted) throw error;
      return estimateFromPlace(location);
    }
  }
}

export const lightPollutionDataSource = new LightPollutionDataSource();
