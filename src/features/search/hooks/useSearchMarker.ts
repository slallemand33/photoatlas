"use client";

import { useCallback, useEffect, useRef } from "react";

import { useMap } from "@/components/map";

const MARKER_DURATION_MS = 5000;

export function useSearchMarker() {
  const map = useMap();
  const markerRef = useRef<{ remove: () => void } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMarker = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, []);

  const showMarker = useCallback(
    (lat: number, lon: number) => {
      if (!map) return;
      clearMarker();

      void import("maplibre-gl").then(({ Marker }) => {
        if (!map) return;
        const marker = new Marker({ color: "#f97316" })
          .setLngLat([lon, lat])
          .addTo(map);

        markerRef.current = marker;
        timerRef.current = setTimeout(() => {
          marker.remove();
          markerRef.current = null;
        }, MARKER_DURATION_MS);
      });
    },
    [map, clearMarker],
  );

  useEffect(() => clearMarker, [clearMarker]);

  return { showMarker, clearMarker };
}
