"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { lightningService } from "../services";
import { useLightningStore } from "../store";
import type { LightningBounds } from "../types";

const REFRESH_INTERVAL_MS = 60_000;

export function useLightningSnapshot(bounds: LightningBounds | null, enabled: boolean) {
  const setSnapshot = useLightningStore((state) => state.setSnapshot);
  const clearSnapshot = useLightningStore((state) => state.clearSnapshot);
  const boundsKey = bounds
    ? [bounds.west, bounds.south, bounds.east, bounds.north].map((value) => value.toFixed(2))
    : [];
  const query = useQuery({
    queryKey: ["lightning", "visible-strikes", ...boundsKey],
    queryFn: ({ signal }) => {
      if (!bounds) throw new Error("Zone cartographique indisponible");
      return lightningService.getStrikes(bounds, signal);
    },
    enabled: enabled && Boolean(bounds),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchInterval: enabled ? REFRESH_INTERVAL_MS : false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) setSnapshot(query.data);
  }, [query.data, setSnapshot]);

  useEffect(() => {
    if (!enabled) clearSnapshot();
  }, [clearSnapshot, enabled]);

  return query;
}
