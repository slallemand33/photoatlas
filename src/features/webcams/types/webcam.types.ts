export interface WebcamLocation {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
}

export interface Webcam {
  id: string;
  title: string;
  status: "active" | "inactive";
  location: WebcamLocation;
  distanceKm: number | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  source: "Windy Webcams";
  sourceUrl: string;
  playerUrl: string | null;
  lastUpdatedAt: string | null;
  isLive: boolean;
  categories: string[];
}

export interface NearbyWebcamsResult {
  webcams: Webcam[];
  total: number;
  radiusKm: number;
  fetchedAt: string;
}

export interface NearbyWebcamsOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface WebcamReferenceLocation {
  latitude: number;
  longitude: number;
}

export interface IWebcamsProvider {
  findNearby(options: NearbyWebcamsOptions): Promise<{ webcams: Webcam[]; total: number }>;
  findById(id: string, signal?: AbortSignal): Promise<Webcam>;
}
