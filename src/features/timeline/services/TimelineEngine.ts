import { Body, Equator, Horizon, Observer, SearchHourAngle } from "astronomy-engine";

import { astronomyService } from "@/features/astronomy/services";

import type {
  TimelineBand,
  TimelineEvent,
  TimelineEventKind,
  TimelineLocation,
  TimelineResult,
} from "../types";

function minuteOf(iso: string, startMs: number): number {
  return Math.max(0, Math.min(1440, Math.round((new Date(iso).getTime() - startMs) / 60_000)));
}

export class TimelineEngine {
  getUpcoming(result: TimelineResult, reference: Date, count = 3) {
    const referenceMs = reference.getTime();
    return result.events
      .filter((event) => new Date(event.time).getTime() >= referenceMs)
      .slice(0, count)
      .map((event) => {
        const remainingMinutes = Math.max(
          0,
          Math.round((new Date(event.time).getTime() - referenceMs) / 60_000),
        );
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        return {
          ...event,
          remainingMinutes,
          remainingLabel:
            hours > 0
              ? `Dans ${hours} h ${String(minutes).padStart(2, "0")}`
              : `Dans ${minutes} min`,
        };
      });
  }

  getGuideFocusTime(guide: "sun" | "milkyWay", result: TimelineResult, now: Date): Date {
    if (guide === "sun") return now;
    const night = result.events.find(
      (event) => event.kind === "astronomical" && event.label.includes("soir"),
    );
    return night ? new Date(night.time) : now;
  }

  calculate(location: TimelineLocation, date: Date): TimelineResult {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const startMs = start.getTime();
    const astronomy = astronomyService.calculate(location, start);
    const observer = new Observer(location.latitude, location.longitude, 0);
    const events: TimelineEvent[] = [];
    const add = (kind: TimelineEventKind, label: string, icon: string, time: string | null) => {
      const timestamp = time ? new Date(time).getTime() : Number.NaN;
      if (time && timestamp >= startMs && timestamp < end.getTime())
        events.push({
          id: `${kind}-${time}`,
          kind,
          label,
          icon,
          time,
          minute: minuteOf(time, startMs),
        });
    };
    add("night", "Nuit astronomique", "🌌", astronomy.sun.astronomicalNight.end);
    add(
      "astronomical",
      "Crépuscule astronomique matin",
      "🌌",
      astronomy.sun.twilight.astronomical.morning.start,
    );
    add(
      "nautical",
      "Crépuscule nautique matin",
      "🌊",
      astronomy.sun.twilight.nautical.morning.start,
    );
    add("civil", "Crépuscule civil matin", "🌇", astronomy.sun.twilight.civil.morning.start);
    add("blue", "Blue Hour matin", "🌅", astronomy.sun.blueHour.morning.start);
    add("golden", "Golden Hour matin", "🌅", astronomy.sun.goldenHour.morning.start);
    add("sunrise", "Lever du Soleil", "☀", astronomy.sun.rise);
    const noon = SearchHourAngle(Body.Sun, observer, 0, start).time.date.toISOString();
    add("solar-noon", "Midi solaire", "☀", noon);
    add("golden", "Golden Hour soir", "🌇", astronomy.sun.goldenHour.evening.start);
    add("sunset", "Coucher du Soleil", "☀", astronomy.sun.set);
    add("blue", "Blue Hour soir", "🌅", astronomy.sun.blueHour.evening.start);
    add("civil", "Crépuscule civil soir", "🌇", astronomy.sun.twilight.civil.evening.end);
    add("nautical", "Crépuscule nautique soir", "🌊", astronomy.sun.twilight.nautical.evening.end);
    add(
      "astronomical",
      "Crépuscule astronomique soir",
      "🌌",
      astronomy.sun.twilight.astronomical.evening.end,
    );
    add("moonrise", "Lever de la Lune", "🌙", astronomy.moon.rise);
    add("moonset", "Coucher de la Lune", "🌙", astronomy.moon.set);
    add(
      "milky-way-transit",
      "Noyau galactique au plus haut",
      "🌌",
      astronomy.milkyWay.core.transit,
    );

    const visibility: Array<{ time: Date; visible: boolean }> = [];
    for (let ms = startMs; ms <= end.getTime(); ms += 10 * 60_000) {
      const sample = new Date(ms);
      const sunEq = Equator(Body.Sun, sample, observer, true, true);
      const sunAlt = Horizon(sample, observer, sunEq.ra, sunEq.dec, "normal").altitude;
      const core = astronomyService.getGalacticCenterPosition(location, sample);
      visibility.push({ time: sample, visible: core.aboveHorizon && sunAlt <= -12 });
    }
    const bands: TimelineBand[] = [];
    let visibleStart: Date | null = null;
    visibility.forEach((sample, index) => {
      if (sample.visible && !visibleStart) {
        visibleStart = sample.time;
        add(
          "milky-way-start",
          "Début de visibilité de la Voie Lactée",
          "🌌",
          sample.time.toISOString(),
        );
      }
      if (visibleStart && (!sample.visible || index === visibility.length - 1)) {
        const finish = sample.time;
        add("milky-way-end", "Fin de visibilité de la Voie Lactée", "🌌", finish.toISOString());
        bands.push({
          id: `mw-${visibleStart.toISOString()}`,
          kind: "milky-way",
          label: "Voie Lactée visible",
          startMinute: minuteOf(visibleStart.toISOString(), startMs),
          endMinute: minuteOf(finish.toISOString(), startMs),
        });
        visibleStart = null;
      }
    });
    const interval = (
      kind: TimelineBand["kind"],
      label: string,
      a: string | null,
      b: string | null,
    ) => {
      if (a && b)
        bands.push({
          id: `${kind}-${a}`,
          kind,
          label,
          startMinute: minuteOf(a, startMs),
          endMinute: minuteOf(b, startMs),
        });
    };
    interval(
      "blue",
      "Blue Hour matin",
      astronomy.sun.blueHour.morning.start,
      astronomy.sun.blueHour.morning.end,
    );
    if (astronomy.sun.astronomicalNight.end)
      bands.push({
        id: "night-morning",
        kind: "night",
        label: "Nuit astronomique",
        startMinute: 0,
        endMinute: minuteOf(astronomy.sun.astronomicalNight.end, startMs),
      });
    interval(
      "astronomical",
      "Crépuscule astronomique matin",
      astronomy.sun.twilight.astronomical.morning.start,
      astronomy.sun.twilight.astronomical.morning.end,
    );
    interval(
      "nautical",
      "Crépuscule nautique matin",
      astronomy.sun.twilight.nautical.morning.start,
      astronomy.sun.twilight.nautical.morning.end,
    );
    interval(
      "golden",
      "Golden Hour matin",
      astronomy.sun.goldenHour.morning.start,
      astronomy.sun.goldenHour.morning.end,
    );
    interval("day", "Journée", astronomy.sun.rise, astronomy.sun.set);
    interval(
      "golden",
      "Golden Hour soir",
      astronomy.sun.goldenHour.evening.start,
      astronomy.sun.goldenHour.evening.end,
    );
    interval(
      "blue",
      "Blue Hour soir",
      astronomy.sun.blueHour.evening.start,
      astronomy.sun.blueHour.evening.end,
    );
    interval(
      "nautical",
      "Crépuscule nautique soir",
      astronomy.sun.twilight.nautical.evening.start,
      astronomy.sun.twilight.nautical.evening.end,
    );
    interval(
      "astronomical",
      "Crépuscule astronomique soir",
      astronomy.sun.twilight.astronomical.evening.start,
      astronomy.sun.twilight.astronomical.evening.end,
    );
    if (astronomy.sun.twilight.astronomical.evening.end)
      bands.push({
        id: "night-evening",
        kind: "night",
        label: "Nuit astronomique",
        startMinute: minuteOf(astronomy.sun.twilight.astronomical.evening.end, startMs),
        endMinute: 1440,
      });
    interval(
      "civil",
      "Crépuscule civil matin",
      astronomy.sun.twilight.civil.morning.start,
      astronomy.sun.twilight.civil.morning.end,
    );
    interval(
      "civil",
      "Crépuscule civil soir",
      astronomy.sun.twilight.civil.evening.start,
      astronomy.sun.twilight.civil.evening.end,
    );
    events.sort((a, b) => a.minute - b.minute);
    return { dayStart: start.toISOString(), dayEnd: end.toISOString(), astronomy, events, bands };
  }
}
export const timelineEngine = new TimelineEngine();
