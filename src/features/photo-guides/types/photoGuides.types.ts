import type { SkyPosition } from "@/features/astronomy/types";

export type PhotoGuideId = "sun" | "moon" | "milkyWay";
export interface GuideLocation {
  latitude: number;
  longitude: number;
}
export interface BodyGuide {
  current: SkyPosition;
  rise: SkyPosition | null;
  riseTime: string | null;
  set: SkyPosition | null;
  setTime: string | null;
}
export interface PhotoGuidePlan {
  reference: GuideLocation;
  selectedTime: string;
  sun: BodyGuide;
  moon: BodyGuide;
  milkyWay: {
    current: SkyPosition;
    trajectory: Array<{ time: string; position: SkyPosition }>;
    culmination: { time: string; position: SkyPosition } | null;
  };
}
