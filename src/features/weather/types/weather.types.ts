export interface WeatherLocation {
  latitude: number;
  longitude: number;
}

export interface CloudCoverSnapshot extends WeatherLocation {
  observedAt: string;
  total: number;
  low: number;
  mid: number;
  high: number;
}

export interface WeatherProvider {
  getCloudCover(locations: WeatherLocation[], signal?: AbortSignal): Promise<CloudCoverSnapshot[]>;
}

export interface CloudPhotoQuality {
  stars: number;
  label: "Excellent" | "Très bon" | "Bon" | "Moyen" | "Mauvais";
}

export interface CloudTileProvider {
  readonly id: string;
  readonly name: string;
  readonly attribution: string;
  readonly tileSize: number;
  readonly maxZoom: number;
  getTileUrl(): string;
}
