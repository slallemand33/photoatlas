"use client";

import { useCallback } from "react";

import { useMap } from "@/components/map";
import { usePlaceStore } from "@/features/place-details/store";
import { useSearchMarker } from "@/features/search/hooks";
import type { SearchResult } from "@/features/search/types";
import { getZoomForResult } from "@/features/search/utils/zoom";
import { useSearchStore } from "@/stores/useSearchStore";

import { reverseGeocodingService } from "../services";
import type { LocationCoordinates, LocationSelectionOptions } from "../types";
import { createSelectedPoint, SELECTED_POINT_NAME } from "../utils";

function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export function useLocationSelection() {
  const map = useMap();
  const { setSelectedResult, addToRecent } = useSearchStore();
  const selectPlace = usePlaceStore((state) => state.selectPlace);
  const { showMarker, clearMarker } = useSearchMarker();

  const focusMap = useCallback(
    (place: SearchResult, zoom?: number) => {
      if (!map) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          map.resize();
          map.flyTo({
            center: [place.longitude, place.latitude],
            zoom: zoom ?? getZoomForResult(place),
            bearing: 0,
            pitch: 0,
            duration: 1200,
            curve: 1.35,
            essential: true,
          });
        });
      });
    },
    [map],
  );

  const selectLocation = useCallback(
    (place: SearchResult, options: LocationSelectionOptions) => {
      setSelectedResult(place);
      if (options.addToRecent !== false) addToRecent(place);
      selectPlace(place);
      showMarker(place.latitude, place.longitude, place.name);
      if (options.animateMap !== false) focusMap(place, options.zoom);
      return place;
    },
    [addToRecent, focusMap, selectPlace, setSelectedResult, showMarker],
  );

  const selectSearchResult = useCallback(
    (place: SearchResult) => selectLocation(place, { source: "search" }),
    [selectLocation],
  );

  const selectMapPoint = useCallback(
    async ({ latitude, longitude }: LocationCoordinates) => {
      const normalizedLongitude = normalizeLongitude(longitude);
      const fallback = createSelectedPoint(latitude, normalizedLongitude);

      selectLocation(fallback, {
        source: "map",
        animateMap: false,
        addToRecent: false,
      });
      showMarker(latitude, normalizedLongitude, SELECTED_POINT_NAME);

      try {
        const resolvedPlace = await reverseGeocodingService.reverseGeocode({
          latitude,
          longitude: normalizedLongitude,
        });
        if (!resolvedPlace) return fallback;

        return selectLocation(resolvedPlace, {
          source: "map",
          animateMap: false,
        });
      } catch (error) {
        console.error("[LocationSelection] Reverse geocoding failed:", error);
        return fallback;
      }
    },
    [selectLocation, showMarker],
  );

  return {
    selectSearchResult,
    selectMapPoint,
    clearSelectionMarker: clearMarker,
  };
}
