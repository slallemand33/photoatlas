import type { NearbyWebcamsResult, Webcam } from "../types";

interface ApiErrorPayload {
  error?: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | ApiErrorPayload;
  if (!response.ok) {
    throw new Error((payload as ApiErrorPayload).error ?? "Le service webcams est indisponible");
  }
  return payload as T;
}

export const webcamApi = {
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    signal?: AbortSignal,
  ): Promise<NearbyWebcamsResult> {
    const parameters = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      radius: String(radiusKm),
    });
    const response = await fetch(`/api/webcams?${parameters.toString()}`, { signal });
    return readResponse<NearbyWebcamsResult>(response);
  },

  async findById(
    id: string,
    latitude: number,
    longitude: number,
    signal?: AbortSignal,
  ): Promise<Webcam> {
    const parameters = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
    const response = await fetch(
      `/api/webcams/${encodeURIComponent(id)}?${parameters.toString()}`,
      {
        signal,
        cache: "no-store",
      },
    );
    return readResponse<Webcam>(response);
  },
};
