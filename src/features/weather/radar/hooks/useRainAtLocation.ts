"use client";

import { useQuery } from "@tanstack/react-query";

import { radarService } from "../services";
import { useRadarStore } from "../store";
import type { RadarLocation } from "../types";

export function useRainAtLocation(location: RadarLocation, enabled: boolean) {
  const frame = useRadarStore((state) => state.timeline?.frames[state.currentIndex]);

  return useQuery({
    queryKey: ["rainviewer", "rain-at-location", frame?.id, location.latitude, location.longitude],
    queryFn: ({ signal }) => {
      if (!frame) throw new Error("Aucune image radar sélectionnée");
      return radarService.getRainAtLocation(frame, location, signal);
    },
    enabled: enabled && Boolean(frame),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
