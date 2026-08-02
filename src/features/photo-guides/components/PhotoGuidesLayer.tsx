"use client";

import type { ExpressionSpecification, GeoJSONSource, MapMouseEvent } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";

import { useMap } from "@/components/map/MapProvider";
import { getProjectionRadiusKm } from "@/features/astronomy/milky-way/utils/projection";
import { usePlaceStore } from "@/features/place-details/store";

import { usePhotoGuidePlan } from "../hooks";
import { usePhotoGuidesStore } from "../store";
import { toGuideGeoJson } from "../utils";

const SOURCE = "photo-guides";
const LAYERS = ["photo-guides-labels", "photo-guides-points", "photo-guides-lines"];
const COLORS: ExpressionSpecification = [
  "match",
  ["get", "guide"],
  "sun",
  "#f59e0b",
  "moon",
  "#60a5fa",
  "milkyWay",
  "#c084fc",
  "#f8fafc",
];

export function PhotoGuidesLayer() {
  const map = useMap();
  const place = usePlaceStore((state) => state.selectedPlace);
  const enabled = usePhotoGuidesStore((state) => state.enabled);
  const compositionMode = usePhotoGuidesStore((state) => state.compositionMode);
  const setCompositionPoint = usePhotoGuidesStore((state) => state.setCompositionPoint);
  const [zoom, setZoom] = useState(map?.getZoom() ?? 7);
  const active = Object.values(enabled).some(Boolean);
  const plan = usePhotoGuidePlan(place);
  const data = useMemo(
    () => (plan ? toGuideGeoJson(plan, enabled, getProjectionRadiusKm(zoom)) : null),
    [enabled, plan, zoom],
  );

  useEffect(() => {
    if (!map) return;
    const onZoom = () => setZoom(map.getZoom());
    const onClick = (event: MapMouseEvent) => {
      if (usePhotoGuidesStore.getState().compositionMode)
        setCompositionPoint({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    };
    map.on("zoomend", onZoom);
    map.on("click", onClick);
    map.getCanvas().style.cursor = compositionMode ? "crosshair" : "";
    return () => {
      map.off("zoomend", onZoom);
      map.off("click", onClick);
      map.getCanvas().style.cursor = "";
    };
  }, [compositionMode, map, setCompositionPoint]);

  useEffect(() => {
    if (!map) return;
    const remove = () => {
      for (const id of LAYERS) if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(SOURCE)) map.removeSource(SOURCE);
    };
    if (!active || !data) {
      remove();
      return;
    }
    const ensure = () => {
      if (!map.isStyleLoaded()) return;
      const source = map.getSource(SOURCE) as GeoJSONSource | undefined;
      if (source) source.setData(data);
      else map.addSource(SOURCE, { type: "geojson", data });
      if (!map.getLayer(LAYERS[2]!))
        map.addLayer({
          id: LAYERS[2]!,
          type: "line",
          source: SOURCE,
          paint: {
            "line-color": COLORS,
            "line-width": ["match", ["get", "kind"], "trajectory", 3, 2],
            "line-opacity": 0.68,
            "line-dasharray": [2, 1.5],
          },
        });
      if (!map.getLayer(LAYERS[1]!))
        map.addLayer({
          id: LAYERS[1]!,
          type: "circle",
          source: SOURCE,
          filter: ["!=", ["geometry-type"], "LineString"],
          paint: {
            "circle-color": COLORS,
            "circle-radius": ["match", ["get", "kind"], "reference", 7, "current", 7, 5],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
      if (!map.getLayer(LAYERS[0]!))
        map.addLayer({
          id: LAYERS[0]!,
          type: "symbol",
          source: SOURCE,
          filter: ["has", "label"],
          layout: {
            "text-field": ["get", "label"],
            "text-size": 14,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
          },
          paint: { "text-color": COLORS, "text-halo-color": "#111827", "text-halo-width": 2 },
        });
    };
    ensure();
    map.on("styledata", ensure);
    return () => {
      map.off("styledata", ensure);
    };
  }, [active, data, map]);
  return null;
}
