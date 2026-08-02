import type { WeatherLocation } from "../types";

import { usePhotoWeather } from "./usePhotoWeather";

export function useCloudCover(location: WeatherLocation, enabled = true) {
  return usePhotoWeather(location, enabled);
}
