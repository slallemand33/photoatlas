import { Body, Equator, Horizon, Observer, SearchRiseSet } from "astronomy-engine";

import { astronomyService } from "@/features/astronomy/services";
import type { SkyPosition } from "@/features/astronomy/types";
import { getCardinalDirection } from "@/features/astronomy/utils";

import type { BodyGuide, GuideLocation, PhotoGuidePlan } from "../types";

function position(body: Body, observer: Observer, date: Date): SkyPosition {
  const equator = Equator(body, date, observer, true, true);
  const horizon = Horizon(date, observer, equator.ra, equator.dec, "normal");
  return {
    azimuth: Math.round(horizon.azimuth * 10) / 10,
    altitude: Math.round(horizon.altitude * 10) / 10,
    cardinalDirection: getCardinalDirection(horizon.azimuth),
    aboveHorizon: horizon.altitude > 0,
  };
}

function bodyGuide(body: Body, observer: Observer, date: Date): BodyGuide {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const rise = SearchRiseSet(body, observer, 1, dayStart, 2);
  const set = SearchRiseSet(body, observer, -1, dayStart, 2);
  return {
    current: position(body, observer, date),
    rise: rise ? position(body, observer, rise.date) : null,
    riseTime: rise?.date.toISOString() ?? null,
    set: set ? position(body, observer, set.date) : null,
    setTime: set?.date.toISOString() ?? null,
  };
}

export class GuideEngine {
  calculate(location: GuideLocation, date: Date, start: Date, end: Date): PhotoGuidePlan {
    const observer = new Observer(location.latitude, location.longitude, 0);
    const trajectory: PhotoGuidePlan["milkyWay"]["trajectory"] = [];
    for (let time = start.getTime(); time <= end.getTime(); time += 20 * 60_000) {
      const sampleDate = new Date(time);
      trajectory.push({
        time: sampleDate.toISOString(),
        position: astronomyService.getGalacticCenterPosition(location, sampleDate),
      });
    }
    const visible = trajectory.filter((sample) => sample.position.aboveHorizon);
    const culmination = visible.reduce<(typeof visible)[number] | null>(
      (best, sample) =>
        !best || sample.position.altitude > best.position.altitude ? sample : best,
      null,
    );
    return {
      reference: location,
      selectedTime: date.toISOString(),
      sun: bodyGuide(Body.Sun, observer, date),
      moon: bodyGuide(Body.Moon, observer, date),
      milkyWay: {
        current: astronomyService.getGalacticCenterPosition(location, date),
        trajectory,
        culmination,
      },
    };
  }
}

export const guideEngine = new GuideEngine();
