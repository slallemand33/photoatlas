"use client";

import type { RasterTileSource } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { useMap } from "@/components/map/MapProvider";
import { useLayerStore } from "@/features/layers/store/useLayerStore";

import { useRadarPlayback, useRadarTimeline } from "../hooks";
import { useRadarStore } from "../store";

const SOURCE_ID = "rain-radar-source";
const MAP_LAYER_ID = "rain-radar-raster";

export function RadarLayer() {
  const map = useMap();
  const isVisible = useLayerStore((state) => state.layers["rain-radar"]?.visible ?? false);
  const opacity = useLayerStore((state) => state.layers["rain-radar"]?.opacity ?? 0.75);
  const opacityRef = useRef(opacity);
  const tileUrl = useRadarStore(
    (state) => state.timeline?.frames[state.currentIndex]?.tileUrl ?? null,
  );

  useRadarTimeline(isVisible);
  useRadarPlayback(isVisible);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    if (!map) return;

    const removeRadar = () => {
      if (map.getLayer(MAP_LAYER_ID)) map.removeLayer(MAP_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };

    if (!isVisible) {
      removeRadar();
      return;
    }

    if (!tileUrl) return;

    const ensureRadar = () => {
      if (!map.isStyleLoaded()) return;

      const source = map.getSource(SOURCE_ID) as RasterTileSource | undefined;
      if (source) {
        source.setTiles([tileUrl]);
      } else {
        map.addSource(SOURCE_ID, {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 512,
          maxzoom: 7,
          attribution: "Radar météo © RainViewer",
        });
      }

      if (!map.getLayer(MAP_LAYER_ID)) {
        map.addLayer({
          id: MAP_LAYER_ID,
          type: "raster",
          source: SOURCE_ID,
          paint: {
            "raster-opacity": opacityRef.current,
            "raster-fade-duration": 350,
            "raster-resampling": "linear",
          },
        });
      }
    };

    ensureRadar();
    map.on("styledata", ensureRadar);
    return () => {
      map.off("styledata", ensureRadar);
    };
  }, [isVisible, map, tileUrl]);

  useEffect(() => {
    if (map?.getLayer(MAP_LAYER_ID)) {
      map.setPaintProperty(MAP_LAYER_ID, "raster-opacity", opacity);
    }
  }, [map, opacity]);

  useEffect(
    () => () => {
      if (!map) return;
      if (map.getLayer(MAP_LAYER_ID)) map.removeLayer(MAP_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    },
    [map],
  );

  return null;
}
