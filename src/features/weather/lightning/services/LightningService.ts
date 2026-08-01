import type { ILightningProvider, LightningBounds, LightningSnapshot } from "../types";

import { OpenWeatherLightningProvider } from "./OpenWeatherLightningProvider";

export class LightningService {
  constructor(private provider: ILightningProvider) {}

  setProvider(provider: ILightningProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getStrikes(bounds: LightningBounds, signal?: AbortSignal): Promise<LightningSnapshot> {
    return this.provider.getStrikes(bounds, signal);
  }
}

export const lightningService = new LightningService(new OpenWeatherLightningProvider());
