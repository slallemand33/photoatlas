"use client";

import { useMemo } from "react";

import type { AstronomyLocation } from "../../types";
import { milkyWayPlanningService } from "../services";
import { useMilkyWayStore } from "../store";
import { getProjectionRadiusKm, projectMilkyWayPlan } from "../utils";

export function useMilkyWayPlan(
  location: AstronomyLocation | null,
  zoom: number,
  enabled: boolean,
) {
  const windowStart = useMilkyWayStore((state) => state.windowStart);
  const windowEnd = useMilkyWayStore((state) => state.windowEnd);
  const selectedTime = useMilkyWayStore((state) => state.selectedTime);

  const trajectory = useMemo(() => {
    if (!enabled || !location || !windowStart || !windowEnd) return null;
    return milkyWayPlanningService.calculateTrajectory({
      location,
      start: new Date(windowStart),
      end: new Date(windowEnd),
    });
  }, [enabled, location, windowEnd, windowStart]);

  const currentSky = useMemo(() => {
    if (!enabled || !location || !selectedTime) return null;
    return milkyWayPlanningService.calculatePosition(location, new Date(selectedTime));
  }, [enabled, location, selectedTime]);

  return useMemo(() => {
    if (!location || !selectedTime || !trajectory || !currentSky) return null;
    return projectMilkyWayPlan(
      location,
      selectedTime,
      currentSky,
      trajectory,
      getProjectionRadiusKm(zoom),
    );
  }, [currentSky, location, selectedTime, trajectory, zoom]);
}
