import type { RasterSourceSpecification } from "maplibre-gl";

/**
 * Service de données de la couche "Pollution lumineuse".
 * Source : World Atlas of Artificial Night Sky Brightness — Falchi et al. 2016
 * Tuiles hébergées par lightpollutionmap.info
 */

const TILES_BASE_URL = "https://www.lightpollutionmap.info/tiles";

/** URL des tuiles raster — modifier ici pour changer de source */
export const LIGHT_POLLUTION_TILE_URL = `${TILES_BASE_URL}/{z}/{x}/{y}.png`;

/** Spec source MapLibre GL prête à l'emploi */
export function getLightPollutionSourceSpec(): RasterSourceSpecification {
  return {
    type: "raster",
    tiles: [LIGHT_POLLUTION_TILE_URL],
    tileSize: 256,
    attribution:
      '© <a href="https://www.lightpollutionmap.info" target="_blank">LightPollutionMap</a> — Falchi et al. 2016',
    minzoom: 0,
    maxzoom: 8,
  };
}
