export interface LightningBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type LightningIntensity = "low" | "medium" | "high";

export interface LightningStrike {
  id: string;
  latitude: number;
  longitude: number;
  occurredAt: number;
  intensity: LightningIntensity;
}

export interface LightningSnapshot {
  strikes: LightningStrike[];
  updatedAt: number;
  provider: string;
  simulated: boolean;
  bounds: LightningBounds;
}

export interface ILightningProvider {
  readonly name: string;
  readonly simulated: boolean;
  getStrikes(bounds: LightningBounds, signal?: AbortSignal): Promise<LightningSnapshot>;
}

export type LightningActivityLevel = "none" | "low" | "moderate" | "high";

export interface LightningActivity {
  level: LightningActivityLevel;
  label: "Aucune activité" | "Faible" | "Modérée" | "Forte";
  distanceKm: number | null;
  lastActivityAt: number | null;
  nearbyStrikeCount: number;
  simulated: boolean;
}

export interface LightningLocation {
  latitude: number;
  longitude: number;
}
