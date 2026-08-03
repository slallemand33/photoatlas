"use client";

import type { MapMouseEvent } from "maplibre-gl";
import { useEffect } from "react";

import { useMap } from "@/components/map";

import { useLocationSelection } from "../hooks";

export function MapLocationSelection() {
  const map = useMap();
  const { selectMapPoint } = useLocationSelection();

  useEffect(() => {
    if (!map) return;

    const handleClick = (event: MapMouseEvent) => {
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
