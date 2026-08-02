"use client";

import { useMemo } from "react";

import type { SearchResult } from "@/features/search/types";

import { guideEngine } from "../services";
import { usePhotoGuidesStore } from "../store";

export function usePhotoGuidePlan(place: SearchResult | null) {
  const selectedTime = usePhotoGuidesStore((state) => state.selectedTime);
  const windowStart = usePhotoGuidesStore((state) => state.windowStart);
  const windowEnd = usePhotoGuidesStore((state) => state.windowEnd);
  const compositionPoint = usePhotoGuidesStore((state) => state.compositionPoint);
  return useMemo(() => {
    if (!place || !selectedTime || !windowStart || !windowEnd) return null;
    const location = compositionPoint ?? place;
    return guideEngine.calculate(
      location,
      new Date(selectedTime),
      new Date(windowStart),
      new Date(windowEnd),
    );
  }, [compositionPoint, place, selectedTime, windowEnd, windowStart]);
}
