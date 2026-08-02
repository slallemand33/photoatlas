import type { AstronomySnapshot } from "@/features/astronomy/types";
import type { LightPollutionEstimate } from "@/features/layers/light-pollution";
import type { LightningActivity } from "@/features/weather/lightning";
import type { RainAtLocation } from "@/features/weather/radar";
import type { PhotoWeatherSnapshot } from "@/features/weather/types";

export type PhotoRecommendationKind = "astro" | "sunrise" | "sunset" | "landscape" | "storms";

export interface PhotoScoreInput {
  calculatedAt: string;
  weather: PhotoWeatherSnapshot;
  astronomy: AstronomySnapshot;
  lightPollution?: LightPollutionEstimate;
  radar?: RainAtLocation;
  lightning?: LightningActivity;
}

export interface PhotoRecommendation {
  kind: PhotoRecommendationKind;
  title: string;
  score: number;
  stars: number;
  summary: string;
  explanation: string;
  strengths: string[];
  cautions: string[];
  recommendedTime: string | null;
  departureTime: string | null;
  confidence: "complète" | "bonne" | "partielle";
}

export type PhotoTimelineEventKind =
  | "blue-hour"
  | "golden-hour"
  | "sunrise"
  | "sunset"
  | "astronomical-night"
  | "milky-way"
  | "moonrise";

export interface PhotoTimelineEvent {
  id: string;
  kind: PhotoTimelineEventKind;
  label: string;
  time: string;
  score: number | null;
  stars: number | null;
}

export interface PhotoScoreResult {
  calculatedAt: string;
  recommendations: PhotoRecommendation[];
  rankedRecommendations: PhotoRecommendation[];
  timeline: PhotoTimelineEvent[];
  bestRecommendation: PhotoRecommendation;
}

export interface IPhotoScoreEngine {
  calculate(input: PhotoScoreInput): PhotoScoreResult;
}
