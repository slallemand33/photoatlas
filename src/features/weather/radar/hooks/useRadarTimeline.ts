"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { radarService } from "../services";
import { useRadarStore } from "../store";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useRadarTimeline(enabled: boolean) {
  const setTimeline = useRadarStore((state) => state.setTimeline);
  const setPlaying = useRadarStore((state) => state.setPlaying);
  const query = useQuery({
    queryKey: ["rainviewer", "radar-timeline"],
    queryFn: ({ signal }) => radarService.getTimeline(signal),
    enabled,
    staleTime: REFRESH_INTERVAL_MS,
    gcTime: 30 * 60 * 1000,
    refetchInterval: enabled ? REFRESH_INTERVAL_MS : false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) setTimeline(query.data);
  }, [query.data, setTimeline]);

  useEffect(() => {
    if (!enabled) setPlaying(false);
  }, [enabled, setPlaying]);

  return query;
}
