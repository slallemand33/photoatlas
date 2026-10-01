"use client";

import type { MapMouseEvent } from "maplibre-gl";
import { useEffect } from "react";

import { useMap } from "@/components/map";
import { NEARBY_SPOTS_LAYER_ID } from "@/features/spots/constants";

import { useLocationSelection } from "../hooks";

export function MapLocationSelection() {
  const map = useMap();
  const { selectMapPoint } = useLocationSelection();

  useEffect(() => {
    if (!map) return;

    const handleClick = (event: MapMouseEvent) => {
      if (
        map.getLayer(NEARBY_SPOTS_LAYER_ID) &&
        map.queryRenderedFeatures(event.point, { layers: [NEARBY_SPOTS_LAYER_ID] }).length > 0
      ) {
        return;
      }
      void selectMapPoint({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, selectMapPoint]);

  return null;
}
