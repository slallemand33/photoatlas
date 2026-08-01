"use client";

import { useEffect, useRef } from "react";

import { useBasemapStore } from "@/features/basemaps/store/useBasemapStore";
import { useLayerStore } from "@/features/layers/store/useLayerStore";
import { usePlaceStore } from "@/features/place-details/store/usePlaceStore";

import { astronomyService } from "../../services";
import { useAstronomyStore } from "../../store";
import { useMilkyWayStore } from "../store";

export function useAstroModeLifecycle() {
  const isActive = useLayerStore((state) => state.layers["milky-way"]?.visible ?? false);
  const currentBasemapId = useBasemapStore((state) => state.currentId);
  const setCurrentBasemapId = useBasemapStore((state) => state.setCurrentId);
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const initializeWindow = useMilkyWayStore((state) => state.initializeWindow);
  const setPreviousBasemapId = useMilkyWayStore((state) => state.setPreviousBasemapId);
  const reset = useMilkyWayStore((state) => state.reset);
  const setAstronomyDate = useAstronomyStore((state) => state.setSelectedDate);
  const wasActive = useRef(false);
  const initializedPlaceId = useRef<string | null>(null);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      setPreviousBasemapId(currentBasemapId === "dark" ? null : currentBasemapId);
      if (currentBasemapId !== "dark") setCurrentBasemapId("dark");
    }

    if (isActive && selectedPlace && initializedPlaceId.current !== selectedPlace.id) {
      const now = new Date();
      const snapshot = astronomyService.calculate(selectedPlace, now);
      initializeWindow(now, snapshot.sun.astronomicalNight);
      setAstronomyDate(now);
      initializedPlaceId.current = selectedPlace.id;
    }

    if (!isActive && wasActive.current) {
      const previousBasemapId = useMilkyWayStore.getState().previousBasemapId;
      if (previousBasemapId) setCurrentBasemapId(previousBasemapId);
      setPreviousBasemapId(null);
      setAstronomyDate(null);
      reset();
      initializedPlaceId.current = null;
    }

    if (isActive && currentBasemapId !== "dark") setCurrentBasemapId("dark");
    wasActive.current = isActive;
  }, [
    currentBasemapId,
    initializeWindow,
    isActive,
    reset,
    selectedPlace,
    setAstronomyDate,
    setCurrentBasemapId,
    setPreviousBasemapId,
  ]);

  return { isActive, selectedPlace };
}
