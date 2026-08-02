import { WEATHER_CACHE_TTL_MS } from "../store";
import type { PhotoWeatherSnapshot, WeatherLocation, WeatherProvider } from "../types";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CLOUD_VARIABLES = [
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "precipitation",
  "rain",
  "wind_speed_10m",
  "visibility",
  "weather_code",
] as const;

interface OpenMeteoCurrentClouds {
  time: string;
  cloud_cover: number;
  cloud_cover_low: number;
  cloud_cover_mid: number;
  cloud_cover_high: number;
  precipitation: number;
  rain: number;
  wind_speed_10m: number;
  visibility: number;
  weather_code: number;
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  current: OpenMeteoCurrentClouds;
}

interface CacheEntry {
  expiresAt: number;
  data: PhotoWeatherSnapshot[];
}

function clampPercentage(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function getCacheKey(locations: WeatherLocation[]): string {
  return locations
    .map(({ latitude, longitude }) => `${latitude.toFixed(3)},${longitude.toFixed(3)}`)
    .join(";");
}

class OpenMeteoWeatherProvider implements WeatherProvider {
  private readonly cache = new Map<string, CacheEntry>();

  async getCloudCover(
    locations: WeatherLocation[],
    signal?: AbortSignal,
  ): Promise<PhotoWeatherSnapshot[]> {
    return this.getPhotoConditions(locations, signal);
  }

  async getPhotoConditions(
    locations: WeatherLocation[],
    signal?: AbortSignal,
  ): Promise<PhotoWeatherSnapshot[]> {
    if (locations.length === 0) return [];

    const cacheKey = getCacheKey(locations);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const url = new URL(OPEN_METEO_FORECAST_URL);
    url.searchParams.set("latitude", locations.map(({ latitude }) => latitude).join(","));
    url.searchParams.set("longitude", locations.map(({ longitude }) => longitude).join(","));
    url.searchParams.set("current", CLOUD_VARIABLES.join(","));
    url.searchParams.set("forecast_days", "1");

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Open-Meteo a répondu ${response.status}`);

    const payload = (await response.json()) as
      OpenMeteoForecastResponse | OpenMeteoForecastResponse[];
    const responses = Array.isArray(payload) ? payload : [payload];
    const data = responses.map((item, index) => {
      const requestedLocation = locations[index] ?? {
        latitude: item.latitude,
        longitude: item.longitude,
      };

      return {
        ...requestedLocation,
        observedAt: item.current.time,
        total: clampPercentage(item.current.cloud_cover),
        low: clampPercentage(item.current.cloud_cover_low),
        mid: clampPercentage(item.current.cloud_cover_mid),
        high: clampPercentage(item.current.cloud_cover_high),
        precipitationMm: Math.max(0, item.current.precipitation),
        rainMm: Math.max(0, item.current.rain),
        windSpeedKmh: Math.max(0, item.current.wind_speed_10m),
        visibilityMeters: Math.max(0, item.current.visibility),
        weatherCode: item.current.weather_code,
      };
    });

    this.cache.set(cacheKey, {
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
      data,
    });

    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const weatherProvider: WeatherProvider & { clearCache(): void } =
  new OpenMeteoWeatherProvider();
