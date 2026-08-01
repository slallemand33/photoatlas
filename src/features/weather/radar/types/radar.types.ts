export interface RainViewerFrame {
  id: string;
  time: number;
  path: string;
  tileUrl: string;
}

export interface RadarTimeline {
  generatedAt: number;
  frames: RainViewerFrame[];
}

export type RadarPlaybackSpeed = 500 | 1000 | 1500 | 2500;

export type RainIntensity = "none" | "light" | "moderate" | "heavy";

export interface RainAtLocation {
  intensity: RainIntensity;
  label: "Pas de pluie" | "Faible pluie" | "Pluie modérée" | "Forte pluie";
  signal: number;
  frameTime: number;
}

export interface RadarLocation {
  latitude: number;
  longitude: number;
}

export interface IRadarService {
  getTimeline(signal?: AbortSignal): Promise<RadarTimeline>;
  getRainAtLocation(
    frame: RainViewerFrame,
    location: RadarLocation,
    signal?: AbortSignal,
  ): Promise<RainAtLocation>;
}
