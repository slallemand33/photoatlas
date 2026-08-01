/**
 * Accès documenté à NASA GIBS (WMTS REST, projection EPSG:3857).
 * L'ordre REST est TileMatrix / TileRow / TileCol, donc {z}/{y}/{x}.
 */
const GIBS_WMTS_ROOT = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

export const NASA_GIBS_LAYER_ID = "VIIRS_CityLights_2012";
export const NASA_GIBS_TILE_MATRIX = "GoogleMapsCompatible_Level8";
export const NASA_GIBS_MAX_ZOOM = 8;

export const LIGHT_POLLUTION_TILE_URL =
  `${GIBS_WMTS_ROOT}/${NASA_GIBS_LAYER_ID}/default/` + `${NASA_GIBS_TILE_MATRIX}/{z}/{y}/{x}.jpg`;

export function getLightPollutionTileUrl(zoom: number, x: number, y: number): string {
  return LIGHT_POLLUTION_TILE_URL.replace("{z}", String(zoom))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}
