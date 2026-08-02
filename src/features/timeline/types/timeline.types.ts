import type { AstronomySnapshot } from "@/features/astronomy/types";

export type TimelineEventKind =
  | "night"
  | "astronomical"
  | "nautical"
  | "civil"
  | "blue"
  | "golden"
  | "sunrise"
  | "solar-noon"
  | "sunset"
  | "moonrise"
  | "moonset"
  | "milky-way-start"
  | "milky-way-end"
  | "milky-way-transit";
export type TimelineBandKind =
  "night" | "astronomical" | "nautical" | "civil" | "blue" | "golden" | "day" | "milky-way";
export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  label: string;
  icon: string;
  time: string;
  minute: number;
}
export interface TimelineBand {
  id: string;
  kind: TimelineBandKind;
  label: string;
  startMinute: number;
  endMinute: number;
}
export interface TimelineResult {
  dayStart: string;
  dayEnd: string;
  astronomy: AstronomySnapshot;
  events: TimelineEvent[];
  bands: TimelineBand[];
}
export interface TimelineLocation {
  latitude: number;
  longitude: number;
}
