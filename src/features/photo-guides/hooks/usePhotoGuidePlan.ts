"use client";

import { useMemo } from "react";

import type { SearchResult } from "@/features/search/types";
import { useTimelineStore } from "@/features/timeline";

import { guideEngine } from "../services";
import { usePhotoGuidesStore } from "../store";

export function usePhotoGuidePlan(place: SearchResult | null) {
  const selectedTime = useTimelineStore((state) => state.selectedTime);
  const timeline = useTimelineStore((state) => state.result);
  const compositionPoint = usePhotoGuidesStore((state) => state.compositionPoint);
  return useMemo(() => {
    if (!place || !selectedTime || !timeline) return null;
    const location = compositionPoint ?? place;
    return guideEngine.calculate(
      location,
      new Date(selectedTime),
      new Date(timeline.dayStart),
      new Date(timeline.dayEnd),
    );
  }, [compositionPoint, place, selectedTime, timeline]);
}
