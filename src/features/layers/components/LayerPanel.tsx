"use client";

import { useLayers } from "../hooks/useLayers";
import { LayerItem } from "./LayerItem";

export function LayerPanel() {
  const layers = useLayers();
  const activeCount = layers.filter((l) => l.state.visible).length;

  return (
    <div className="flex flex-col">
      {/* En-tête de section */}
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Couches
        </span>
        {activeCount > 0 && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
            {activeCount}
          </span>
        )}
      </div>

      {/* Liste des couches */}
      <div className="flex flex-col divide-y divide-border/15">
        {layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}

