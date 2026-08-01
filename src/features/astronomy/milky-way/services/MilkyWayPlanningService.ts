import { astronomyService } from "../../services";
import type { AstronomyLocation, MilkyWaySkyPosition } from "../../types";
import type { MilkyWayPlanningInput, MilkyWaySample, MilkyWayTrajectory } from "../types";

const DEFAULT_SAMPLE_MINUTES = 20;

function splitVisibleSegments(samples: MilkyWaySample[]): MilkyWaySample[][] {
  const segments: MilkyWaySample[][] = [];
  let segment: MilkyWaySample[] = [];

  for (const sample of samples) {
    if (sample.position.aboveHorizon) {
      segment.push(sample);
    } else if (segment.length > 0) {
      segments.push(segment);
      segment = [];
    }
  }
  if (segment.length > 0) segments.push(segment);
  return segments;
}

export class MilkyWayPlanningService {
  calculateTrajectory({
    location,
    start,
    end,
    sampleMinutes = DEFAULT_SAMPLE_MINUTES,
  }: MilkyWayPlanningInput): MilkyWayTrajectory {
    const stepMs = Math.max(5, sampleMinutes) * 60_000;
    const samples: MilkyWaySample[] = [];

    for (let timestamp = start.getTime(); timestamp <= end.getTime(); timestamp += stepMs) {
      const date = new Date(timestamp);
      samples.push({
        time: date.toISOString(),
        position: astronomyService.getGalacticCenterPosition(location, date),
      });
    }

    const visibleSamples = samples.filter((sample) => sample.position.aboveHorizon);
    const culmination =
      visibleSamples.reduce<MilkyWaySample | null>(
        (highest, sample) =>
          !highest || sample.position.altitude > highest.position.altitude ? sample : highest,
        null,
      ) ?? null;
    let disappearance: MilkyWaySample | null = null;
    for (let index = 0; index < samples.length - 1; index += 1) {
      const sample = samples[index];
      const nextSample = samples[index + 1];
      if (sample?.position.aboveHorizon && !nextSample?.position.aboveHorizon) {
        disappearance = sample;
      }
    }

    return {
      samples,
      visibleSegments: splitVisibleSegments(samples),
      culmination,
      disappearance: disappearance ?? visibleSamples.at(-1) ?? null,
    };
  }

  calculatePosition(location: AstronomyLocation, date: Date): MilkyWaySkyPosition {
    return astronomyService.getMilkyWayPosition(location, date);
  }
}

export const milkyWayPlanningService = new MilkyWayPlanningService();
