import {
  Body,
  DefineStar,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
  Observer,
  SearchAltitude,
  SearchHourAngle,
  SearchRiseSet,
  type AstroTime,
} from "astronomy-engine";

import type {
  AstronomyLocation,
  AstronomySnapshot,
  DailyLightWindows,
  GalacticCenterEvents,
  IAstronomyService,
  SkyPosition,
  TimeInterval,
  TwilightWindows,
} from "../types";
import { getCardinalDirection, getMoonPhaseName } from "../utils";

const GALACTIC_CENTER_RA_HOURS = 17 + 45 / 60 + 40.04 / 3600;
const GALACTIC_CENTER_DEC_DEGREES = -(29 + 0 / 60 + 28.1 / 3600);
const GALACTIC_ANTI_CENTER_RA_HOURS = 5 + 45 / 60 + 37.2 / 3600;
const GALACTIC_ANTI_CENTER_DEC_DEGREES = 28 + 56 / 60 + 10.2 / 3600;
const GALACTIC_CENTER_DISTANCE_LIGHT_YEARS = 26_000;

DefineStar(
  Body.Star1,
  GALACTIC_CENTER_RA_HOURS,
  GALACTIC_CENTER_DEC_DEGREES,
  GALACTIC_CENTER_DISTANCE_LIGHT_YEARS,
);
DefineStar(
  Body.Star2,
  GALACTIC_ANTI_CENTER_RA_HOURS,
  GALACTIC_ANTI_CENTER_DEC_DEGREES,
  GALACTIC_CENTER_DISTANCE_LIGHT_YEARS,
);

function toIso(time: AstroTime | null): string | null {
  return time?.date.toISOString() ?? null;
}

function after(value: string | null, fallback: Date): Date {
  return value ? new Date(new Date(value).getTime() + 60_000) : fallback;
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function searchAltitude(
  observer: Observer,
  start: Date,
  direction: 1 | -1,
  altitude: number,
  limitDays = 2,
): string | null {
  return toIso(SearchAltitude(Body.Sun, observer, direction, start, limitDays, altitude));
}

function searchRiseSet(
  body: Body,
  observer: Observer,
  direction: 1 | -1,
  start: Date,
  limitDays = 2,
): string | null {
  return toIso(SearchRiseSet(body, observer, direction, start, limitDays));
}

function getGoldenHours(observer: Observer, date: Date): DailyLightWindows {
  const morningStart = searchRiseSet(Body.Sun, observer, 1, date);
  const morningEnd = searchAltitude(observer, after(morningStart, date), 1, 6, 1);
  const eveningStart = searchAltitude(observer, date, -1, 6);
  const eveningEnd = searchRiseSet(Body.Sun, observer, -1, after(eveningStart, date), 1);

  return {
    morning: { start: morningStart, end: morningEnd },
    evening: { start: eveningStart, end: eveningEnd },
  };
}

function getBlueHours(observer: Observer, date: Date): DailyLightWindows {
  const morningStart = searchAltitude(observer, date, 1, -6);
  const morningEnd = searchAltitude(observer, after(morningStart, date), 1, -4, 1);
  const eveningStart = searchAltitude(observer, date, -1, -4);
  const eveningEnd = searchAltitude(observer, after(eveningStart, date), -1, -6, 1);

  return {
    morning: { start: morningStart, end: morningEnd },
    evening: { start: eveningStart, end: eveningEnd },
  };
}

function getTwilightBand(
  observer: Observer,
  date: Date,
  lowerAltitude: number,
  upperAltitude: number,
): DailyLightWindows {
  const morningStart = searchAltitude(observer, date, 1, lowerAltitude);
  const morningEnd =
    upperAltitude === 0
      ? searchRiseSet(Body.Sun, observer, 1, after(morningStart, date), 1)
      : searchAltitude(observer, after(morningStart, date), 1, upperAltitude, 1);
  const eveningStart =
    upperAltitude === 0
      ? searchRiseSet(Body.Sun, observer, -1, date)
      : searchAltitude(observer, date, -1, upperAltitude);
  const eveningEnd = searchAltitude(observer, after(eveningStart, date), -1, lowerAltitude, 1);

  return {
    morning: { start: morningStart, end: morningEnd },
    evening: { start: eveningStart, end: eveningEnd },
  };
}

function getTwilights(observer: Observer, date: Date): TwilightWindows {
  return {
    civil: getTwilightBand(observer, date, -6, 0),
    nautical: getTwilightBand(observer, date, -12, -6),
    astronomical: getTwilightBand(observer, date, -18, -12),
  };
}

function getAstronomicalNight(
  observer: Observer,
  date: Date,
  currentSunAltitude: number,
): TimeInterval {
  const start =
    currentSunAltitude <= -18
      ? searchAltitude(observer, date, -1, -18, -2)
      : searchAltitude(observer, date, -1, -18);
  const end = searchAltitude(observer, after(start, date), 1, -18, 2);
  return { start, end };
}

function getFixedSkyPosition(
  observer: Observer,
  date: Date,
  rightAscension: number,
  declination: number,
): SkyPosition {
  const horizon = Horizon(date, observer, rightAscension, declination, "normal");
  return {
    azimuth: round(horizon.azimuth),
    altitude: round(horizon.altitude),
    cardinalDirection: getCardinalDirection(horizon.azimuth),
    aboveHorizon: horizon.altitude > 0,
  };
}

function getGalacticCenterEvents(observer: Observer, date: Date): GalacticCenterEvents {
  const transit = SearchHourAngle(Body.Star1, observer, 0, date);
  return {
    position: getFixedSkyPosition(
      observer,
      date,
      GALACTIC_CENTER_RA_HOURS,
      GALACTIC_CENTER_DEC_DEGREES,
    ),
    rise: searchRiseSet(Body.Star1, observer, 1, date),
    set: searchRiseSet(Body.Star1, observer, -1, date),
    transit: transit.time.date.toISOString(),
    transitAltitude: round(transit.hor.altitude),
  };
}

export class AstronomyService implements IAstronomyService {
  calculate(location: AstronomyLocation, date = new Date()): AstronomySnapshot {
    const normalizedLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      elevationMeters: location.elevationMeters ?? 0,
    };
    const observer = new Observer(
      normalizedLocation.latitude,
      normalizedLocation.longitude,
      normalizedLocation.elevationMeters,
    );
    const sunEquator = Equator(Body.Sun, date, observer, true, true);
    const currentSun = Horizon(date, observer, sunEquator.ra, sunEquator.dec, "normal");
    const moonIllumination = Illumination(Body.Moon, date);
    const phaseAngle = MoonPhase(date);
    const core = getGalacticCenterEvents(observer, date);
    const antiCenter = getFixedSkyPosition(
      observer,
      date,
      GALACTIC_ANTI_CENTER_RA_HOURS,
      GALACTIC_ANTI_CENTER_DEC_DEGREES,
    );

    return {
      calculatedAt: date.toISOString(),
      location: normalizedLocation,
      sun: {
        rise: searchRiseSet(Body.Sun, observer, 1, date),
        set: searchRiseSet(Body.Sun, observer, -1, date),
        goldenHour: getGoldenHours(observer, date),
        blueHour: getBlueHours(observer, date),
        twilight: getTwilights(observer, date),
        astronomicalNight: getAstronomicalNight(observer, date, currentSun.altitude),
      },
      moon: {
        rise: searchRiseSet(Body.Moon, observer, 1, date),
        set: searchRiseSet(Body.Moon, observer, -1, date),
        phaseAngle: round(phaseAngle),
        illuminatedFraction: round(moonIllumination.phase_fraction * 100),
        phaseName: getMoonPhaseName(phaseAngle),
      },
      milkyWay: {
        visible: core.position.aboveHorizon && currentSun.altitude <= -12,
        core,
        antiCenter,
      },
    };
  }

  getGalacticCenterPosition(location: AstronomyLocation, date: Date): SkyPosition {
    const observer = new Observer(
      location.latitude,
      location.longitude,
      location.elevationMeters ?? 0,
    );
    return getFixedSkyPosition(
      observer,
      date,
      GALACTIC_CENTER_RA_HOURS,
      GALACTIC_CENTER_DEC_DEGREES,
    );
  }
}

export const astronomyService = new AstronomyService();
