"use client";

import type { Map as MaplibreMap, Marker as MaplibreMarker } from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";

import { useMap } from "@/components/map";
import { usePlaceStore } from "@/features/place-details/store";

let sharedMarker: MaplibreMarker | null = null;
let sharedMarkerElement: HTMLButtonElement | null = null;
let sharedMarkerMap: MaplibreMap | null = null;
let sharedMarkerGeneration = 0;

function updateMarkerElement(placeName: string) {
  if (!sharedMarkerElement) return;

  sharedMarkerElement.setAttribute("aria-label", `Rouvrir la fiche du lieu ${placeName}`);
  sharedMarkerElement.title = `Voir la fiche de ${placeName}`;
}

export function useSearchMarker() {
  const map = useMap();
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const openPanel = usePlaceStore((state) => state.openPanel);
  const openPanelRef = useRef(openPanel);

  useEffect(() => {
    openPanelRef.current = openPanel;
  }, [openPanel]);

  const clearMarker = useCallback(() => {
    sharedMarkerGeneration += 1;
    if (sharedMarker) {
      sharedMarker.remove();
      sharedMarker = null;
      sharedMarkerElement = null;
      sharedMarkerMap = null;
    }
  }, []);

  const showMarker = useCallback(
    (lat: number, lon: number, placeName: string) => {
      if (!map) return;

      if (sharedMarker && sharedMarkerMap === map) {
        updateMarkerElement(placeName);
        sharedMarker.setLngLat([lon, lat]);
        return;
      }

      clearMarker();
      const markerGeneration = sharedMarkerGeneration;

      void import("maplibre-gl").then(({ Marker }) => {
        if (!map || markerGeneration !== sharedMarkerGeneration) return;

        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.className = "photoatlas-place-marker";
        updateMarkerElement(placeName);
        markerElement.addEventListener("pointerdown", (event) => event.stopPropagation());
        markerElement.addEventListener("dblclick", (event) => event.stopPropagation());
        markerElement.addEventListener("click", (event) => {
          event.stopPropagation();
          openPanelRef.current();
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

        markerElement.setAttribute("aria-label", `Rouvrir la fiche du lieu ${placeName}`);
        markerElement.title = `Voir la fiche de ${placeName}`;

        const marker = new Marker({ element: markerElement, anchor: "bottom" })
          .setLngLat([lon, lat])
          .addTo(map);

        sharedMarker = marker as MaplibreMarker;
        sharedMarkerElement = markerElement;
        sharedMarkerMap = map;
      });
    },
    [map, clearMarker],
  );

  useEffect(() => {
    if (!selectedPlace) {
      clearMarker();
      return;
    }

    showMarker(selectedPlace.latitude, selectedPlace.longitude, selectedPlace.name);
  }, [clearMarker, selectedPlace, showMarker]);

  return { showMarker, clearMarker };
}
