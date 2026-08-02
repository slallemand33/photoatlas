"use client";

import { useQuery } from "@tanstack/react-query";

import { webcamApi } from "../services";
import type { WebcamReferenceLocation } from "../types";
import { DEFAULT_WEBCAM_RADIUS_KM, WEBCAM_IMAGE_REFRESH_MS } from "../utils";

export function useNearbyWebcams(
  location: WebcamReferenceLocation | null,
  radiusKm = DEFAULT_WEBCAM_RADIUS_KM,
) {
  return useQuery({
    queryKey: ["webcams", "nearby", location?.latitude, location?.longitude, radiusKm],
    queryFn: ({ signal }) =>
      webcamApi.findNearby(location!.latitude, location!.longitude, radiusKm, signal),
    enabled: Boolean(location),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: WEBCAM_IMAGE_REFRESH_MS,
    retry: 1,
  });
}
