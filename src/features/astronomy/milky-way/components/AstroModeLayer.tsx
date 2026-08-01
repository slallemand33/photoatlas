"use client";

import type { GeoJSONSource } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { useMap } from "@/components/map/MapProvider";
import { useLayerStore } from "@/features/layers/store/useLayerStore";

import { useAstroModeLifecycle, useMilkyWayPlan } from "../hooks";
import { toAstroGeoJson } from "../utils";

const SOURCE_ID = "astro-mode-source";
const HORIZON_LAYER_ID = "astro-mode-horizon";
const DIRECTION_LAYER_ID = "astro-mode-direction";
const TRAJECTORY_LAYER_ID = "astro-mode-trajectory";
const CARDINAL_LAYER_ID = "astro-mode-cardinals";
const POINT_LAYER_ID = "astro-mode-points";
const LABEL_LAYER_ID = "astro-mode-labels";
const ALL_LAYER_IDS = [
  LABEL_LAYER_ID,
  POINT_LAYER_ID,
  CARDINAL_LAYER_ID,
  TRAJECTORY_LAYER_ID,
  DIRECTION_LAYER_ID,
  HORIZON_LAYER_ID,
];

function removeAstroMode(map: NonNullable<ReturnType<typeof useMap>>): void {
  for (const id of ALL_LAYER_IDS) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

export function AstroModeLayer() {
  const map = useMap();
  const { isActive, selectedPlace } = useAstroModeLifecycle();
  const opacity = useLayerStore((state) => state.layers["milky-way"]?.opacity ?? 0.9);
  const opacityRef = useRef(opacity);
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? 5);
  const plan = useMilkyWayPlan(selectedPlace, zoom, isActive);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    if (!map) return;
    const updateZoom = () => setZoom(map.getZoom());
    updateZoom();
    map.on("zoomend", updateZoom);
    return () => {
      map.off("zoomend", updateZoom);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (!isActive || !plan) {
      removeAstroMode(map);
      return;
    }

    const data = toAstroGeoJson(plan);
    const ensureAstroMode = () => {
      if (!map.isStyleLoaded()) return;
      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
      if (source) source.setData(data);
      else map.addSource(SOURCE_ID, { type: "geojson", data });

      if (!map.getLayer(HORIZON_LAYER_ID)) {
        map.addLayer({
          id: HORIZON_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          filter: ["==", ["get", "kind"], "horizon"],
          paint: {
            "line-color": "#a78bfa",
            "line-width": 1,
            "line-opacity": opacityRef.current * 0.28,
            "line-dasharray": [2, 3],
          },
        });
      }

      if (!map.getLayer(DIRECTION_LAYER_ID)) {
        map.addLayer({
          id: DIRECTION_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          filter: ["==", ["get", "kind"], "direction"],
          paint: {
            "line-color": "#c4b5fd",
            "line-width": ["interpolate", ["linear"], ["zoom"], 4, 4, 10, 2],
            "line-opacity": opacityRef.current * 0.6,
            "line-blur": 0.8,
          },
        });
      }

      if (!map.getLayer(TRAJECTORY_LAYER_ID)) {
        map.addLayer({
          id: TRAJECTORY_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          minzoom: 7.5,
          filter: ["==", ["get", "kind"], "trajectory"],
          paint: {
            "line-color": "#f5d0fe",
            "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.5, 13, 3],
            "line-opacity": opacityRef.current * 0.62,
            "line-blur": 0.35,
          },
        });
      }

      if (!map.getLayer(CARDINAL_LAYER_ID)) {
        map.addLayer({
          id: CARDINAL_LAYER_ID,
          type: "symbol",
          source: SOURCE_ID,
          filter: ["==", ["get", "kind"], "cardinal"],
          layout: {
            "text-field": ["get", "label"],
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#ddd6fe",
            "text-opacity": opacityRef.current * 0.8,
            "text-halo-color": "#111827",
            "text-halo-width": 1.2,
          },
        });
      }

      if (!map.getLayer(POINT_LAYER_ID)) {
        map.addLayer({
          id: POINT_LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          minzoom: 7.5,
          filter: ["in", ["get", "kind"], ["literal", ["core", "culmination", "disappearance"]]],
          paint: {
            "circle-radius": ["match", ["get", "kind"], "core", 7, "culmination", 5, 4],
            "circle-color": [
              "match",
              ["get", "kind"],
              "core",
              "#fef08a",
              "culmination",
              "#f0abfc",
              "#94a3b8",
            ],
            "circle-opacity": opacityRef.current,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
            "circle-stroke-opacity": opacityRef.current * 0.9,
          },
        });
      }

      if (!map.getLayer(LABEL_LAYER_ID)) {
        map.addLayer({
          id: LABEL_LAYER_ID,
          type: "symbol",
          source: SOURCE_ID,
          minzoom: 10,
          filter: [
            "in",
            ["get", "kind"],
            ["literal", ["annotation", "core", "culmination", "disappearance"]],
          ],
          layout: {
            "text-field": ["get", "label"],
            "text-size": 10,
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#f5f3ff",
            "text-opacity": opacityRef.current * 0.88,
            "text-halo-color": "#111827",
            "text-halo-width": 1.4,
          },
        });
      }
    };

    ensureAstroMode();
    map.on("styledata", ensureAstroMode);
    return () => {
      map.off("styledata", ensureAstroMode);
    };
  }, [isActive, map, plan]);

  useEffect(() => {
    if (!map) return;
    if (map.getLayer(HORIZON_LAYER_ID)) {
      map.setPaintProperty(HORIZON_LAYER_ID, "line-opacity", opacity * 0.28);
    }
    if (map.getLayer(DIRECTION_LAYER_ID)) {
      map.setPaintProperty(DIRECTION_LAYER_ID, "line-opacity", opacity * 0.6);
    }
    if (map.getLayer(TRAJECTORY_LAYER_ID)) {
      map.setPaintProperty(TRAJECTORY_LAYER_ID, "line-opacity", opacity * 0.62);
    }
    if (map.getLayer(POINT_LAYER_ID)) {
      map.setPaintProperty(POINT_LAYER_ID, "circle-opacity", opacity);
    }
  }, [map, opacity]);

  useEffect(
    () => () => {
      if (map) removeAstroMode(map);
    },
    [map],
  );

  return null;
}
