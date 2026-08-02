"use client";

import { useQuery } from "@tanstack/react-query";

import { webcamApi } from "../services";
import type { WebcamReferenceLocation } from "../types";
import { WEBCAM_IMAGE_REFRESH_MS } from "../utils";

export function useWebcamDetail(id: string | null, location: WebcamReferenceLocation) {
  return useQuery({
    queryKey: ["webcams", "detail", id, location.latitude, location.longitude],
    queryFn: ({ signal }) => webcamApi.findById(id!, location.latitude, location.longitude, signal),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: WEBCAM_IMAGE_REFRESH_MS,
    retry: 1,
  });
}
