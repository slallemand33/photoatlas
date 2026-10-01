"use client";

import type { GeoJSONSource, Map as MaplibreMap, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";

import { useMap } from "@/components/map";
import { useLocationSelection } from "@/features/location-selection";
import { usePlaceStore } from "@/features/place-details/store";

import { NEARBY_SPOTS_LAYER_ID, NEARBY_SPOTS_SOURCE_ID } from "../constants";
import { useNearbySpots } from "../hooks";
import { nearbySpotsDefaultRadiusKm, useNearbySpotsStore } from "../store";
import { toNearbySpotsGeoJson } from "../utils/geojson";
import { getRenderableNearbySpots, toSearchResult } from "../utils/selection";

const MAX_MAP_SPOTS = 10;

function removeNearbySpots(map: MaplibreMap): void {
  if (map.getLayer(NEARBY_SPOTS_LAYER_ID)) map.removeLayer(NEARBY_SPOTS_LAYER_ID);
  if (map.getSource(NEARBY_SPOTS_SOURCE_ID)) map.removeSource(NEARBY_SPOTS_SOURCE_ID);
}

export function NearbySpotsLayer() {
  const map = useMap();
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const contextPlaceId = useNearbySpotsStore((state) => state.contextPlaceId);
  const storedRadiusKm = useNearbySpotsStore((state) => state.radiusKm);
  const syncPlace = useNearbySpotsStore((state) => state.syncPlace);
  const { selectSearchResult } = useLocationSelection();
  const listenersBound = useRef(false);

  const radiusKm =
    selectedPlace && contextPlaceId === selectedPlace.id
      ? storedRadiusKm
      : nearbySpotsDefaultRadiusKm;

  useEffect(() => {
    if (selectedPlace) syncPlace(selectedPlace.id);
  }, [selectedPlace, syncPlace]);

  const query = useNearbySpots({
    latitude: selectedPlace?.latitude ?? 0,
    longitude: selectedPlace?.longitude ?? 0,
    radiusKm,
    limit: 20,
    enabled: Boolean(selectedPlace),
  });

  const spots = useMemo(() => {
    if (!selectedPlace) return [];
    return getRenderableNearbySpots(selectedPlace, query.data?.spots ?? []).slice(0, MAX_MAP_SPOTS);
  }, [query.data?.spots, selectedPlace]);

  const geoJson = useMemo(() => toNearbySpotsGeoJson(spots), [spots]);

  useEffect(() => {
    if (!map) return;

    const handleClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const featureId = feature?.properties?.id;
      if (typeof featureId !== "string") return;

      const spot = spots.find((entry) => entry.id === featureId);
      if (!spot) return;

      selectSearchResult(toSearchResult(spot));
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const ensureNearbySpots = () => {
      if (!map.isStyleLoaded()) return;

      if (!selectedPlace || !query.data) {
        removeNearbySpots(map);
        listenersBound.current = false;
        return;
      }

      const matchesSelection =
        query.data.center.latitude === selectedPlace.latitude &&
        query.data.center.longitude === selectedPlace.longitude &&
        query.data.radiusKm === radiusKm;

      if (!matchesSelection) {
        removeNearbySpots(map);
        listenersBound.current = false;
        return;
      }

      const source = map.getSource(NEARBY_SPOTS_SOURCE_ID) as GeoJSONSource | undefined;
      if (source) {
        source.setData(geoJson);
      } else {
        map.addSource(NEARBY_SPOTS_SOURCE_ID, { type: "geojson", data: geoJson });
      }

      if (!map.getLayer(NEARBY_SPOTS_LAYER_ID)) {
        map.addLayer({
          id: NEARBY_SPOTS_LAYER_ID,
          type: "circle",
          source: NEARBY_SPOTS_SOURCE_ID,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4.5, 8, 5.5, 11, 6.5, 14, 7.5],
            "circle-color": "#f59e0b",
            "circle-stroke-color": "#3f2a00",
            "circle-stroke-width": 1,
            "circle-opacity": 0.95,
          },
        });
      }

      if (!listenersBound.current) {
        map.on("click", NEARBY_SPOTS_LAYER_ID, handleClick);
        map.on("mouseenter", NEARBY_SPOTS_LAYER_ID, handleMouseEnter);
        map.on("mouseleave", NEARBY_SPOTS_LAYER_ID, handleMouseLeave);
        listenersBound.current = true;
      }
    };

    ensureNearbySpots();
    map.on("styledata", ensureNearbySpots);

    return () => {
      map.off("styledata", ensureNearbySpots);
      if (listenersBound.current) {
        map.off("click", NEARBY_SPOTS_LAYER_ID, handleClick);
        map.off("mouseenter", NEARBY_SPOTS_LAYER_ID, handleMouseEnter);
        map.off("mouseleave", NEARBY_SPOTS_LAYER_ID, handleMouseLeave);
        listenersBound.current = false;
      }
      map.getCanvas().style.cursor = "";
    };
  }, [geoJson, map, query.data, radiusKm, selectedPlace, selectSearchResult, spots]);

  useEffect(
    () => () => {
      if (!map) return;
      removeNearbySpots(map);
    },
    [map],
  );

  return null;
}