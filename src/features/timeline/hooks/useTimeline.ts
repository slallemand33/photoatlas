"use client";

import { useEffect, useMemo } from "react";

import { useAstronomyStore } from "@/features/astronomy/store";
import type { SearchResult } from "@/features/search/types";

import { timelineEngine } from "../services";
import { useTimelineStore } from "../store";

export function useTimeline(place: SearchResult | null) {
  const selectedTime = useTimelineStore((state) => state.selectedTime);
  const initialize = useTimelineStore((state) => state.initialize);
  const setResult = useTimelineStore((state) => state.setResult);
  const setAstronomyDate = useAstronomyStore((state) => state.setSelectedDate);
  useEffect(() => {
    if (place) initialize(place.id, new Date());
  }, [initialize, place]);
  const dayAnchor = useMemo(() => {
    if (!selectedTime) return null;
    const date = new Date(selectedTime);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, [selectedTime]);
  const result = useMemo(
    () => (place && dayAnchor ? timelineEngine.calculate(place, new Date(dayAnchor)) : null),
    [dayAnchor, place],
  );
  useEffect(() => {
    if (result) setResult(result);
  }, [result, setResult]);
  useEffect(() => {
    if (selectedTime) setAstronomyDate(new Date(selectedTime));
  }, [selectedTime, setAstronomyDate]);
  return { result, selectedTime };
}
