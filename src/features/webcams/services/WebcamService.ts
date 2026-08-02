import "server-only";

import type {
  IWebcamsProvider,
  NearbyWebcamsOptions,
  NearbyWebcamsResult,
  Webcam,
  WebcamReferenceLocation,
} from "../types";
import { getDistanceKm } from "../utils";

import { WindyWebcamsProvider } from "./WindyWebcamsProvider";

export class WebcamService {
  constructor(private readonly provider: IWebcamsProvider) {}

  async findNearby(options: NearbyWebcamsOptions): Promise<NearbyWebcamsResult> {
    const result = await this.provider.findNearby(options);
    const reference = { latitude: options.latitude, longitude: options.longitude };
    const webcams = result.webcams
      .map((webcam) => this.withDistance(webcam, reference))
      .filter((webcam) => webcam.status === "active")
      .sort((first, second) => (first.distanceKm ?? Infinity) - (second.distanceKm ?? Infinity));

    return {
      webcams,
      total: result.total,
      radiusKm: options.radiusKm,
      fetchedAt: new Date().toISOString(),
    };
  }

  async findById(
    id: string,
    reference?: WebcamReferenceLocation,
    signal?: AbortSignal,
  ): Promise<Webcam> {
    const webcam = await this.provider.findById(id, signal);
    return reference ? this.withDistance(webcam, reference) : webcam;
  }

  private withDistance(webcam: Webcam, reference: WebcamReferenceLocation): Webcam {
    return {
      ...webcam,
      distanceKm: getDistanceKm(reference, webcam.location),
    };
  }
}

export const webcamService = new WebcamService(new WindyWebcamsProvider());
