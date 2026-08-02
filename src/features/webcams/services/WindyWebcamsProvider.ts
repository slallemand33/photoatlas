import "server-only";

import type { IWebcamsProvider, NearbyWebcamsOptions, Webcam } from "../types";

const WINDY_WEBCAMS_API = "https://api.windy.com/webcams/api/v3";
const INCLUDED_PARTS = "categories,images,location,player,urls";

interface WindyWebcamPayload {
  webcamId: number;
  status?: "active" | "inactive";
  title?: string;
  lastUpdatedOn?: string;
  categories?: Array<{ name?: string }>;
  images?: {
    current?: Record<string, string>;
    daylight?: Record<string, string>;
  };
  location?: {
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  player?: Record<string, string>;
  urls?: {
    detail?: string;
  };
}

interface WindyWebcamsResponse {
  total?: number;
  webcams?: WindyWebcamPayload[];
}

export class WindyWebcamsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "WindyWebcamsError";
  }
}

function firstImage(
  images: Record<string, string> | undefined,
  preferredSizes: string[],
): string | null {
  if (!images) return null;
  for (const size of preferredSizes) {
    const value = images[size];
    if (typeof value === "string" && value) return value;
  }
  return Object.values(images).find((value) => typeof value === "string" && value) ?? null;
}

function toWebcam(payload: WindyWebcamPayload): Webcam {
  const currentImages = payload.images?.current ?? payload.images?.daylight;
  const sourceUrl =
    payload.urls?.detail ?? `https://www.windy.com/webcams/${String(payload.webcamId)}`;

  return {
    id: String(payload.webcamId),
    title: payload.title?.trim() || "Webcam sans nom",
    status: payload.status ?? "active",
    location: {
      latitude: payload.location?.latitude ?? 0,
      longitude: payload.location?.longitude ?? 0,
      city: payload.location?.city ?? "",
      region: payload.location?.region ?? "",
      country: payload.location?.country ?? "",
    },
    distanceKm: null,
    thumbnailUrl: firstImage(currentImages, ["thumbnail", "icon", "preview"]),
    imageUrl: firstImage(currentImages, ["preview", "full", "thumbnail", "icon"]),
    source: "Windy Webcams",
    sourceUrl,
    playerUrl: payload.player?.day ?? payload.player?.live ?? null,
    lastUpdatedAt: payload.lastUpdatedOn ?? null,
    isLive: Boolean(payload.player?.live),
    categories: payload.categories?.flatMap(({ name }) => (name ? [name] : [])) ?? [],
  };
}

export class WindyWebcamsProvider implements IWebcamsProvider {
  constructor(private readonly apiKey = process.env.WINDY_WEBCAMS_API_KEY) {}

  private async request<T>(path: string, signal?: AbortSignal): Promise<T> {
    if (!this.apiKey) {
      throw new WindyWebcamsError("Le service webcams n’est pas encore configuré", 503);
    }

    const response = await fetch(`${WINDY_WEBCAMS_API}${path}`, {
      headers: {
        Accept: "application/json",
        "x-windy-api-key": this.apiKey,
      },
      signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new WindyWebcamsError(
        response.status === 401 || response.status === 403
          ? "Le service webcams refuse temporairement l’accès"
          : "Le service webcams est momentanément indisponible",
        response.status,
      );
    }

    return (await response.json()) as T;
  }

  async findNearby({
    latitude,
    longitude,
    radiusKm,
    limit = 50,
    signal,
  }: NearbyWebcamsOptions): Promise<{ webcams: Webcam[]; total: number }> {
    const parameters = new URLSearchParams({
      nearby: `${latitude},${longitude},${radiusKm}`,
      include: INCLUDED_PARTS,
      lang: "fr",
      limit: String(limit),
    });
    const payload = await this.request<WindyWebcamsResponse>(
      `/webcams?${parameters.toString()}`,
      signal,
    );

    return {
      webcams: (payload.webcams ?? []).map(toWebcam),
      total: payload.total ?? payload.webcams?.length ?? 0,
    };
  }

  async findById(id: string, signal?: AbortSignal): Promise<Webcam> {
    const parameters = new URLSearchParams({ include: INCLUDED_PARTS, lang: "fr" });
    const payload = await this.request<WindyWebcamPayload>(
      `/webcams/${encodeURIComponent(id)}?${parameters.toString()}`,
      signal,
    );
    return toWebcam(payload);
  }
}
