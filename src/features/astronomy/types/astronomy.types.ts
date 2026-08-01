export interface AstronomyLocation {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface TimeInterval {
  start: string | null;
  end: string | null;
}

export interface DailyLightWindows {
  morning: TimeInterval;
  evening: TimeInterval;
}

export interface TwilightWindows {
  civil: DailyLightWindows;
  nautical: DailyLightWindows;
  astronomical: DailyLightWindows;
}

export interface SunEvents {
  rise: string | null;
  set: string | null;
  goldenHour: DailyLightWindows;
  blueHour: DailyLightWindows;
  twilight: TwilightWindows;
  astronomicalNight: TimeInterval;
}

export type MoonPhaseName =
  | "Nouvelle lune"
  | "Premier croissant"
  | "Premier quartier"
  | "Gibbeuse croissante"
  | "Pleine lune"
  | "Gibbeuse décroissante"
  | "Dernier quartier"
  | "Dernier croissant";

export interface MoonEvents {
  rise: string | null;
  set: string | null;
  phaseAngle: number;
  illuminatedFraction: number;
  phaseName: MoonPhaseName;
}

export interface SkyPosition {
  azimuth: number;
  altitude: number;
  cardinalDirection: string;
  aboveHorizon: boolean;
}

export interface GalacticCenterEvents {
  position: SkyPosition;
  rise: string | null;
  set: string | null;
  transit: string | null;
  transitAltitude: number | null;
}

export interface MilkyWayEvents {
  visible: boolean;
  core: GalacticCenterEvents;
  antiCenter: SkyPosition;
}

export interface MilkyWaySkyPosition {
  core: SkyPosition;
  antiCenter: SkyPosition;
}

export interface AstronomySnapshot {
  calculatedAt: string;
  location: Required<AstronomyLocation>;
  sun: SunEvents;
  moon: MoonEvents;
  milkyWay: MilkyWayEvents;
}

export interface IAstronomyService {
  calculate(location: AstronomyLocation, date?: Date): AstronomySnapshot;
  getGalacticCenterPosition(location: AstronomyLocation, date: Date): SkyPosition;
  getMilkyWayPosition(location: AstronomyLocation, date: Date): MilkyWaySkyPosition;
}
