import { useQuery } from "@tanstack/react-query";

import { lightPollutionDataSource } from "../data-sources/lightPollutionDataSource";
import type { LightPollutionLocation } from "../types";

export function useLightPollutionEstimate(location: LightPollutionLocation, enabled: boolean) {
  return useQuery({
    queryKey: [
      "light-pollution-estimate",
      location.latitude.toFixed(5),
      location.longitude.toFixed(5),
    ],
    queryFn: ({ signal }) => lightPollutionDataSource.estimateAt(location, signal),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
