"use client";

import { Popup } from "maplibre-gl";
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

function removeNearbySpots(map: MaplibreMap): void {
  if (map.getLayer(NEARBY_SPOTS_LAYER_ID)) map.removeLayer(NEARBY_SPOTS_LAYER_ID);
  if (map.getSource(NEARBY_SPOTS_SOURCE_ID)) map.removeSource(NEARBY_SPOTS_SOURCE_ID);
}

function buildHoverPopupContent(name: string, distanceKm: number): HTMLElement {
  const content = document.createElement("div");
  content.className =
    "border-border/70 bg-card/95 text-foreground pointer-events-none rounded-lg border px-3 py-2 text-left shadow-xl backdrop-blur-sm";

  const title = document.createElement("div");
  title.className = "text-sm font-semibold leading-tight text-foreground";
  title.textContent = name;

  const distance = document.createElement("div");
  distance.className = "text-muted-foreground text-xs leading-tight";
  distance.textContent = `${distanceKm.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;

  content.append(title, distance);
  return content;
}

export function NearbySpotsLayer() {
  const map = useMap();
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const contextPlaceId = useNearbySpotsStore((state) => state.contextPlaceId);
  const storedRadiusKm = useNearbySpotsStore((state) => state.radiusKm);
  const syncPlace = useNearbySpotsStore((state) => state.syncPlace);
  const { selectSearchResult } = useLocationSelection();
  const listenersBound = useRef(false);
  const hoverFeatureId = useRef<string | null>(null);
  const hoverPopup = useRef<Popup | null>(null);
  const canHover =
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
    return getRenderableNearbySpots(selectedPlace, query.data?.spots ?? []);
  }, [query.data?.spots, selectedPlace]);

  const geoJson = useMemo(() => toNearbySpotsGeoJson(spots), [spots]);

  useEffect(() => {
    if (!map) return;

    const clearHoverState = () => {
      if (hoverFeatureId.current) {
        map.setFeatureState(
          { source: NEARBY_SPOTS_SOURCE_ID, id: hoverFeatureId.current },
          { hover: false },
        );
        hoverFeatureId.current = null;
      }

      hoverPopup.current?.remove();
      hoverPopup.current = null;
      map.getCanvas().style.cursor = "";
    };

    const bindLayerListeners = (
      handleClick: (event: MapLayerMouseEvent) => void,
      handleMouseEnter: (event: MapLayerMouseEvent) => void,
      handleMouseMove: (event: MapLayerMouseEvent) => void,
      handleMouseLeave: () => void,
    ) => {
      if (listenersBound.current || !map.getLayer(NEARBY_SPOTS_LAYER_ID)) return;

      map.on("click", NEARBY_SPOTS_LAYER_ID, handleClick);
      if (canHover) {
        map.on("mouseenter", NEARBY_SPOTS_LAYER_ID, handleMouseEnter);
        map.on("mousemove", NEARBY_SPOTS_LAYER_ID, handleMouseMove);
        map.on("mouseleave", NEARBY_SPOTS_LAYER_ID, handleMouseLeave);
      }
      listenersBound.current = true;
    };

    const unbindLayerListeners = (
      handleClick: (event: MapLayerMouseEvent) => void,
      handleMouseEnter: (event: MapLayerMouseEvent) => void,
      handleMouseMove: (event: MapLayerMouseEvent) => void,
      handleMouseLeave: () => void,
    ) => {
      if (!listenersBound.current) return;

      map.off("click", NEARBY_SPOTS_LAYER_ID, handleClick);
      if (canHover) {
        map.off("mouseenter", NEARBY_SPOTS_LAYER_ID, handleMouseEnter);
        map.off("mousemove", NEARBY_SPOTS_LAYER_ID, handleMouseMove);
        map.off("mouseleave", NEARBY_SPOTS_LAYER_ID, handleMouseLeave);
      }
      listenersBound.current = false;
      clearHoverState();
    };

    const handleClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const featureId = feature?.properties?.id;
      if (typeof featureId !== "string") return;

      const spot = spots.find((entry) => entry.id === featureId);
      if (!spot) return;

      clearHoverState();
      selectSearchResult(toSearchResult(spot));
    };

    const applyHoverFeature = (feature: NonNullable<MapLayerMouseEvent["features"]>[number]) => {
      const featureId = feature?.properties?.id;
      const featureName = feature?.properties?.name;
      const distanceKm = feature?.properties?.distanceKm;
      const coordinates = feature?.geometry?.coordinates;

      if (
        typeof featureId !== "string" ||
        typeof featureName !== "string" ||
        typeof distanceKm !== "number" ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
      ) {
        return;
      }

      if (hoverFeatureId.current && hoverFeatureId.current !== featureId) {
        map.setFeatureState(
          { source: NEARBY_SPOTS_SOURCE_ID, id: hoverFeatureId.current },
          { hover: false },
        );
      }

      hoverFeatureId.current = featureId;
      map.setFeatureState(
        { source: NEARBY_SPOTS_SOURCE_ID, id: featureId },
        { hover: true },
      );

      hoverPopup.current?.remove();
      hoverPopup.current = new Popup({
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        offset: 12,
        className: "photoatlas-nearby-spots-popup",
      })
        .setLngLat([coordinates[0], coordinates[1]])
        .setDOMContent(buildHoverPopupContent(featureName, distanceKm))
        .addTo(map);

      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseEnter = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (feature) applyHoverFeature(feature);
    };

    const handleMouseMove = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const featureId = feature.properties?.id;
      if (typeof featureId !== "string") return;

      if (hoverFeatureId.current === featureId) return;

      applyHoverFeature(feature);
    };

    const handleMouseLeave = () => {
      clearHoverState();
    };

    const ensureNearbySpots = () => {
      if (!map.isStyleLoaded()) return;

      if (!selectedPlace || !query.data) {
        unbindLayerListeners(handleClick, handleMouseEnter, handleMouseMove, handleMouseLeave);
        removeNearbySpots(map);
        return;
      }

      const matchesSelection =
        query.data.center.latitude === selectedPlace.latitude &&
        query.data.center.longitude === selectedPlace.longitude &&
        query.data.radiusKm === radiusKm;

      if (!matchesSelection) {
        unbindLayerListeners(handleClick, handleMouseEnter, handleMouseMove, handleMouseLeave);
        removeNearbySpots(map);
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
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              ["case", ["boolean", ["feature-state", "hover"], false], 5.1, 4.5],
              8,
              ["case", ["boolean", ["feature-state", "hover"], false], 6.2, 5.5],
              11,
              ["case", ["boolean", ["feature-state", "hover"], false], 7.2, 6.5],
              14,
              ["case", ["boolean", ["feature-state", "hover"], false], 8.2, 7.5],
            ],
            "circle-color": "#5b6b84",
            "circle-stroke-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#d8e0ea",
              "#1f2a37",
            ],
            "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 1.5, 1],
            "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.95],
          },
        });
      }

      bindLayerListeners(handleClick, handleMouseEnter, handleMouseMove, handleMouseLeave);
    };

    ensureNearbySpots();
    map.on("styledata", ensureNearbySpots);

    return () => {
      map.off("styledata", ensureNearbySpots);
      unbindLayerListeners(handleClick, handleMouseEnter, handleMouseMove, handleMouseLeave);
    };
  }, [canHover, geoJson, map, query.data, radiusKm, selectedPlace, selectSearchResult, spots]);

  useEffect(
    () => () => {
      if (!map) return;
      hoverPopup.current?.remove();
      hoverPopup.current = null;
      hoverFeatureId.current = null;
      removeNearbySpots(map);
    },
    [map],
  );

  return null;
}