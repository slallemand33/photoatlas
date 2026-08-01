import "server-only";

const OPENWEATHER_LIGHTNING_URL = "https://demo.openweathermap.org/lightning/1.0/data";
const OBSERVATION_WINDOW_MS = 2 * 60 * 60 * 1000;

export interface OpenWeatherLightningEvent {
  id: string;
  datetime: string;
  lat: number;
  lon: number;
  quality?: string;
  error?: number;
}

interface OpenWeatherLightningPayload {
  lightnings?: OpenWeatherLightningEvent[];
  code?: string | number;
  message?: string;
}

export class OpenWeatherLightningServerService {
  async getRecentStrikes(
    latitude: number,
    longitude: number,
    radius: number,
    signal?: AbortSignal,
  ): Promise<OpenWeatherLightningEvent[]> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("Clé OpenWeather absente du serveur");

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - OBSERVATION_WINDOW_MS);
    const parameters = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      radius: String(radius),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      apikey: apiKey,
    });
    const response = await fetch(`${OPENWEATHER_LIGHTNING_URL}?${parameters}`, {
      signal,
      cache: "no-store",
    });
    const payload = (await response.json()) as OpenWeatherLightningPayload;

    if (!response.ok) {
      throw new Error(payload.message ?? `OpenWeather a répondu ${response.status}`);
    }

    return payload.lightnings ?? [];
  }
}

export const openWeatherLightningServerService = new OpenWeatherLightningServerService();
