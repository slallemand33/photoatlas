"use client";

import { useEffect, useMemo } from "react";

import { useAstronomy } from "@/features/astronomy/hooks";
import { useLightPollutionEstimate } from "@/features/layers/light-pollution";
import type { SearchResult } from "@/features/search/types/search.types";
import { usePhotoWeather } from "@/features/weather";
import { useLightningActivity, useLightningStore } from "@/features/weather/lightning";
import { useRadarStore, useRainAtLocation } from "@/features/weather/radar";

import { photoScoreEngine } from "../services";
import { usePhotoScoreStore } from "../store";

export function usePhotoScore(place: SearchResult) {
  const weatherQuery = usePhotoWeather(place);
  const astronomyQuery = useAstronomy(place);
  const lightPollutionQuery = useLightPollutionEstimate(place, true);
  const radarFrame = useRadarStore((state) => state.timeline?.frames[state.currentIndex]);
  const radarQuery = useRainAtLocation(place, Boolean(radarFrame));
  const lightningSnapshot = useLightningStore((state) => state.snapshot);
  const lightningActivity = useLightningActivity(place);
  const setLatestResult = usePhotoScoreStore((state) => state.setLatestResult);

  const result = useMemo(() => {
    if (!weatherQuery.data || !astronomyQuery.data) return null;
    return photoScoreEngine.calculate({
      calculatedAt: astronomyQuery.data.calculatedAt,
      weather: weatherQuery.data,
      astronomy: astronomyQuery.data,
      lightPollution: lightPollutionQuery.data,
      radar: radarQuery.data,
      lightning: lightningSnapshot ? lightningActivity : undefined,
    });
  }, [
    astronomyQuery.data,
    lightPollutionQuery.data,
    lightningActivity,
    lightningSnapshot,
    radarQuery.data,
    weatherQuery.data,
  ]);

  useEffect(() => {
    setLatestResult(result);
    return () => setLatestResult(null);
  }, [result, setLatestResult]);

  return {
    data: result,
    isLoading: weatherQuery.isLoading || astronomyQuery.isLoading,
    isFetching:
      weatherQuery.isFetching || astronomyQuery.isFetching || lightPollutionQuery.isFetching,
    isError: weatherQuery.isError || astronomyQuery.isError,
  };
}
