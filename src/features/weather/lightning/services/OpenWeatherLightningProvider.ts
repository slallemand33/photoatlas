import type {
  ILightningProvider,
  LightningBounds,
  LightningSnapshot,
  LightningStrike,
} from "../types";
import { getDistanceKm } from "../utils";

interface OpenWeatherLightningResponse {
  updatedAt: number;
  lightnings: Array<{
    id: string;
    datetime: string;
    lat: number;
    lon: number;
    quality?: string;
    error?: number;
  }>;
}

function getRequestArea(bounds: LightningBounds): {
  latitude: number;
  longitude: number;
  radius: number;
} {
  const longitudeSpan =
    bounds.east >= bounds.west ? bounds.east - bounds.west : bounds.east + 360 - bounds.west;
  const latitude = (bounds.south + bounds.north) / 2;
  const rawLongitude = bounds.west + longitudeSpan / 2;
  const longitude = ((((rawLongitude + 180) % 360) + 360) % 360) - 180;
  const cornerDistance = getDistanceKm(
    { latitude, longitude },
    { latitude: bounds.north, longitude: bounds.east },
  );

  return {
    latitude,
    longitude,
    radius: Math.min(50, Math.max(5, Math.ceil(cornerDistance))),
  };
}

function normalizeStrike(
  strike: OpenWeatherLightningResponse["lightnings"][number],
): LightningStrike {
  return {
    id: strike.id,
    latitude: strike.lat,
    longitude: strike.lon,
    occurredAt: new Date(strike.datetime).getTime(),
    intensity: "medium",
  };
}

function isInsideBounds(strike: LightningStrike, bounds: LightningBounds): boolean {
  const insideLatitude = strike.latitude >= bounds.south && strike.latitude <= bounds.north;
  const insideLongitude =
    bounds.east >= bounds.west
      ? strike.longitude >= bounds.west && strike.longitude <= bounds.east
      : strike.longitude >= bounds.west || strike.longitude <= bounds.east;
  return insideLatitude && insideLongitude;
}

export class OpenWeatherLightningProvider implements ILightningProvider {
  readonly name = "OpenWeather Lightning";
  readonly simulated = false;

  async getStrikes(bounds: LightningBounds, signal?: AbortSignal): Promise<LightningSnapshot> {
    const area = getRequestArea(bounds);
    const parameters = new URLSearchParams({
      lat: String(area.latitude),
      lon: String(area.longitude),
      radius: String(area.radius),
    });
    const response = await fetch(`/api/weather/lightning?${parameters}`, { signal });
    const payload = (await response.json()) as OpenWeatherLightningResponse & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "OpenWeather Lightning est indisponible");
    }

    const strikes = payload.lightnings
      .map(normalizeStrike)
      .filter((strike) => isInsideBounds(strike, bounds));

    return {
      strikes,
      updatedAt: payload.updatedAt,
      provider: this.name,
      simulated: this.simulated,
      bounds,
    };
  }
}
