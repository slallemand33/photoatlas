import { LAYER_DEFINITIONS } from "../definitions";
import type { LayerDefinition, LayerGroup } from "../types";

class LayerRegistry {
  private readonly layers = new Map<string, LayerDefinition>();

  constructor() {
    LAYER_DEFINITIONS.forEach((def) => this.register(def));
  }

  register(definition: LayerDefinition): void {
    // Idempotent — safe lors du hot-reload Next.js
    this.layers.set(definition.id, definition);
  }

  get(id: string): LayerDefinition | undefined {
    return this.layers.get(id);
  }

  getAll(): LayerDefinition[] {
    return Array.from(this.layers.values());
  }

  getByGroup(group: LayerGroup): LayerDefinition[] {
    return this.getAll().filter((l) => l.group === group);
  }
}

export const registry = new LayerRegistry();
