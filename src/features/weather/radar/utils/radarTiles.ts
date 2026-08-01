const WEB_MERCATOR_MAX_LATITUDE = 85.051129;

export interface RadarTilePosition {
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
}

export function getRadarTilePosition(
  latitude: number,
  longitude: number,
  zoom: number,
  tileSize: number,
): RadarTilePosition {
  const worldSize = 2 ** zoom;
  const safeLatitude = Math.max(
    -WEB_MERCATOR_MAX_LATITUDE,
    Math.min(WEB_MERCATOR_MAX_LATITUDE, latitude),
  );
  const x = ((longitude + 180) / 360) * worldSize;
  const latitudeRadians = (safeLatitude * Math.PI) / 180;
  const y = ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * worldSize;

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    pixelX: Math.min(tileSize - 1, Math.max(0, Math.floor((x % 1) * tileSize))),
    pixelY: Math.min(tileSize - 1, Math.max(0, Math.floor((y % 1) * tileSize))),
  };
}

export function replaceTileCoordinates(
  template: string,
  zoom: number,
  x: number,
  y: number,
): string {
  return template.replace("{z}", String(zoom)).replace("{x}", String(x)).replace("{y}", String(y));
}
