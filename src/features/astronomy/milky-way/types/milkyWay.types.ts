import type { AstronomyLocation, MilkyWaySkyPosition, SkyPosition } from "../../types";

export type MapCoordinate = [longitude: number, latitude: number];

export interface MilkyWaySample {
  time: string;
  position: SkyPosition;
}

export interface MilkyWayTrajectory {
  samples: MilkyWaySample[];
  visibleSegments: MilkyWaySample[][];
  culmination: MilkyWaySample | null;
  disappearance: MilkyWaySample | null;
}

export interface MilkyWayPlanningInput {
  location: AstronomyLocation;
  start: Date;
  end: Date;
  sampleMinutes?: number;
}

export interface ProjectedMilkyWayPoint extends MilkyWaySample {
  coordinate: MapCoordinate;
}

export interface MilkyWayMapPlan {
  reference: MapCoordinate;
  radiusKm: number;
  selectedTime: string;
  currentSky: MilkyWaySkyPosition;
  currentCore: ProjectedMilkyWayPoint;
  directionLine: MapCoordinate[];
  horizonRing: MapCoordinate[];
  cardinalPoints: Array<{ direction: "N" | "E" | "S" | "O"; coordinate: MapCoordinate }>;
  trajectorySegments: ProjectedMilkyWayPoint[][];
  culmination: ProjectedMilkyWayPoint | null;
  disappearance: ProjectedMilkyWayPoint | null;
  annotations: ProjectedMilkyWayPoint[];
}
