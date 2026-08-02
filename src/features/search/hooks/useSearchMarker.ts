"use client";

import { useCallback, useEffect, useRef } from "react";

import { useMap } from "@/components/map";
import { usePlaceStore } from "@/features/place-details/store";

export function useSearchMarker() {
  const map = useMap();
  const openPanel = usePlaceStore((state) => state.openPanel);
  const markerRef = useRef<{ remove: () => void } | null>(null);
  const markerGenerationRef = useRef(0);

  const clearMarker = useCallback(() => {
    markerGenerationRef.current += 1;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, []);

  const showMarker = useCallback(
    (lat: number, lon: number, placeName: string) => {
      if (!map) return;
      clearMarker();
      const markerGeneration = markerGenerationRef.current;

      void import("maplibre-gl").then(({ Marker }) => {
        if (!map || markerGeneration !== markerGenerationRef.current) return;

        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.className = "photoatlas-place-marker";
        markerElement.setAttribute("aria-label", `Rouvrir la fiche du lieu ${placeName}`);
        markerElement.title = `Voir la fiche de ${placeName}`;
        markerElement.addEventListener("pointerdown", (event) => event.stopPropagation());
        markerElement.addEventListener("dblclick", (event) => event.stopPropagation());
        markerElement.addEventListener("click", (event) => {
          event.stopPropagation();
          openPanel();
        });

        const visual = document.createElement("span");
        visual.className = "photoatlas-place-marker__visual";
        const pulse = document.createElement("span");
        pulse.className = "photoatlas-place-marker__pulse";
        const pin = document.createElement("span");
        pin.className = "photoatlas-place-marker__pin";
        const center = document.createElement("span");
        center.className = "photoatlas-place-marker__center";
        pin.append(center);
        visual.append(pulse, pin);
        markerElement.append(visual);

        const marker = new Marker({ element: markerElement, anchor: "bottom" })
          .setLngLat([lon, lat])
          .addTo(map);

        markerRef.current = marker;
      });
    },
    [map, clearMarker, openPanel],
  );

  useEffect(() => clearMarker, [clearMarker]);

  return { showMarker, clearMarker };
}
