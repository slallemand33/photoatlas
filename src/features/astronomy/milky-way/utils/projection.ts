import type { AstronomyLocation, SkyPosition } from "../../types";
import type {
  MapCoordinate,
  MilkyWayMapPlan,
  MilkyWaySample,
  MilkyWayTrajectory,
  ProjectedMilkyWayPoint,
} from "../types";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function destinationPoint(
  location: AstronomyLocation,
  bearing: number,
  distanceKm: number,
): MapCoordinate {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearingRadians = toRadians(bearing);
  const latitude = toRadians(location.latitude);
  const longitude = toRadians(location.longitude);
  const destinationLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance) +
      Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearingRadians),
  );
  const destinationLongitude =
    longitude +
    Math.atan2(
      Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitude),
      Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(destinationLatitude),
    );

  return [
    ((((toDegrees(destinationLongitude) + 180) % 360) + 360) % 360) - 180,
    toDegrees(destinationLatitude),
  ];
}

export function getProjectionRadiusKm(zoom: number): number {
  return Math.min(100, Math.max(0.12, 50 * 2 ** (7 - zoom)));
}

function projectPosition(
  location: AstronomyLocation,
  position: SkyPosition,
  radiusKm: number,
): MapCoordinate {
  const altitude = Math.max(0, Math.min(90, position.altitude));
  const distance = Math.max(radiusKm * 0.08, radiusKm * (1 - altitude / 90));
  return destinationPoint(location, position.azimuth, distance);
}

function projectSample(
  location: AstronomyLocation,
  sample: MilkyWaySample,
  radiusKm: number,
): ProjectedMilkyWayPoint {
  return {
    ...sample,
    coordinate: projectPosition(location, sample.position, radiusKm),
  };
}

export function projectMilkyWayPlan(
  location: AstronomyLocation,
  selectedTime: string,
  currentSky: MilkyWayMapPlan["currentSky"],
  trajectory: MilkyWayTrajectory,
  radiusKm: number,
): MilkyWayMapPlan {
  const reference: MapCoordinate = [location.longitude, location.latitude];
  const currentSample = { time: selectedTime, position: currentSky.core };
  const horizonRing = Array.from({ length: 65 }, (_, index) =>
    destinationPoint(location, (index / 64) * 360, radiusKm),
  );
  const cardinalPoints = (
    [
      ["N", 0],
      ["E", 90],
      ["S", 180],
      ["O", 270],
    ] as const
  ).map(([direction, bearing]) => ({
    direction,
    coordinate: destinationPoint(location, bearing, radiusKm * 1.08),
  }));

  return {
    reference,
    radiusKm,
    selectedTime,
    currentSky,
    currentCore: projectSample(location, currentSample, radiusKm),
    directionLine: [
      destinationPoint(location, currentSky.antiCenter.azimuth, radiusKm),
      reference,
      destinationPoint(location, currentSky.core.azimuth, radiusKm),
    ],
    horizonRing,
    cardinalPoints,
    trajectorySegments: trajectory.visibleSegments.map((segment) =>
      segment.map((sample) => projectSample(location, sample, radiusKm)),
    ),
    culmination: trajectory.culmination
      ? projectSample(location, trajectory.culmination, radiusKm)
      : null,
    disappearance: trajectory.disappearance
      ? projectSample(location, trajectory.disappearance, radiusKm)
      : null,
    annotations: trajectory.samples
      .filter((sample, index) => sample.position.aboveHorizon && index % 3 === 0)
      .map((sample) => projectSample(location, sample, radiusKm)),
  };
}
